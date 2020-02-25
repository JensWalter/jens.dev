---
title: bringing the yahoo finance stream to the shell
date: 2009-02-03T16:17:06+00:00
layout: post
tags:
  - shell
  - streaming api
  - yahoo finance
---
A little while ago a posted a primitive way to get to yahoo finance streaming data. As you can guess this was just the beginning. To raise the bar I tried to parse the received data and bring it to the shell. To get this done I needed several tools.

  * curl – to send and receive the http request

  * [transform](/2009/01/14/streaming-editor-improved.html) – a primitive tool to do streaming operations within one line

  * spidermonkey shell (a javascript shell which can parse and reformat the data)

The complete logic will be done in the javascript. So lets start with the curl command line:

<pre class="prettyprint lang-sh">curl -s -o - -N 'http://streamerapi.finance.yahoo.com/streamer/1.0?s=JAVA,MSFT&k=l10&callback=parent.yfs_u1f&mktmcb=parent.yfs_mktmcb&gencallback=parent.yfs_gencb'</pre>

Let’s see what we have here. First we call the yahoo streaming api and want the current price (l10) for the stocks of Sun and Microsoft. The callback part cannot be changed. If you change this part the whole request will not succeed. Also important is to get the output to STDOUT so that we can pipe the output to the next application.

Second part of the work is just to call the transform application ([further explanation here](/2009/01/14/streaming-editor-improved.html)).

The third part is to pipe the output of the transform process into the javascript shell. I started the shell with the following command:

<pre class="prettyprint lang-sh">js -f script.js</pre>

The script script.js look like this:

<pre class="prettyprint lang-js">yfs_u1f = function(tmp) {
try{
print("msft: "+tmp.MSFT.l10);
}catch(ex){}
try{
print("java: "+tmp.JAVA.l10);
}catch(ex){}
};

yfs_mktmcb = function(tmp) {
/*ignore timestamp */

};
var parent=this;
parent.yfs_u1f = yfs_u1f;
parent.yfs_mktmcb = yfs_mktmcb;

while(1==1){
var t = readline();
if(t.substr(0,3) == "try"){
eval(t);
}
}</pre>

First we have to implement the callback functions which will be called from the http response. Then we construct an object called parent where we map these functions into. Now we have a working construct to receive the data and are able to work with it in our shell. What we need now is a little while loop to continuously read from STDIN and wait for new data. By the way accessing the tmp variable in the callback function seems somewhat complicated to me. I’m sure there is an easier way to access it but I have no clue how. If you have an idea how to do it better please post it to the comments.

The complete bash statement would look like this:

<pre class="prettyprint lang-sh">curl -s -o - -N 'http://streamerapi.finance.yahoo.com/streamer/1.0?s=JAVA,MSFT&k=l10&callback=parent.yfs_u1f&mktmcb=parent.yfs_mktmcb&gencallback=parent.yfs_gencb' | /tmp/transform | js -f script.js</pre>

If you run this you should get this output:

> msft: 17.83<br>
> java: 4.47<br>
> msft: 17.84<br>
> msft: 17.86<br>
> msft: 17.81<br>
> java: 4.46

Now you can use whatever tools you want to work with that data. For me this will be piped directly into my postgres db for further processing.
