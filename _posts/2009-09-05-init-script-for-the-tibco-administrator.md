---
title: init script for the TIBCO Administrator
date: 2009-09-05T19:03:06+00:00
layout: post
tags:
  - BusinessWorks
  - shell
  - TIBCO
---
I recently ran into the situation that I needed to install a TIBCO BusinessWorks with Administrator onto a RedHat Server. Under Windows the installer provides everything you need to run your domain as a Service. In Linux this looks different. I have found no init script templates nor did the installer generate me some stubs. So I had to write them myself. So here is what I came up with (I know it isn’t perfect, but it works – suggestions are always welcome).

**for the Administrator:**

<pre class='prettyprint lang-shell'>#!/bin/bash

DOMAIN=tibcoesb
USER=esb
TIBCO_HOME=/home/$USER/tibco
PATH=/bin:/usr/bin:/sbin:/usr/sbin
NAME=tibco-admin

start() {
# Start daemons.
echo "Starting Tibco Admin"
/bin/su $USER -c"cd $TIBCO_HOME/administrator/domain/$DOMAIN/bin;./tibcoadmin_$DOMAIN 2>&1 | /usr/bin/logger -t $NAME" &
echo "done"
}

stop() {
# Stop daemons.
echo "Shutting down Tibco Admin"
killall tibcoadmin_$DOMAIN
echo "done"
}

case "$1" in
  start)
	start
	    ;;
  stop)
	stop
    	    ;;
  *)
        echo $"Usage: $0 {start|stop}"
    	exit 2
esac
</pre>

**for the Hawk**

<pre class='prettyprint lang-shell'>#!/bin/bash

DOMAIN=tibcoesb
USER=esb
TIBCO_HOME=/home/$USER/tibco
PATH=/bin:/usr/bin:/sbin:/usr/sbin
NAME=tibco-hawk

start() {
# Start daemons.
echo "Starting Tibco Hawk"
/bin/su $USER -c"cd $TIBCO_HOME/tra/domain/$DOMAIN;./hawkagent_$DOMAIN 2>&1 | /usr/bin/logger -t $NAME" &
echo "done"
}

stop() {
# Stop daemons.
echo "Shutting down Tibco Hawk"
killall hawkagent_$DOMAIN
echo "done"
}

case "$1" in
  start)
	start
	    ;;
  stop)
	stop
    	    ;;
  *)
        echo $"Usage: $0 {start|stop}"
    	exit 2
esac
</pre>
