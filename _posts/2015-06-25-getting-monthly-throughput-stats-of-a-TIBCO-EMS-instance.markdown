---
layout: post
title:  "getting monthly throughput stats of a TIBCO EMS instance"
date:   2015-06-25 10:22:10 +0200
tags: tibco ems
---
The TIBCO EMS does not provide the capability to gather monthly throughput statistics on its own. So we we have to improvise to get some stats on a regularly basis.
The process would look like the following.

* get message statistics
* reset stats to zero

**get the stats as csv**
{% highlight bash %}
printf 'show stat queue > wide\nshow stat topic > wide\n'
  | ./tibemsadmin64 -server tcp://localhost:7222 -user user1 -password user1
  | awk 'NR>11'
  | awk '{ printf $1";"$2";"$8"\n"; }'
  | grep -v 'tcp://'
  | grep -v '<total>'
{% endhighlight %}
The output looks like:
{% highlight bash %}
#queue/topic-name;inputCount;outputCount
njams.error;0;0
$TMP$.E4EMS-SERVER.1BCE55688D705A4A.1;0;1
njams;0;0
njams.test;0;0
q.routed;0;0
queue.1;0;0
njams.command;0;0
$sys.redelivery.delay;0;0
q.output;0;0
$sys.undelivered;0;0
njams.event;12636;0
$sys.admin;25;0
$sys.lookup;1;0
Topic;Name;Size
topic1;0;0
{% endhighlight %}

**reset EMS statistics**

see [reset the EMS statistics]({% post_url 2015-06-24-reset-the-TIBCO-EMS-statistics %})

Now put both in a bash script and run them once a month.
