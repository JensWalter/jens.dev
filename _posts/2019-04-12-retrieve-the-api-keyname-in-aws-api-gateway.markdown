---
layout: post
title:  "Retrieve the API key name in AWS API Gateway"
date:   2019-04-12 10:08:54 +0200
tags: apigateway lambda
---

The AWS API-Gateway does support authentication through API Key. It is a very convenient feature to have, especially since other functionality such a throttling and request quotas also come through that feature.

That is all good, as long as all your required functionality is provided by AWS. But what I needed was business-like Dashboard which provides insight into how my API was used by different clients.

Since all clients are identified by API Key, I hoped for some mechanism within API-Gateway to provide information such as key name to my Lambda implementation. Sadly something like this is currently not possible.

So I started to implement this in my lambda. First I had to query all API-Keys since the SDK does not allow to search for keys by value.

After retrieving all keys, I could just loop through the values and find the corresponding key name.

{% highlight javascript %}
var apiKey = "abc123";
  
// get all api key
var params = { includeValues: true, limit: 500};
let keys = await APIGATEWAY.getApiKeys(params).promise();
for(let idx=0;idx<keys.items.length;idx++){
  let item = keys.items[idx];
  if(item.value==apiKey){
    //found the api key
    break;
  }
}
{% endhighlight %}

So far so good. This provides the name of the key on every request. This is sustainable for small volume APIs, but not for high volume ones. If the API has more invocations, those requests will slow the API down. So introducing some kind of caching would be very helpful.

The API Gateway already has a mechanism that is called before the invocation, which is also capable of caching the results, the Custom Authorizer System.

So I put this code into the custom authorizer to achieve caching and avoid too many queries on the AWS API.

Here is the whole custom authorizer:

<script src="https://gist.github.com/JensWalter/0c24acb9bcf6574feecbcfa04d6a5fcf.js"></script>

After implementing the custom authorizer, key name is propagated throught he Lambda event requestContext object.

{% highlight javascript %}
exports.handler = async (event, context) => {
  let keyname = event.requestContext.authorizer.apikey;
  return {
    statusCode: 200,
    body: keyname
  };
}
{% endhighlight %}