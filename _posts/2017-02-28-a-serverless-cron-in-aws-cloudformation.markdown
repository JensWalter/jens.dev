---
layout: post
title:  "a serverless cron in AWS CloudFormation"
date:   2017-02-28 16:52:54 +0200
tags: cloudformation serverless
---
Here my scenario I try to cover this time.

Scenario:
* Raise an event based on a cron pattern
* Subscribe to that event with a Lambda

As picture this would look like this:

![timer based event](/assets/timerbasedevent.png)

I use a CloudFormation template as project definition for this task.

So here is my YAML explained step-by-step (whole YAML is attached at the bottom).

I copied the header from an existing template since I have nothing to add here:

{% highlight YAML %}
AWSTemplateFormatVersion: '2010-09-09'
Resources:
{% endhighlight %}

First I create a role, which is a requirement for a lambda function. Since I only implement a dummy lambda, my role has no policies attached.

{% highlight YAML %}
LambdaRole: #logical name of the resource
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
      - Effect: Allow
        Principal:
          Service:
          - lambda.amazonaws.com #allow lambda to assume that role
        Action:
        - sts:AssumeRole
    Path: "/"
{% endhighlight %}

After that, I can create the lambda function that I want to run in case of an triggered event.

{% highlight YAML %}
CronFunction: #logical name of the resource
  Type: AWS::Lambda::Function
  Properties:
    Code: #locate the code of the function
      ZipFile: > #inline code to simplify the sample
        exports.handler = function(event, context) {
          console.log("running code");
          context.succeed("done");
        };
    Handler: index.handler
    Role:
      Fn::GetAtt: [ LambdaRole , "Arn" ] #reference the already defined role by its Arn
    Runtime: nodejs4.3 #runtime is nodejs since my function is implemented in javascript
    Timeout: 60 #timeout for the lambda
{% endhighlight %}

Now I can define the event, that should trigger my function.

A little heads up regarding the cron pattern. This is not a standard linux cron pattern, Amazon used some variation and it does produce error if you paste in linux cron patterns. So if you can, I would suggest using the rate expression instead.

e.g. if you want your code to run every 15 minutes, you can implement that either way:
* rate expression: rate(15 minutes)
* cron expression: cron(0/15 * * * ? *)

{% highlight YAML %}
CronEvent: #logical name of the resource
  Type: AWS::Events::Rule
  Properties:
    ScheduleExpression: cron(0/15 * * * ? *) #when the event should trigger
    Targets:
      - Arn:
          Fn::GetAtt: [ CronFunction , "Arn" ] #reference the lambda function by its arn
        Id:
          Ref: CronFunction #unique name of the target
{% endhighlight %}

At last, we need to define a permission, so that the event is actually allowed to invoke the lambda.
{% highlight YAML %}
LambdaInvokePermission: #logical name of the resource
  Type: AWS::Lambda::Permission
  Properties:
    FunctionName:
      Fn::GetAtt: [ CronFunction ,"Arn" ] #reference the lambda function by its arn
    Action: lambda:InvokeFunction #allow invoking of lambda functions
    Principal: events.amazonaws.com #grant permission to the events system
    SourceArn:
      Fn::GetAtt: [ CronEvent , "Arn" ] #define which event is allowed to trigger lambdas
{% endhighlight %}

To instantiate this template, just download the file and run the following command:

{% highlight bash %}
aws cloudformation create-stack --stack-name myteststack --template-body file://cron-sample-cf.yml --capabilities CAPABILITY_IAM
{% endhighlight %}
Here is the overall CloudFormation template:

[cron-sample-cf.yml template][1]

[1]:{{ site.url }}/assets/cron-sample-cf.yml
