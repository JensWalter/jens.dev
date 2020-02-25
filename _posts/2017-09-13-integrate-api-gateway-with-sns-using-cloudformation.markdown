---
layout: post
title:  "Integrate API Gateway with SNS using CloudFormation"
date:   2017-09-13 10:08:54 +0200
tags: cloudformation sns
---
In my last post, I described how an API Gateway can interact with Kinesis Firehose. This time I used the same approach to connect the API Gateway to SNS.

With this, I could simplify the access pattern for my application by exposing an internal HTTP Endpoint which then routes all requests to a corresponding SNS Topic.


So here an overview picture of what I am about to build.

![API Gateway to SNS](/assets/api2sns.png)

The first part of the CloudFormation template is the definition of the API Gateway.

{% highlight YAML %}
ApiGatewayRestApi:
  Type: AWS::ApiGateway::RestApi
  Properties:
    Name: #make the name dynamic so I can instantiate this as often as necessary
      Fn::Join:
        - ""
        - - Ref: AWS::StackName
          - "-api"
{% endhighlight %}

As a prerequisite, I needed a role which would allow the API Gateway to actually write into the SNS Topic.
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
              - sns:Publish
            Resource: "*" #grants access to all topics,
                          #for production use, this should be more specific
          - Effect: Allow #allow logging (not essential to the solution)
            Action:
              - logs:PutLogEvents
              - logs:CreateLogGroup
              - logs:CreateLogStream
            Resource: "*"
{% endhighlight %}

Now the difficult part is getting the method definition right. I'm using a GET method since it is simpler to call this from any browser/CLI/script environment.

The parameter mapping for SNS is derived from the [AWS API documentation](http://docs.aws.amazon.com/sns/latest/api/Welcome.html).

{% highlight YAML %}
ApiGatewayGETMethod:
  Type: AWS::ApiGateway::Method
  Properties:
    AuthorizationType: NONE
    HttpMethod: GET
    RequestParameters: #request parameters need to be defined for the mapping
      method.request.querystring.message: false #payload of the SNS message
      method.request.querystring.subject: false #subject of the SNS message
      method.request.querystring.topic: false #destination topic arn
    Integration:
      Type: AWS
      Credentials:
        Fn::GetAtt: [ GatewayRole, Arn ] #use the already defined role
      Uri:  #required URI for using SNS service
        Fn::Join:
          - ""
          - - "arn:aws:apigateway:"
            - Ref: AWS::Region
            - ":sns:action/Publish"
      IntegrationHttpMethod: GET #SNS allows GET operations
      RequestParameters: #parameter mapping defined by the AWS API.
        integration.request.querystring.TopicArn: "method.request.querystring.topic"
        integration.request.querystring.Subject: "method.request.querystring.subject"
        integration.request.querystring.Message: "method.request.querystring.message"
      IntegrationResponses: #map all responses to a default response.
        - StatusCode: 200
          ResponseTemplates: #default response
            application/json: '{"status":"OK"}'
    MethodResponses:
      - StatusCode: 200
    ResourceId: #attaching the GET method to the root resource of the API
      Fn::GetAtt: [ ApiGatewayRestApi , RootResourceId ]
    RestApiId: !Ref ApiGatewayRestApi
{% endhighlight %}

To also deploy this API within the same CloudFormation operation, I added a deployment instruction.
{% highlight YAML %}
ApiGatewayDeployment:
  Type: AWS::ApiGateway::Deployment
  DependsOn: #without the depends on, the deployment is sometimes done before
             #any operation is defined.
    - ApiGatewayGETMethod
  Properties:
    RestApiId: !Ref ApiGatewayRestApi
    StageName: prod
{% endhighlight %}

Now I can send notifications to any registered topic through the following curl command.
{% highlight bash %}
curl 'https://uyzf1ids8j.execute-api.eu-west-1.amazonaws.com/prod/
    ?topic=arn:aws:sns:eu-west-1:11111111111:test5
    &subject=hello
    &message=world'
{% endhighlight %}

Here is the overall CloudFormation template:

[api-to-sns-cf.yml template][1]

[1]:{{ site.url }}/assets/api-to-sns-cf.yml
