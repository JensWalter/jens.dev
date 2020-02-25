---
layout: post
title:  "calculating percentiles in oracle"
date:   2015-09-15 16:11:54 +0200
tags: oracle
---
Calculating percentiles in oracle is pretty easy.

In my case I had logged service response times in a database and now wanted to get response times back as percentiles.
{% highlight sql %}
SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms ASC) "50percentile",
PERCENTILE_CONT(0.8) WITHIN GROUP (ORDER BY duration_ms ASC) "80percentile",
PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY duration_ms ASC) "90percentile",
PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms ASC) "95percentile",
PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms ASC) "99percentile",
PERCENTILE_CONT(0.999) WITHIN GROUP (ORDER BY duration_ms ASC) "99.9percentile",
PERCENTILE_CONT(1) WITHIN GROUP (ORDER BY duration_ms ASC) "max"
FROM njams_t_monitor_main m
WHERE m.DURATION_MS IS NOT NULL --to exclude still running processes
{% endhighlight %}

**result:**

| 50percentile | 80percentile | 90percentile | 95percentile | 99percentile | 99.9percentile | max |
|:------------:|:------------:|:------------:|:------------:|:------------:|:--------------:|:---:|
| 223 | 430 | 540 | 620 | 975.3 | 3563.3 | 14706 |
