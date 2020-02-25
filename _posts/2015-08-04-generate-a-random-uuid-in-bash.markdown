---
layout: post
title:  "generate a random uuid in bash"
date:   2015-08-04 16:21:54 +0200
tags: bash uuid
---
To generate a UUIDv4 (random UUID) you can execute the following command.

{% highlight bash %}
cat /proc/sys/kernel/random/uuid
a01766f8-c4f5-4506-9262-1b408132f048
{% endhighlight %}

using uuidgen leads to the following outputs.
{% highlight bash %}
#getting a time based uuid
uuidgen -t
89a25fa8-3ab4-11e5-a414-14dae9ef67fb
#getting a random based uuid
uuidgen -r
6b81ed73-bd0b-4fc7-9f9a-709e121323b2
{% endhighlight %}
