---
layout: post
title:  "Publish an S3 Event to Lambda through SNS"
date:   2017-02-19 14:00:54 +0200
tags: cloudformation serverless
---
My path through starting with AWS CloudFormation was a somewhat rocky path. Often I wished for simple CF Templates which would only show one pattern at a time. So I'm starting a short series where I will try to describe some patterns I experienced and hopefully lower the entry barrier for CloudFormation since it is great tool.

Scenario:
* Raise an S3-Object-Create event
* Publish that event to SNS
* Subscribe to that event with a Lambda

As picture this would look like this:

![s3-subscription](/assets/s3-subscription.png)

I use [serverless](https://serverless.com/) as project template, since this by far the easiest starting Point for any serverless work.

So here is my serverless YAML explained step-by-step (whole YAML is attached at the bottom).

I left the header unchanged as it was created by the serverless framework.

{% highlight YAML %}
service: bucket-subscription-sample

provider:
  name: aws
  runtime: nodejs4.3

functions:
  hello:
    handler: handler.hello
{% endhighlight %}

First I created a resources section. In this section I can later define my CloudFormation resources.

{% highlight YAML %}
resources:
  Resources:
#place all CloudFormation resources below this line
{% endhighlight %}

Now I created an SNS topic first, since this object doesn't have any dependencies on others.
{% highlight YAML %}
ChangeTopic: #logical name of the topic
  Type: AWS::SNS::Topic
{% endhighlight %}

After that, I can create an S3 bucket which will send notifications out to SNS.
{% highlight YAML %}
MySourceBucket: #logical name of the bucket
  Type: AWS::S3::Bucket
  Properties:
    NotificationConfiguration:
      TopicConfigurations: #create notifications to SNS
        - Event: s3:ObjectCreated:* #define the type of events
          Topic:
            Ref: ChangeTopic #target topic referenced by its logical name
{% endhighlight %}

To grant S3 access to publish events to SNS I created the following TopicPolicy.
{% highlight YAML %}
ChangeTopicPolicy: #logical name of the policy
  Type: AWS::SNS::TopicPolicy
  Properties:
    PolicyDocument:
      Version: '2012-10-17'
      Statement:
      - Sid: AllowBucketToPushNotificationEffect #identifier of the policy statement
        Effect: Allow
        Principal:
          Service: s3.amazonaws.com #allow s3 to used this policy
        Action: sns:Publish #grant publish rights
        Resource: "*" #grant rights to all SNS topics (narrow it down if security is an issue)
    Topics:
    - Ref: ChangeTopic #policy target referenced by its logical name
{% endhighlight %}

To subscribe to a topic, I needed to create an subscription.
{% highlight YAML %}
ChangeTopicSubscription: #logical name
  Type: AWS::SNS::Subscription
  Properties:
    Endpoint:
      Fn::GetAtt: [ HelloLambdaFunction , "Arn" ] #lambda reference by ARN, by default serverless generates logical names by concatenating FunctionName with "LambdaFunction"
    Protocol: lambda #protocol to invoke endpoint
    TopicArn:
      Ref: ChangeTopic #topic to subscribe from
{% endhighlight %}

By default, SNS subscriptions aren't allowed to invoke any Lambda function. To fix this, I created a LambdaPermission, which grants SNS access to Lambda.
{% highlight YAML %}
HelloLambdaFunctionPermission: #logical name of the permission
  Type: AWS::Lambda::Permission
  Properties:
    Action: lambda:InvokeFunction #grant lambda invocations
    Principal: sns.amazonaws.com #grant rights to SNS
    SourceArn:
      Ref: ChangeTopic #reference the source topic by logical name
    FunctionName:
      Fn::GetAtt: [ HelloLambdaFunction, "Arn" ] #lambda reference by ARN, by default serverless generates logical names by concatenating FunctionName with "LambdaFunction"
{% endhighlight %}

Here is the overall serverless file:

[serverless.yml template][1]

[1]:{{ site.url }}/assets/s3-subscription-serverless.yml
