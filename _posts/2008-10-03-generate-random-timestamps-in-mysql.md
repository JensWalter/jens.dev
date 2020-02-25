---
title: generate random timestamps in mysql
date: 2008-10-03T12:13:15+00:00
layout: post
tags:
  - mysql
  - random timestamp
---
I’m now try to prepare a mysql performance comparison between hdd and flash. So to create a lot of test data I needed a function to create random timestamps in a certain range.

After trying google I gave up and started with the mysql documentation and came up with the following statement:

{% highlight sql %}
select from_unixtime(
       unix_timestamp('2008-01-01 01:00:00')+floor(rand()*31536000)
);
{% endhighlight %}

So lets break it it down a bit:

first I set a start date (minimum for the random)

> unix_timestamp(‘2008-01-01 01:00:00’)

now you have the timestamp in Unix timestamp format. This means you can add any given seconds interval to it.

> rand()*31536000

For me I wanted a value between 2008 and 2009 (one year: 60 seconds \* 60 minutes \* 24 hours * 365 days = 31536000). Because the Unix timestamp doesn’t support fractions your need to round the value to an int. (floor or round the value).

After the addition you just convert it back from Unix timestamp to a mysql timestamp.

so here the generic formula:

{% highlight sql %}
select from_unixtime(
      unix_timestamp( 'start timestamp')
     +floor(rand()* (max interval in seconds) )
);
{% endhighlight %}
