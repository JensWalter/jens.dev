---
title: why sub-selects can be faster than inner joins
date: 2009-06-25T14:28:26+00:00
layout: post
tags:
  - performance
  - postgres
---
So here is my situation. I have 2 tables with the following DDL.

{% highlight sql %}
CREATE TABLE tags
(
  id bigint NOT NULL,
  "value" character varying(150),
  CONSTRAINT tags_pkey PRIMARY KEY (id),
  CONSTRAINT tags_value_key UNIQUE (value)
)
{% endhighlight %}
 

{% highlight sql %}
CREATE TABLE sites_tags
(
  sites_id bigint NOT NULL,
  pages_id bigint NOT NULL,
  tags_id bigint NOT NULL,
  count integer,
  updated timestamp without time zone,
  CONSTRAINT sites_tags_pkey PRIMARY KEY (sites_id, pages_id, tags_id)
)
{% endhighlight %}

As you can see, the tags table is a simple value-id-table. The second table represents a join table between pages and tags.

The goal of my Query should be to get the most used tag from the join table. Only the first x-Rows are of interest to me. To get there I used a simple limit command. So just for comparison here a simple query of the join table without the actual values.

{% highlight sql %}
select sum(st.count) as anzahl from sites_tags st group by st.tags_id order by anzahl desc limit 50;
                                                                QUERY PLAN                                                                
------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=13185.22..13185.35 rows=50 width=12) (actual time=1974.893..1975.033 rows=50 loops=1)
   ->  Sort  (cost=13185.22..13192.27 rows=2819 width=12) (actual time=1974.888..1974.941 rows=50 loops=1)
         Sort Key: (sum(count))
         Sort Method:  top-N heapsort  Memory: 18kB
         ->  HashAggregate  (cost=13056.34..13091.58 rows=2819 width=12) (actual time=1766.681..1876.092 rows=66136 loops=1)
               ->  Seq Scan on sites_tags st  (cost=0.00..10202.56 rows=570756 width=12) (actual time=0.120..690.719 rows=570756 loops=1)
 Total runtime: 1975.669 ms
(7 rows)
{% endhighlight %}

This is just a statement to get you the picture of cost for a simple query (without fetching any actual values).

To make this query useful I needed to add the values. All the values will be joined through the tags table.

Here the first implementation I came up with.

{% highlight sql %}
select t.value,sum(st.count) as anzahl from sites_tags st inner join tags t on t.id=st.tags_id group by st.tags_id,t.value order by anzahl desc limit 50;
                                                                      QUERY PLAN                                                                      
------------------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=123002.69..123002.82 rows=50 width=22) (actual time=12640.100..12640.239 rows=50 loops=1)
   ->  Sort  (cost=123002.69..124429.58 rows=570756 width=22) (actual time=12640.095..12640.153 rows=50 loops=1)
         Sort Key: (sum(st.count))
         Sort Method:  top-N heapsort  Memory: 20kB
         ->  GroupAggregate  (cost=91200.58..104042.59 rows=570756 width=22) (actual time=10165.002..12537.121 rows=66136 loops=1)
               ->  Sort  (cost=91200.58..92627.47 rows=570756 width=22) (actual time=10162.562..11564.604 rows=570756 loops=1)
                     Sort Key: st.tags_id, t.value
                     Sort Method:  external merge  Disk: 18808kB
                     ->  Hash Join  (cost=1877.06..24921.63 rows=570756 width=22) (actual time=259.674..3080.093 rows=570756 loops=1)
                           Hash Cond: (st.tags_id = t.id)
                           ->  Seq Scan on sites_tags st  (cost=0.00..10202.56 rows=570756 width=12) (actual time=0.070..781.449 rows=570756 loops=1)
                           ->  Hash  (cost=1050.36..1050.36 rows=66136 width=18) (actual time=259.518..259.518 rows=66136 loops=1)
                                 ->  Seq Scan on tags t  (cost=0.00..1050.36 rows=66136 width=18) (actual time=0.027..115.197 rows=66136 loops=1)
 Total runtime: 12647.403 ms
(14 rows)
{% endhighlight %}

As you can see, simply joining the table makes this query quite complex. The part which consumes most of the cost is the more complicated group by clause. Now the execution engine has to join these tables and then sort all values by id and string (mostly the value is the important part).

To avoid this there only could be one solution – remove the join. With removing the join there comes the question how to get the values from the second table. One way to do this would be to use the program (in my case a php web application) to query again for every line of the result set.

Another way to approach this would be to do a sub-select in the select section. This way you don’t have the additional round trip of doing it in the application. Another advantage would be that the database would only do these sub-selects for the actually returning rows (with respect of the limit).

So here the query I came up with (with the query execution plan)

{% highlight sql %}
select (select value from tags t where t.id=st.tags_id),sum(st.count) as anzahl from sites_tags st group by st.tags_id order by anzahl desc limit 50;
                                                                QUERY PLAN                                                                 
-------------------------------------------------------------------------------------------------------------------------------------------
 Limit  (cost=36511.94..36512.07 rows=50 width=12) (actual time=2682.650..2682.790 rows=50 loops=1)
   ->  Sort  (cost=36511.94..36518.99 rows=2819 width=12) (actual time=2682.645..2682.705 rows=50 loops=1)
         Sort Key: (sum(st.count))
         Sort Method:  top-N heapsort  Memory: 20kB
         ->  HashAggregate  (cost=13056.34..36418.30 rows=2819 width=12) (actual time=1752.934..2570.690 rows=66136 loops=1)
               ->  Seq Scan on sites_tags st  (cost=0.00..10202.56 rows=570756 width=12) (actual time=0.109..713.541 rows=570756 loops=1)
               SubPlan
                 ->  Index Scan using tags_pkey on tags t  (cost=0.00..8.27 rows=1 width=10) (actual time=0.006..0.007 rows=1 loops=66136)
                       Index Cond: (id = $0)
 Total runtime: 2683.478 ms
(10 rows)
{% endhighlight %}

As you can see i still costs a lot. It is still 3 times more expensive then doing it without the values. On the other hand the cost is only a fourth of the cost of the join. This is mostly owed to the limit clause. The join has no way of knowing that it would be enough to run the limit without the join and later join the values. So far I found no way to tell postgres to do this more efficient.

So the simplest solution for that would be to do sub-queries. With that, the limit clause will be honored.

So as this example shows, it is always a good idea to try different approaches to one and the same query. Often you can see lots of differences in the execution plan which can have a major impact on performance.
