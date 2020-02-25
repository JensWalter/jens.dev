---
layout: post
title:  "query index usage statistics in oracle"
date:   2015-07-11 17:52:54 +0200
tags: oracle
---
**how often an index was used**
{% highlight sql %}
select
   p.object_name "object",
   to_char(sn.begin_interval_time,'yyyy-mm')  "Begin|Interval|time",
   p.search_columns                                 "Search Columns",
   count(*)                                         "Invocation|Count"
from
   dba_hist_snapshot  sn,
   dba_hist_sql_plan   p,
   dba_hist_sqlstat   st
where
    st.sql_id = p.sql_id
and
   sn.snap_id = st.snap_id   
and   
   p.object_name like '%INDEX_%'
group by
   p.object_name,to_char(sn.begin_interval_time,'yyyy-mm'),search_columns
{% endhighlight %}

**how an index was used**
{% highlight sql %}
select
   p.object_name c1,
   p.operation   c2,
   p.options     c3,
   count(1)      c4
from
   dba_hist_sql_plan p,
   dba_hist_sqlstat s
where
   p.object_owner <> 'SYS'
and
   p.operation like '%INDEX%'
and
   p.sql_id = s.sql_id
group by
   p.object_name,
   p.operation,
   p.options
order by
   4,1,2,3
{% endhighlight %}
