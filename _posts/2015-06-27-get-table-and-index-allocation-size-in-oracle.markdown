---
layout: post
title:  "get table and index allocation size in oracle"
date:   2015-06-27 08:13:54 +0200
tags: oracle
---
[part 2 -> now with partitioned tables]({% post_url 2016-06-21-get-oracle-allocation-sizes-part-2 %})

Determining the size of a table can be a bit tricky within oracle.
You can size all columns and add the values together. That woul give you an estimate of a row size. If you do that for all rows, you got the net size of data you are storing. This of cause does not account for index and table overhead.
To get more realisitc view of the storage requirments, you can query the size, which oracle has allocated for your user objects. Even this is an estimate, since it does not account for fragmentation or other side effect. But you can see what is actually allocated within the tablespace.
{% highlight sql %}
SELECT segment_name table_name, sum(bytes) tablesize,
  (SELECT sum(bytes) FROM user_segments ind
    WHERE segment_name in
      (select index_name from user_indexes
        where table_name=tab.segment_name)
  ) indexsize
FROM user_segments tab
WHERE segment_type='TABLE'
group by (segment_name)
order by segment_name;
{% endhighlight %}

| TABLE_NAME            |  TABLESIZE  | INDEXSIZE |
| --------------------- | -----------:| ---------:|
| DEPT                  | 65536       | 65536     |
|EMP                    | 65536       |    65536  |
|SALGRADE               | 65536       |           |
|SAMPLE_DATASET_EVOLVE  |  9437184    |     458752|
|SAMPLE_DATASET_FULLTEXT|  9437184    |     458752|
|SAMPLE_DATASET_INTRO   |  9437184    |     458752|
|SAMPLE_DATASET_PARTN   |  9437184    |     458752|
|SAMPLE_DATASET_REPOS   |  65536      |      65536|
|SAMPLE_DATASET_XQUERY  |  9437184    |     458752|
