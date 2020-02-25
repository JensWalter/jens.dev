---
layout: post
title:  "auto-confirming a newly created Cognito user"
date:   2016-11-11 19:49:54 +0200
tags: cognito lambda
---
In Cognito all registered users need to be confirmed before they can interact with other services.

Out-of-the-box Amazon supports confirmation by
* email
* SMS
* web UI
* lambda

To automate this process, confirming with a Lambda function is the only way to trigger the confirmation process. So I created the following lambda to confirm all created users.

{% highlight javascript %}
exports.handler = (event, context, callback) => {
    event.response.autoConfirmUser=true;
    callback(null, event);
};
{% endhighlight %}

Then I used this lambda as "Pre sign-up"-trigger.

That's about it, now all users get confirmed by the lambda function and do not need to confirm manually.
