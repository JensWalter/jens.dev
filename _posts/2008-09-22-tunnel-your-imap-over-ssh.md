---
title: tunnel your imap over ssh
date: 2008-09-22T21:06:12+00:00
layout: post
tags:
  - imap
  - linux
  - ssh
---
I recently had the situation that I needed access to my private email accounts at work. Lucky me, my employee prohibits imap connections to the outer world (security risk). So I had to find a way around that proxy to the mail server.

I stumbled upon an article how to use a persistent ssh connection as tunnel through different networks. So starting at that point and checking the ssh man page I came to the following statement (works only with public key authentication):

{% highlight bash %}
ssh -N -L 4510:localhost:25 -L 4500:localhost:143 user@host.net
{% endhighlight %}

This statement establishes a connection between the local and the remote host and hereby connects the local port 4510 with the remote port 25 (same with 4500). The next step was easy,I just configured my mail client to read from the imap server localhost:4500 and send mails via localhost:4510.

Now that I had the basics running I needed a way to make this connection persistent.

This could be done via a simple bash script which is called by the cron repeatedly.

{% highlight bash %}
#!/bin/sh
COMMAND="ssh -N -L 4510:localhost:25 -L 4500:localhost:143 user@host.net"
pgrep -f -x "$COMMAND" > /dev/null 2>&1 || $COMMAND
{% endhighlight %}

This script basically runs a ps and greps the output for the search string. When the string is not found it runs the string as command. If the string is found nothing would we done.

(I’m aware that clients like evolution have built-in support for ssh tunneling but I couldn’t get it running smoothly. It had always Problems with disconnects which never appeared with this solution)
