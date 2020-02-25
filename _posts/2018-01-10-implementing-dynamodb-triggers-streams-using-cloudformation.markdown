---
layout: post
title:  "Implementing DynamoDB triggers (streams) using CloudFormation"
date:   2018-01-10 10:08:54 +0200
tags: cloudformation dynamodb
---
In serverless architectures, as much as possible of the implementation should be done event-driven. One driver of this is using triggers whenever possible.

DynamoDB comes in very handy since it does support triggers through DynamoDB Streams. On the other end of a Stream usually is a Lambda function which processes the changed information asynchronously.

So I tried building that pattern and recognized, that it is not that straightforward to implement in cloudformation.

Here the visual overview of what I am building:

![DynamoDB to Lambda through Streams](/assets/dynamodb2lambdastream.png)

The first part of the CloudFormation template is the definition of the Lambda function which will receive the DynamoDB event stream.

{% highlight YAML %}
EchoFunction:
  Type: AWS::Lambda::Function
  Properties:
    Code: #actual code, which echos the incoming event
      ZipFile: >
        exports.handler = function(event, context, callback) {
          console.log("receiving event");
          console.log(event);
          callback(null,"done");
        };
    Handler: index.handler
    Role:
      Fn::GetAtt: [ LambdaRole , Arn ]
    Runtime: nodejs6.10
    Timeout: 300
{% endhighlight %}

This basically just implements an echo of all incoming information.

Now the role attached to this function needs the policy to read from the event stream.

{% highlight YAML %}
LambdaRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
      - Effect: Allow #allow lambda to assume this role
        Principal:
          Service:
          - lambda.amazonaws.com
        Action:
        - sts:AssumeRole
    Path: "/"
    Policies:
      - PolicyName: LambdaRolePolicy
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
          - Effect: Allow #allow to write logs to cloudwatch
            Action:
            - logs:CreateLogGroup
            - logs:CreateLogStream
            - logs:PutLogEvents
            Resource: arn:aws:logs:*:*:*
          - Effect: Allow #allow lambda to read from the event stream
            Action:
            - dynamodb:DescribeStream
            - dynamodb:GetRecords
            - dynamodb:GetShardIterator
            - dynamodb:ListStreams
            Resource: "*"
{% endhighlight %}

After setting up the receiving part, I needed to define a DynamoDB table. The only significant property here is the StreamSpecification. This property actually defines the trigger and configures the trigger payload. In my case, I'm only interested in the new document. It is also possible to pass the new and old document around ([see here](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_StreamSpecification.html)).

{% highlight YAML %}
DataTable:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions: #define the field id
      - AttributeName: id
        AttributeType: S
    KeySchema:
      - AttributeName: id #use the id field as primary key
        KeyType: HASH
    ProvisionedThroughput: #set the throughput to 1, since this is just a demo
      ReadCapacityUnits: 1
      WriteCapacityUnits: 1
    StreamSpecification:
      StreamViewType: NEW_IMAGE
{% endhighlight %}

Now comes the tricky part. To actually connect the Lambda with the trigger, I had to introduce an "AWS::Lambda::EventSourceMapping"-object. This is the glue which can connect both ends.

{% highlight YAML %}
DataTableStream:
  Type: AWS::Lambda::EventSourceMapping
  Properties:
    BatchSize: 1 #trigger one lambda per document
    Enabled: True
    EventSourceArn: #trigger event from the data table
      Fn::GetAtt: [ DataTable , StreamArn ]
    FunctionName: #trigger the echo function previously defined
      Fn::GetAtt: [ EchoFunction , Arn ]
    StartingPosition: LATEST #always start at the tail of the stream
{% endhighlight %}

All of this combined results in DynamoDB Table which trigger a Lambda on every change event. Filtering the event stream is only possible within the Lambda implementation.


Here is the overall CloudFormation template:

[dynamo-to-lambda-cf.yml template][1]

[1]:{{ site.url }}/assets/dynamo-to-lambda-cf.yml
