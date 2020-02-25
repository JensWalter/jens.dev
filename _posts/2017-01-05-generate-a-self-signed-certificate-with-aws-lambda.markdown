---
layout: post
title:  "generate a self signed certificate with AWS Lambda"
date:   2017-01-05 19:58:54 +0200
tags: lambda
---
For testing purposes I needed a service which would generate a self signed certificate. To reduce my dependency on locally installed tools, I implemented this service as AWS Lambda function (or microservice if you want to call it that).

Here is what I came up with:

<script src="https://gist.github.com/8eab250f28360f696caa8e8c616f0dd8.js"> </script>

The generated output looks like this:

{% highlight json %}
{
  "cert": {
    "filename": "cert.pem",
    "fileContent": "LS0tLS1CRUdJTiBDRVJU..."
  },
  "key": {
    "filename": "key.pem",
    "fileContent": "LS0tLS1CRUdJTiBQUklW..."
  }
}
{% endhighlight %}

PS: you might need to adjust the CN to your own domain name, currently all certificates will have the CN apimeister.com.
