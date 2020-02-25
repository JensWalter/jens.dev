---
layout: post
title:  "ant task to show content of a jar file"
date:   2015-10-04 18:50:54 +0200
tags: ant java
---
A short while ago I started using travis-ci as my continuous build environment. After running some tests I suspected that some files are missing from my ant created jar file. Sadly travis does not support a trivial way to upload the produced jar to a remote location. So I decided to take the console output (which they provide for every build job), to inspect what files are actually packaged in the jar file. After a short search I came up with the following solution.

{% highlight xml %}
<target name="showjar" depends="build" description="show content of the jar file">
  <exec executable="/usr/bin/unzip">
    <arg value="-v"/>
    <arg value="${dist}/trivium.jar"/>
  </exec>
</target>
{% endhighlight %}

**result:**

{% highlight bash %}
Archive:  trivium.jar
 Length   Method    Size  Cmpr    Date    Time   CRC-32   Name
--------  ------  ------- ---- ---------- ----- --------  ----
       0  Stored        0   0% 10-04-2015 13:13 00000000  META-INF/
     133  Defl:N      117  12% 10-04-2015 13:13 21979f03  META-INF/MANIFEST.MF
       0  Stored        0   0% 10-04-2015 00:57 00000000  META-INF/services/  
       0  Stored        0   0% 10-04-2015 00:57 00000000  io/
       0  Stored        0   0% 10-04-2015 13:07 00000000  io/trivium/  
       0  Stored        0   0% 10-04-2015 12:49 00000000  io/trivium/anystore/
       0  Stored        0   0% 10-04-2015 12:49 00000000  io/trivium/anystore/query/
       0  Stored        0   0% 10-04-2015 00:57 00000000  io/trivium/anystore/statics/  
       0  Stored        0   0% 10-04-2015 12:49 00000000  io/trivium/anystore/test/
       0  Stored        0   0% 10-04-2015 00:57 00000000  io/trivium/dep/  
       0  Stored        0   0% 10-04-2015 00:57 00000000  io/trivium/dep/com/
       0  Stored        0   0% 10-04-2015 00:57 00000000  io/trivium/dep/com/google/
       0  Stored        0   0% 10-04-2015 00:57 00000000  io/trivium/dep/com/google/common/  
       0  Stored        0   0% 10-04-2015 11:35 00000000  io/trivium/dep/com/google/common/annotations/
       0  Stored        0   0% 10-04-2015 00:57 00000000  io/trivium/dep/com/google/common/base/
{% endhighlight %}
