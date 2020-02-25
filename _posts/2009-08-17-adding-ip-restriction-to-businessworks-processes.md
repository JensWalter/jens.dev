---
title: adding IP-restriction to BusinessWorks processes
date: 2009-08-17T01:16:07+00:00
layout: post
tags:
  - BusinessWorks
  - TIBCO
---
Recently I got into the situation that somebody used some interface a way it was not designed for and so created an out-of-memory situation which couldn’t be handled by the engine itself. So now I got the case that one client block the complete service due to invalid requests which he shouldn’t do in the first place.

In the short term there seemed to be only one solution, block the client. So I began to search around how this could be done.

The easiest way to achieve this would be to change the authentication for this service. Unluckily this service is used by a lot of other clients, so I can’t change it out of the blue. Next thing that came to my mind was using the underlying tomcat to do some IP-based blocking. After some searching around I gave that one up. Tibco has a really complex deployment model for BusinessWorks so I wasn’t able to even find the process-specific section for the tomcat engine.

After some searching around in the documentation (actually several hours – hooray to a usable documentation) I found some parameter which allows you to block IPs with some TRA-file parameters. In case you want to look it up yourself it is in the BusinessWorks documentation under ‘Administration’ -> Chapter 8 ‘Custom Engine Properties’ -> ‘Available Custom Engine Properties’ (and another hooray to the excellent formatting – Note to Tibco: HTML has tags, so you can do more with the content then continuous text – even some breaks would enhance the experience).

So back to the point:

> bw.plugin.http.server.allowIPAddresses

> bw.plugin.http.server.restrictIPAddresses

Both tags are rather self explanatory so you can use right away. Tibco says you can use it with a single IP, a list of IPs (comma-separated) or regular expression. As stated before this highlight of a documentation doesn’t say what reg-exp syntax means. I guess Tibco means they use the Tomcat engine for evaluation of these values an that means they use the Java syntax described [here](http://java.sun.com/developer/technicalArticles/releases/1.4regex/).
