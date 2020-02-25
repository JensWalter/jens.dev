---
layout: post
title:  "invoking java gc through bash"
date:   2016-11-23 20:18:54 +0200
tags: java bash
---
Sometimes Java processes start accumulating memory over time and do not give them back to the OS. In previous versions of Java, this was a limitation of the JVM. In Java 8 and newer, with the arrival of the G1 garbage collector, the JVM releases memory back to the OS after a GC run.

Now since this is possible, calling a GC, although there is still free memory available becomes a different meaning. On the other hand most application aren't build with that in mind, so they do not offer any public interface to trigger a GC.

Luckily, the Oracle JDK has a tool for that call "jcmd".

{% highlight bash %}
/usr/lib/java/jdk-1.8.0-66_H02-linux_x64/bin/jcmd {PID} GC.run
{% endhighlight %}

Now, to invoke this regularly and not only invoking one, but all engines running this application jar, I used the following script and hooked that into the crontab.

{% highlight bash %}
#!/bin/bash

/usr/lib/java/jdk-1.8.0-66_H02-linux_x64/bin/jcmd | grep app.jar | cut --delimiter=' ' -f 1 | while read -r line
do
   /usr/lib/java/jdk-1.8.0-66_H02-linux_x64/bin/jcmd $line GC.run
   sleep 1;
done
{% endhighlight %}

Now, every couple of hours, a GC is invoked on the JVM, so the memory bloat stays within reason.
