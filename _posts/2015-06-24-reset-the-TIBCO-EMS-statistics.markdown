---
layout: post
title:  "reset the TIBCO EMS statistics"
date:   2015-06-24 20:12:20 +0200
tags: tibco ems
---
resetting the TIBCO EMS statistics without restarting the server.

**before**
{% highlight bash %}
printf 'show stat queue > wide' \
  | ./tibemsadmin64 -server tcp://localhost:7222 -user user1 -password user1
{% endhighlight %}
{% highlight bash %}
TIBCO Enterprise Message Service Administration Tool.
Copyright 2003-2013 by TIBCO Software Inc.
All rights reserved.
Version 8.0.0 V9 6/7/2013
Connected to: tcp://localhost:7222
Type 'help' for commands help, 'exit' to exit:
tcp://localhost:7222>                                              In-Total         In-Rate             Out-Total        Out-Rate
Queue Name                                  Msgs   Size      Msgs   Size         Msgs   Size      Msgs   Size
<total>                                   701858    3.5 GB      0    0.0 Kb    547449    2.9 GB      0    0.0 Kb
njams.error                                  166  787.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
$TMP$.E4EMS-SERVER.1BCE55688D705A38.1          0    0.0 Kb      0    0.0 Kb         1    2.1 Kb      0    0.0 Kb
njams                                          0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
njams.test                                     0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
q.routed                                       0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
queue.1                                        0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
njams.command                                 48   25.1 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
$sys.redelivery.delay                          0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
q.output                                       0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
$sys.undelivered                               0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
njams.event                               680307    3.5 GB      0    0.0 Kb    547448    2.9 GB      0    0.0 Kb
$sys.admin                                  5942    1.2 MB      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
$sys.lookup                                15395    2.9 MB      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
{% endhighlight %}
**run command**
{% highlight bash %}
printf 'set server statistics=disabled\nset server statistics=enabled\n' \
  | ./tibemsadmin64 -server tcp://localhost:7222 -user user1 -password user1
{% endhighlight %}
**after:**
{% highlight bash %}
Connected to: tcp://localhost:7222
Type 'help' for commands help, 'exit' to exit:
tcp://localhost:7222>                                              In-Total         In-Rate             Out-Total        Out-Rate
Queue Name                                  Msgs   Size      Msgs   Size         Msgs   Size      Msgs   Size
<total>                                        2    0.4 Kb      0    0.0 Kb         1    2.1 Kb      0    0.0 Kb
njams.error                                    0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
$TMP$.E4EMS-SERVER.1BCE55688D705A3F.1          0    0.0 Kb      0    0.0 Kb         1    2.1 Kb      0    0.0 Kb
njams                                          0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
njams.test                                     0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
q.routed                                       0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
queue.1                                        0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
njams.command                                  0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
$sys.redelivery.delay                          0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
q.output                                       0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
$sys.undelivered                               0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
njams.event                                    0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
$sys.admin                                     2    0.4 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
$sys.lookup                                    0    0.0 Kb      0    0.0 Kb         0    0.0 Kb      0    0.0 Kb
{% endhighlight %}
