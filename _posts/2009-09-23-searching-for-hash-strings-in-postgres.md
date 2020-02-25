---
title: searching for hash strings in postgres
date: 2009-09-23T15:54:14+00:00
layout: post
tags:
  - performance
  - postgres
---
For one of my projects a have a database which has a rather large table consisting of just an url and a corresponding id. For performance reasons I added a md5 column which hashes the url. With this column it should be a lot faster to look up an url.

{% highlight sql %}
CREATE TABLE pages
(
  id bigint NOT NULL,
  url character varying(255),
  md5 character(32),
  CONSTRAINT pages_pkey PRIMARY KEY (id)
)
{% endhighlight %}

The faster lookup should mainly be possible through the shorter column length (and therefore smaller index). Actually I don’t know if the fixed width is good or bad here, but hashes usually don’t vary in length. After creating this table I added a B-Tree unique Index to the md5 column to enable a fast lookup.

After a while a noticed a rather high CPU load on lookups for this table so I tried to analyze the problem. First I tried the obvious through psql.

{% highlight sql %}
cloud=# explain analyze select * from pages where md5 ='abc';
                                                     QUERY PLAN
---------------------------------------------------------------------------------------------------------------------
 Index Scan using i_pages_md5 on pages  (cost=0.00..8.50 rows=1 width=166) (actual time=0.046..0.046 rows=0 loops=1)
   Index Cond: (md5 = 'abc'::bpchar)
 Total runtime: 0.157 ms
(3 rows)
{% endhighlight %}

As the explain shows all works perfectly fine and lookups shouldn’t be a problem. So there had to be something different what was going on.

After that I tried the same select with an actual md5.

{% highlight sql %}
cloud=# explain analyze select * from pages where md5 = md5('abc');
                                                  QUERY PLAN
--------------------------------------------------------------------------------------------------------------
 Seq Scan on pages  (cost=0.00..32017.63 rows=3994 width=166) (actual time=1203.699..1203.699 rows=0 loops=1)
   Filter: ((md5)::text = '900150983cd24fb0d6963f7d28e17f72'::text)
 Total runtime: 1203.769 ms
(3 rows)
{% endhighlight %}

Now you can see the plan does change quite a lot. I have a full table scan instead of an index scan. You can also see that the query time increases nearly by factor ten thousand.

The reason for this dramatic change is a simple type mismatch. For whatever reason the md5 function will be evaluated to a string of the type text. To create a match with the column md5 all values had to be casted to that type. The side effect of this is that the index can no longer be used, because it is of the wrong type.

To solve this I just had to cast the result of the md5 function back to something that is compatible with the index type. In my case I used a fixed width character field which is represented in the database as bpchar (blank padded character). So after modifying the query to the following I was back on index usage.

{% highlight sql %}cloud=# explain analyze select * from pages where md5 = md5('abc')::bpchar;
                                                     QUERY PLAN
---------------------------------------------------------------------------------------------------------------------
 Index Scan using i_pages_md5 on pages  (cost=0.00..8.50 rows=1 width=166) (actual time=0.141..0.141 rows=0 loops=1)
   Index Cond: (md5 = '900150983cd24fb0d6963f7d28e17f72'::bpchar)
 Total runtime: 0.199 ms
(3 rows)
{% endhighlight %}
