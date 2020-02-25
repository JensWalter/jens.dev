---
layout: post
title:  "hosting a Cloudfront site with S3 and API Gateway"
date:   2017-05-09 13:08:54 +0200
tags: cloudformation cloudfront apigateway
---
Here my scenario I try to cover this time.

Scenario:
* host a webpage through S3 with Cloudfront as CDN
* host an API through ApiGateway with Cloudfront in front

As picture this would look like this:

![timer based event](/assets/cloudfront-s3-api-gateway.png)

The use case would be to host the API and static resources within one domain. The obvious perk of this architecture would be no more CORS dependency.

I use a CloudFormation template as project definition for this task.

So here is my YAML explained step-by-step (whole YAML is attached at the bottom).

I copied the header from an existing template since I have nothing to add here:

{% highlight YAML %}
AWSTemplateFormatVersion: '2010-09-09'
Resources:
{% endhighlight %}

First I create a S3 bucket to host my page sources.

{% highlight YAML %}
webUIBucket:
  Type: AWS::S3::Bucket
{% endhighlight %}

To host actual content in that bucket, I needed to create a bucket policy which allows public read access on its objects;

{% highlight YAML %}
webUIBucketPolicy:
  Type: AWS::S3::BucketPolicy
  Properties:
    Bucket:
      Ref: webUIBucket
    PolicyDocument:
      Version: 2012-10-17
      Statement:
        - Sid: AddPerm
          Effect: Allow
          Principal: "*"
          Action:
            - "s3:GetObject"
          Resource:
            - Fn::Join:
              - ""
              - - "arn:aws:s3:::"
                - Ref: webUIBucket
                - "/*"
{% endhighlight %}

Now I can define the API. In this case I use a sample HelloWorldAPI, just to demonstrate the API gateway setup.

This way, the URL structure would look like this:

{% highlight HTTP%}
https://woouj8k1g5.execute-api.eu-west-1.amazonaws.com/prod/v1/hello
{% endhighlight %}

{% highlight YAML %}
ApiGatewayRestApi:
  Type: AWS::ApiGateway::RestApi
  Properties:
    Name: hello-api
ApiGatewayV1Resource:
  Type: AWS::ApiGateway::Resource
  Properties:
    ParentId:
      Fn::GetAtt: [ ApiGatewayRestApi , RootResourceId]
    PathPart: v1
    RestApiId: !Ref ApiGatewayRestApi
ApiGatewayHelloResource:
  Type: AWS::ApiGateway::Resource
  Properties:
    ParentId: !Ref ApiGatewayV1Resource
    PathPart: hello
    RestApiId: !Ref ApiGatewayRestApi
ApiGatewayCreateResourceGetMethod:
  Type: AWS::ApiGateway::Method
  Properties:
    AuthorizationType: NONE
    HttpMethod: GET
    Integration:
      Type: MOCK
      RequestTemplates:
        application/json: '{"statusCode":200}'
      IntegrationResponses:
        - StatusCode: 200
          ResponseTemplates:
            application/json: '{"message":"hello world"}'
    MethodResponses:
      - StatusCode: 200
    ResourceId: !Ref ApiGatewayHelloResource
    RestApiId: !Ref ApiGatewayRestApi
ApiGatewayDeployment:
  Type: AWS::ApiGateway::Deployment
  DependsOn:
    - ApiGatewayCreateResourceGetMethod
  Properties:
    RestApiId: !Ref ApiGatewayRestApi
    StageName: prod
{% endhighlight %}

Now there comes the juicy part. The Cloudfront configuration is somewhat tricky since API-Gateway requires some adjustments to work.

{% highlight YAML %}
WebpageCDN:
  Type: AWS::CloudFront::Distribution
  DependsOn: #without those explicit depends, the creation just fails
    - ApiGatewayDeployment
    - webUIBucket
  Properties:
    DistributionConfig:
      DefaultCacheBehavior: #this section defines attached behaviors, first the S3 origin
        ForwardedValues:
          QueryString: true
        TargetOriginId: webpage #name of the origin
        ViewerProtocolPolicy: redirect-to-https
      CacheBehaviors: #second the behavior for the API Gateway
        - AllowedMethods: #allow all method for the backend to implement
            - DELETE
            - GET
            - HEAD
            - OPTIONS
            - PATCH
            - POST
            - PUT
          CachedMethods: #cache only on get requests
            - GET
            - HEAD
            - OPTIONS
          Compress: true
          ForwardedValues:
            Headers: #define explicit headers, since API Gateway doesn't work otherwise
              - Accept
              - Referer
              - Athorization
              - Content-Type
            QueryString: true #to transfer get parameters to the gateway
          PathPattern: "/v1/*" #path pattern after the Gateway stage identifier.
          TargetOriginId: api #id of the orignin
          ViewerProtocolPolicy: https-only #API Gateway only support https
      DefaultRootObject: index.html
      Enabled: true
      Origins:
        - DomainName: #define the s3 origin
            Fn::GetAtt: [ webUIBucket , "DomainName" ]
          Id: webpage
          S3OriginConfig:
            OriginAccessIdentity:
              Ref: AWS::NoValue
        - DomainName: #define the API Gateway origin
            Fn::Join:
              - ""
              - - Ref: ApiGatewayRestApi
                - ".execute-api."
                - Ref: AWS::Region
                - ".amazonaws.com"
          Id: api
          CustomOriginConfig:
            OriginProtocolPolicy: https-only #again API-Gateway only supports https
          OriginPath: /prod #name of the deployed stage
      PriceClass: PriceClass_100
{% endhighlight %}

To instantiate this template, just download the file and run the following command:

{% highlight bash %}
aws cloudformation create-stack --stack-name myteststack --template-body file://cf-cloudfront.yml --capabilities CAPABILITY_IAM
{% endhighlight %}

After waiting like forever, you can test your deployment with 2 separate curl commands.

{% highlight bash %}
#requesting the S3 bucket (you have to put some actual content into the bucket before calling)
curl https://d25qtz3cn2yuis.cloudfront.net/index.html
hello world.

#requesting the API Gateway
curl https://d25qtz3cn2yuis.cloudfront.net/v1/hello
{"message":"hello world"}
{% endhighlight %}

Here is the overall CloudFormation template:

[cf-cloudfront.yml template][1]

[1]:{{ site.url }}/assets/cf-cloudfront.yml
