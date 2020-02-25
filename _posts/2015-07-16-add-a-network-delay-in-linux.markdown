---
layout: post
title:  "add a network delay in linux"
date:   2015-07-16 16:34:54 +0200
tags: linux
---
Adding a delay to all network traffic is pretty easy and can be done through the following command.

**adding a delay**
{% highlight bash %}
#for device enp0s3
tc qdisc add dev enp0s3 root netem delay 100ms
{% endhighlight %}

**query the current delay**
{% highlight bash %}
#for all devices
tc -s qdisc
#for device enp0s3
tc qdisc show dev enp0s3
{% endhighlight %}

**removing the delay**
{% highlight bash %}
tc qdisc del dev enp0s3 root netem
{% endhighlight %}
