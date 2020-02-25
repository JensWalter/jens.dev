---
title: use yahoo finance streaming api
date: 2008-12-02T12:23:33+00:00
layout: post
tags:
  - ajax
  - streaming api
  - wget
  - yahoo finance
---
In the past I used [this ruby script](http://rubyforge.org/projects/yahoofinance/) to poll for the current stock data and put it into a database to create a little history.

Recently I saw a new feature on the yahoo finance homepage. Now it is possible to enable a streaming option and then you get a live update on certain values via AJAX. So I thought why not get this feature and let yahoo stream the content to the client instead of polling the server from time to time.

So I tried to capture the javascript request with wireshark, so that I could reproduce it. This is what it looks like:

> GET /streamer/1.0?s=^GDAXI,USD=X&o=^N225,LHS.F,JI4.F,EEX.F,HEI.F,CBK.F,PRE.F,NDX1.F&k=c10,g00,h00,l10,p20,t10&j=c10,l10,p20,t10&r=0&marketid=us\_market&callback=parent.yfs\_u1f&mktmcb=parent.yfs\_mktmcb&gencallback=parent.yfs\_gencb HTTP/1.1

> Host: streamerapi.finance.yahoo.com

Here is what I got on this request so far:

parameter ‘s’ -> symbol on the main site (what you currently looking at)

parameter ‘o’ -> that is the ticker on the top

parameter ‘k’ and ‘j’ -> that are the values that are transferred

c10 -> unknown

g00 -> day low

h00 -> day high

l10 -> current price

p20 -> unknown

t10 -> timestamp

a00 -> ask

b00 -> bid

With that data you can build a Push-Client with your own custom data. Here is a sample Request for what I needed.

{% highlight bash %}
wget -Obla 'http://streamerapi.finance.yahoo.com/streamer/1.0?s=^GDAXI,USD=X&o=BEI.F,SIE.F,PRA.F&k=l10,a00,b00,g00,h00&j=l10,a00,b00,g00,h00&r=0&marketid=us_market&callback=parent.yfs_u1f&mktmcb=parent.yfs_mktmcb&gencallback=parent.yfs_gencb'
{% endhighlight %}

(Streaming the current ‘ask’, ‘bid’ and ‘price’ values for the stocks ‘BEI.F’,’SIE.F’ and ‘PRA.F’.)

The response for that looks like that:

{% highlight html %}
&lt;html>
&lt;head>
&lt;script type='text/javascript'> document.domain='finance.yahoo.com';&lt;/script>
&lt;/head>
&lt;body>&lt;/body>
&lt;script>try{parent.yfs_mktmcb({"unixtime":1228213139,"open":1228228200,"close":1228251600});}catch(e){}&lt;/script>
&lt;script>try{parent.yfs_u1f({"USD=X":{l10:"1.00",a00:"1.00",b00:"1.00",g00:"0.00",h00:"0.00"}});}catch(e){}&lt;/script>
&lt;script>try{parent.yfs_u1f({"BEI.F":{l10:"42.31",a00:"41.70",b00:"41.53",g00:"42.31",h00:"43.95"}});}catch(e){}&lt;/script>
&lt;script>try{parent.yfs_u1f({"SIE.F":{l10:"44.46",a00:"44.26",b00:"44.20",g00:"44.40",h00:"47.55"}});}catch(e){}&lt;/script>
{% endhighlight %}


<p>
  No you can parse that document for the requested Data. But be careful because the html structure is never closing (at least not as lang as the streaming goes on).
</p>
