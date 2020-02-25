---
layout: post
title:  "get oracle allocation sizes part 2"
date:   2016-06-21 19:54:54 +0200
tags: oracle
---
In my previous [post]({% post_url 2015-06-27-get-table-and-index-allocation-size-in-oracle %}) I looked at table and index sizes. This was fine for simple tables. Now I got the same request, but wanted to size a table which also included partitions and subpartitions.

{% highlight sql %}
SELECT segment_name table_name, sum(bytes) tablesize,
  (SELECT sum(bytes) FROM user_segments ind
    WHERE segment_name in
      (select index_name from user_indexes
        where table_name=tab.segment_name)
  ) indexsize,
  (SELECT sum(bytes) FROM user_segments ls
    WHERE segment_name in
      (select segment_name from user_lobs
        where table_name=tab.segment_name)
  ) lobsize
FROM user_segments tab
WHERE segment_type in ('TABLE','TABLE PARTITION','TABLE SUBPARTITION')
group by (segment_name)
order by segment_name;
{% endhighlight %}
