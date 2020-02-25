---
title: handling a few thousand simultaneous connections in TIBCO BusinessWorks
date: 2009-12-08T17:22:16+00:00
layout: post
tags:
  - BusinessWorks
  - TIBCO
  - tomcat
---
Scaling with TIBCO BusinessWorks can sometimes be a bit tricky. Recently I began testing some scenarios how to scale a Webservice a bit larger. The first source of information was of course the official documentation and to look at the proposed best practice values for such an engine.

To start small, I tried a HTTP Receiver with a 32bit JVM runtime. I set the heap to the maximum amount possible (something about 1.7gig) and tried how many connections I could handle with that. After a few hundred (300-400) the engine always ran into an Out-Of-Memory Exception. From that point the engine was often not recoverable and had to be killed.

After that I tried my luck with an 64bit JVM. Theoretically, with more RAM more connections should be possible, so lets go for it.

I increased the heap size to about 4gig. With that value, the engine actually consumed something about 6gig of memory (I only had 8gig on my test machine). Running the same test as before the connection count increased linearly. That was something I didn’t expect. First of I expected the Memory consumption should lower on the amount of connections (because of the more reusable objects) and an increase in CPU load because of the more and more complicated handling of the larger heap on the JVM end.

Despite that I came close to handle about one thousand connections. This seems pretty good but was not enough for what I had in mind. The only possibility I saw at that point was to increase the Memory further and further to get more connections running. A second concern which came to my mind was the thread handling. In a default Tomcat installation ever connection gets its own thread. This does consume a lot of memory but also increases the thread count of the server engine dramatically.

With that in mind I remembered something I read about Tomcat 6 a while ago. For the purpose of handling a lot of simultaneous and enduring Javascript requests Tomcat introduced a new kind of connector engine which uses the Java NIO Framework. To explain this a little, Sun introduced this framework in Java 1.4 to handle IO over a single thread mechanism and use mostly OS provided functions for memory allocation and interaction. So in theory this could be the ideal framework for handling a lot of network IO. Tomcat introduced this feature with the c10k problem specifically in mind. So I began searching around how I could get a similar behavior out of BusinessWorks.

What I didn’t know at that point was, that TIBCO already introduced this feature into BusinessWorks with version 5.7. You can switch the HTTP connector engine with some parameter in the HTTP Connection resource.

<div id="attachment_511" style="width: 359px" class="wp-caption aligncenter">
  <img src="/assets/http_connection.jpg" alt="HTTP Connection - engine selector" title="http_connection" width="349" height="281" class="size-full wp-image-511" />

  <p class="wp-caption-text">
    HTTP Connection - engine selector
  </p>
</div>

So I changed the connector engine and restarted the test. This time I started small. I set the heap to 512MB and limited the maxProcessor to 500. What I then saw was unexpected. The engine filled up right to the ten thousand requests I send. There occurred no Out-Of-Memory at all. What was also interesting was, that the engine held 10k connections despite the maxprocessors was set to 500.

So to conclude the result, the new connector is quite impressive when you need to handle a lot of simultaneous connection and have not a lot of memory to spare. On the other hand, when you use it, you loose some of the TIBCO integrated features to limit your load. Further to that, the TIBCO documentation states that due to the single thread architecture you increase latency. So as always there is a tradeoff.

One final side note. I had some issues with the BusinessWorks 5.7.1 engine so I upgraded it to 5.7.2. Than it ran without a glitch.
