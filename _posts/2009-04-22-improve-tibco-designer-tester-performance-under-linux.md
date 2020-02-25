---
title: improve TIBCO Designer tester performance under linux
date: 2009-04-22T00:20:25+00:00
layout: post
tags:
  - designer
  - java
  - linux
  - TIBCO
---
I’m using the TIBCO designer for quite a while now. Before using it in a debian environment I developed all TIBCO related stuff in Windows XP. Now with the switch to linux there came quite a shift in user experience. One thing that really annoyed me was the slow performance of the designer debugger.

So I started some measurements with a simple test process. The test process creates a simple list of all files (2000 items) in one folder and then iterates over every entry. Here is what I got:

> Windows XP: 194sec

> Windows XP (minimized): 6sec

> Gnome: 470sec

> Gnome (minimized): 4sec

All this data was gathered with the same default installation of a TIBCO designer 5.6 with the default java runtime. The configs were all left untouched. So now I tried to find something to improve that behavior. I first concentrated on how to influence the jvm.

After a bit of research in the TIBCO direction a found the following value in the tra-file which allows the user to pass parameters directly to the jvm:

> java.extended.properties

With that information I tried several parameters suggested by google. After a few tries I came to this one:

> sun.java2d.pmoffscreen=false

What [Sun says about it](http://java.sun.com/j2se/1.5.0/docs/guide/2d/flags.html#pmoffscreen) isn’t really clear to me but it helps drastically to improve performance. Back to my original test I came up with the following timings:

> Gnome (pmoffscreen=false): 75sec

> Gnome (pmoffscreen=false): 5sec

As you can see it actually surpasses the Windows installation. That was a result I didn’t actually expect. Till now I found no drawback to this solution.

Just for the sake of completeness here my full config line of the designer.tra

> java.extended.properties=-Xrs -Xmx3072M -Xms1536M -XX:+AggressiveOpts -XX:-UseParallelGC -XX:-UseConcMarkSweepGC -XX:MaxPermSize=512M -XX:+UseFastAccessorMethods -Xverify:none -Dsun.java2d.pmoffscreen=false
