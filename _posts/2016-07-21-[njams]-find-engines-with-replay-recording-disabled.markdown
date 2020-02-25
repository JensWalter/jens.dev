---
layout: post
title:  "[njams] find engines with replay recording disabled"
permalink: 2016/07/21/njams-find-engines-with-replay-recording-disabled.html
date:   2016-07-21 11:15:54 +0200
tags: njams
---
From time to time it happens that somebody disables njams replay recording on some engine for whatever reason and forgets about it. So later on when you need an overview on what engine recording is actually disabled, you can run the following select to gather that insight.

The select checks if there are messages, which have/had no recorded information for replay. As a safeguard, the query checks if later jobs of the affected engine report recorded data (recording was re-enabled afterwards).

{% highlight sql %}
select engine_name,objectname process_name,max(attribute_ts) last_activity
from (
  select a.main_logid,
    sum(case when attribute_name='$njams_recorded' then 1 else 0 end) recorded,
    max(a.attribute_ts) attribute_ts
  from njams_t_monitor_attributes a
  group by a.main_logid
) x
inner join njams_t_monitor_main m on x.main_logid=m.logid
inner join njams_t_domain_objects o on m.domain_object_id=o.obj_id
where x.recorded=0
  and x.attribute_ts >
    nvl(
      (select max(m.jobstart) jobstart
       from njams_t_monitor_main m
       where o.obj_id=m.domain_object_id)
      ,sysdate-999)
group by o.engine_name,o.objectname
{% endhighlight %}

**result:**

|engine_name|process_name|last_activity|
|-----|:-------|:-------------|
process_dot|process_nesting/Starter.process|16-07-20 12:57:51.142
yf-sample|fetch/starter.process|16-07-14 16:10:45.338

&nbsp;
&nbsp;


> all the stuff shown here works with version 3.1, no clue about other versions of the software
