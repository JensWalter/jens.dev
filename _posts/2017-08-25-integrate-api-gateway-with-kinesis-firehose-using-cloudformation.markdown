---
layout: post
title:  "Integrate API Gateway with Kinesis Firehose using CloudFormation"
date:   2017-08-24 10:08:54 +0200
tags: cloudformation firehose
---
Integrating API Gateway with other AWS Services can be pretty important to increase the scope of an API into other services.

What I wanted to achieve was a cheaper upload mechanism for S3. The easiest way to allow upload through API gateway is to call a Lambda for every API call and then upload the payload into an S3 bucket. But this is rather costly if you increase the throughput from a few single call to a few hundred calls a second.

So what I came up with, was to directly invoke the Kinesis Firehose from an API Gateway. That way I could avoid the cost of the Lambda and the cost of a S3 request per API call.

So here an overview picture of what I am about to build.
![API Gateway to Kinesis Firehose](/assets/api2firehose.png)

The easiest part in CloudFormation is the S3 bucket. This one does not require any specific configuration for this to work.

{% highlight YAML %}
AWSTemplateFormatVersion: '2010-09-09'
Description: Firehose sample
Resources:
  DataBucket:
    Type: AWS::S3::Bucket
{% endhighlight %}

Now I configured a Firehose.
As a prerequisite I needed a role which would allow the Firehose to actually write into the S3 bucket.
{% highlight YAML %}
KinesisRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
      - Effect: Allow
        Principal:
          Service:
          - firehose.amazonaws.com
        Action:
        - sts:AssumeRole
    Path: "/"
    Policies:
      - PolicyName: KinesisRolePolicy
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
          - Effect: Allow
            Action:
              - s3:AbortMultipartUpload
              - s3:GetBucketLocation
              - s3:GetObject
              - s3:ListBucket
              - s3:ListBucketMultipartUploads
              - s3:PutObject
            Resource:
              - Fn::GetAtt: [ DataBucket , Arn ]
              - Fn::Join:
                - ""
                - - Fn::GetAtt: [ DataBucket , Arn ]
                  - "/*"
{% endhighlight %}

Now the Firehose configuration.
{% highlight YAML %}
EventFirehose:
  Type: AWS::KinesisFirehose::DeliveryStream
  Properties:
    S3DestinationConfiguration:
      BucketARN:
        Fn::GetAtt: [ DataBucket, Arn ]
      BufferingHints:
        IntervalInSeconds: 60
        SizeInMBs: 10
      CompressionFormat: GZIP
      Prefix: events/
      RoleARN:
        Fn::GetAtt: [ KinesisRole, Arn ]
{% endhighlight %}

The API Gateway only consists of one method (without any resources), to keep the sample as simple as possible.
Here the API Gateway definition.
{% highlight YAML %}
ApiGatewayRestApi:
  Type: AWS::ApiGateway::RestApi
  Properties:
    Name:
      Fn::Join:
        - ""
        - - Ref: AWS::StackName
          - "-api"
{% endhighlight %}

Now the tricky part for all of this lies in the method definition (specifically the input mapping).

{% highlight YAML %}
ApiGatewayPostMethod:
  Type: AWS::ApiGateway::Method
  Properties:
    ApiKeyRequired: true #to secure my API I used a simple API key. Otherwise my Firehose would be open to the internet.
    AuthorizationType: NONE
    HttpMethod: POST
    Integration:
      Type: AWS #signal that we want to use an internal AWS service
      Credentials:
        Fn::GetAtt: [ GatewayRole, Arn ] #role for the API to actually invoke the firehose
      Uri:
        Fn::Join:
          - ""
          - - "arn:aws:apigateway:"
            - Ref: AWS::Region
            - ":firehose:action/PutRecord" #this URI basically describes the service and action I want to invoke.
      IntegrationHttpMethod: POST #for kinesis using POST is required
      RequestTemplates:
        application/json: #now the mapping template for an incoming JSON
          Fn::Join:
            - ""
            - - "#set( $key = $context.identity.apiKey )\n" #assign the API key to local variable
              - "#set( $keyname = \"apiKey\" )\n"
              - "#set( $traceidval = $input.params().get(\"header\").get(\"X-Amzn-Trace-Id\"))" #get the trace id to later extract a timestamp of the incoming request
              - "#set( $bodyname = \"body\" )\n"
              - "#set( $traceid = \"traceid\")\n"
              - "#set( $body = $input.body )\n" #assign the request payload to variable
              - "#set( $quote = '\"' )\n"
              - "#set( $b64 = $util.base64Encode(\"{$quote$keyname$quote:$quote$key$quote,$quote$traceid$quote:$quote$traceidval$quote,$quote$bodyname$quote:$body}\") )\n"
              #now encode the payload in base64 to form a valid Firehose request
              - "{\n" #begin of the Firehose request json
              - "\"DeliveryStreamName\": \""
              - Ref: EventFirehose
              - "\",\n"
              - " \"Record\": { \"Data\": \"$b64\" }\n}" #end of the Firehose request json
      RequestParameters: #Firehose requires the content type to not be json, but amz-json
        integration.request.header.Content-Type: "'application/x-amz-json-1.1'"
      IntegrationResponses:
        - StatusCode: 200 #create a default response for the caller
          ResponseTemplates:
            application/json: '{"status":"OK"}'
    MethodResponses:
      - StatusCode: 200
    ResourceId:
      Fn::GetAtt: [ ApiGatewayRestApi , RootResourceId ]
    RestApiId: !Ref ApiGatewayRestApi
{% endhighlight %}

Now we still need the Gateway role to be defined.
{% highlight YAML %}
GatewayRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
      - Effect: Allow
        Principal:
          Service:
          - apigateway.amazonaws.com
        Action:
        - sts:AssumeRole
    Path: "/"
    Policies:
      - PolicyName: GatewayRolePolicy
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
          - Effect: Allow
            Action:
              - firehose:PutRecord
            Resource: "*"
{% endhighlight %}

I added a Deployment, so the API would automatically get deployed after it is created.
{% highlight YAML %}
ApiGatewayDeployment:
  Type: AWS::ApiGateway::Deployment
  DependsOn:
    - ApiGatewayPostMethod
  Properties:
    RestApiId: !Ref ApiGatewayRestApi
    StageName: prod
{% endhighlight %}

Here is the overall CloudFormation template:

[api-to-firehose-cf.yml template][1]

[1]:{{ site.url }}/assets/api-to-firehose-cf.yml
