---
layout: post
title:  "connecting nodejs to Tibco EMS"
date:   2016-06-26 21:57:54 +0200
tags: tibco ems nodejs
---
I recently started a new project to bring Tibco EMS connectivity to nodejs.
It is still in a pretty early stage, so it is rather limited in its capabilities. A current version of the feature set will be maintained within [github](https://github.com/JensWalter/node-ems).

What is working right now?

* send a text message to queue (request/reply and push)
* send a text message to topic (request/reply and push)

More is about to come in the future. To give you a little insight on how it looks like, here a sample of sending a request.

{% highlight javascript %}
const ems = require('./build/Release/node-ems');

let server= "tcp://localhost:7222";
let user="admin";
let password="admin";
let queueName="queue.push";
let topicName="topic.push";
let header={};
let body="hello world";

var ems_conn = ems.prepare(server,user,password);
console.log(JSON.stringify(ems_conn,null,2));

//send a message to a queue -> fire and forget
var msgId1 = ems_conn.sendToQueueSync(queueName,header,body);
console.log("msgId1: "+msgId1);

//send message to a topic -> fire and forget
var msgId2 = ems_conn.sendToTopicSync(topicName,header,body);
console.log("msgId2: "+msgId2);

//send message to a queue and wait for a response -> request/reply
var response1 = ems_conn.requestFromQueueSync("queue.rr",header,body);
console.log("queue response: "+JSON.stringify(response1,null,2));

//send message to a topic and wait for a response -> request/reply
var response2 = ems_conn.requestFromTopicSync("topic.rr",header,body);
console.log("topic response: "+JSON.stringify(response2,null,2));

console.log('done');
{% endhighlight %}

You can check it out under [https://github.com/JensWalter/node-ems](https://github.com/JensWalter/node-ems)
