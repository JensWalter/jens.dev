---
layout: post
title:  "extending cloudformation with custom resources"
date:   2017-06-18 10:08:54 +0200
tags: cloudformation nodejs
---
CloudFormation is a pretty capable tool which provides templating functionality for most of the Amazon web services. But still, keeping up with the release cadence of all the AWS services isn't that easy. So there always is a little gap of what features the console offers and what CloudFormation offers.

So for this use case (and some others like initial data load), AWS introduced custom resources. This Resource basically represents an AWS lambda invocation which is called whenever your template gets instantiated, removed or update.

The states that AWS supports are:
* [Create](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requesttypes-create.html)
* [Delete](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requesttypes-delete.html)
* [Update](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requesttypes-update.html)

Since some of the AWS API calls take a rather long time, the invocation model of this lambda is asynchronous. I linked the AWS docs for a more detailed explanation of the input structure on the various operations.

What is important here is, that all input structures carry a callback URL which has to be called, so CloudFormation knows it can continue creating/deleting the stack.

If you forget to call the callback or your code doesn't exit correctly (e.g. uncaught exceptions), then CloudFormation wait a very long time (about 1 hour) until it actually times out.

To make things easier, AWS provides a [node module](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-lambda-function-code.html#cfn-lambda-function-code-cfnresponsemodule), where all the callback stuff is handled correctly. And even better, it is already pre-installed if the Lambda function is inlined in the CloudFormation template, so no extra bundling is necessary here.

So first I have to create a Lambda function inside my template (it can also be an externally defined lambda, but this makes it easier to demonstrate).

{% highlight YAML %}
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  CustomResourceFunction:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        ZipFile: >
            var response = require('cfn-response');
            exports.handler = function(event, context) {
              console.log("event");
              console.log(event);
              console.log("context");
              console.log(context);
              response.send(event, context, response.SUCCESS, {});
            };
      Handler: index.handler
      Runtime: nodejs6.10
      Timeout: 30
      Role: !GetAtt LambdaExecutionRole.Arn
{% endhighlight %}

This is the most basic function, which only logs the event and context and then confirms its execution back to CloudFormation.

Now I enhanced my very basic version to at least differentiate between those CloudFormation operations.

{% highlight YAML %}
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  CustomResourceFunction:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        ZipFile: >
            const response = require('cfn-response');
            exports.handler = function(event, context) {
              if(event.RequestType == "Create"){
                console.log("creating something");
              }else if(event.RequestType == "Update"){
                console.log("updating something");
              }else {
                console.log("deleting something");
              }
              //and in any case confirm the transaction
              response.send(event, context, response.SUCCESS, {});
            };
      Handler: index.handler
      Runtime: nodejs6.10
      Timeout: 30
      Role: !GetAtt LambdaExecutionRole.Arn
{% endhighlight %}

Now I have to make this Lambda accessible as CustomResource.

CustomResources look like this.

{% highlight YAML %}
CustomResource1:
  Type: Custom::CustomResourceFunction
  Properties:
    ServiceToken: !GetAtt CustomResourceFunction.Arn
    StackName:
      Ref: "AWS::StackName"
{% endhighlight %}

To bring all this together, this would be the concluding CloudFormation template with all resources.

{% highlight YAML %}
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  CustomResourceFunction:
    Type: AWS::Lambda::Function
    Properties:
      Code:
        ZipFile: >
            const response = require('cfn-response');
            exports.handler = function(event, context) {
              if(event.RequestType == "Create"){
                console.log("creating something");
              }else if(event.RequestType == "Update"){
                console.log("updating something");
              }else {
                console.log("deleting something");
              }
              //and in any case confirm the transaction
              response.send(event, context, response.SUCCESS, {});
            };
      Handler: index.handler
      Runtime: nodejs6.10
      Timeout: 30
      Role: !GetAtt LambdaExecutionRole.Arn
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Effect: Allow
          Principal:
            Service:
            - lambda.amazonaws.com
          Action:
          - sts:AssumeRole
      Path: "/"
      Policies:
      - PolicyName: LogPolicy
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
          - Effect: Allow
            Action:
            - logs:CreateLogGroup
            - logs:CreateLogStream
            - logs:PutLogEvents
            Resource: arn:aws:logs:*:*:*
  CustomResource1:
    Type: Custom::CustomResourceFunction
    Properties:
      ServiceToken: !GetAtt CustomResourceFunction.Arn
      StackName:
        Ref: "AWS::StackName"
{% endhighlight %}
