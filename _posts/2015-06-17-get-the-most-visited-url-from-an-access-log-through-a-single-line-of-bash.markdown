---
layout: post
title:  "get the most visited url from an access log through a single line of bash"
date:   2015-06-17 12:25:20 +0200
tags: bash apache
---
If you have an apache access log and want to see the visit count of your site, you can use this one-liner to get some basic visit stats.
{% highlight bash %}
grep "200 " /var/log/apache2/apimeister-access.log \
  | grep -v 'Googlebot' \
  | grep -v 'Baiduspider' \
  | grep -v 'bingbot' \
  | grep -v 'YandexBot' \
  | grep -v 'MJ12bot' \
  | grep -v 'meanpathbot' \
  | grep -v 'DotBot' \
  | grep -v 'AhrefsBot' \
  | cut -d '"' -f 2 \
  | cut -d ' ' -f 2 \
  | sort | uniq -c | sort -rn | less
{% endhighlight %}
