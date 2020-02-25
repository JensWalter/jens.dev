---
layout: post
title:  "extract the UUIDv1 encapsulated timestamp within an oracle select"
date:   2015-06-14 18:34:23 +0200
tags: oracle sql uuid
---
When you have a partioned table full of UUIDs but partitioned through timestamp, you need a way to translate the UUID back into a timestamp to match a partition where the key is stored. So here is my way of how to extract the timestamp out of an UUIDv1.
{% highlight sql %}
select ts,to_timestamp(date '1970-01-01'+ (ts/(24*60*60)))
from (
  select
    trunc((to_number(substr(uuid,16,3)||'000000000000' ,'xxxxxxxxxxxxxxxx')
          +to_number(substr(uuid,10,4)||'00000000' ,'xxxxxxxxxxxxxxxx')
                       +to_number(substr(uuid,0,8) ,'xxxxxxxxxxxxxxxx')
      -122192928000000000)/10000000) ts
  from (
    select '0f0e9cea-121c-11e5-a831-14dae9ef67fb' uuid from dual
  )
)
{% endhighlight %}
