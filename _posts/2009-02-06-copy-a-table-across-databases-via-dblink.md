---
title: copy a table across databases via dblink
date: 2009-02-06T15:32:40+00:00
layout: post
tags:
  - dblink
  - postgres
---
Recently I ran into the situation that I needed to copy a large subset of data from one database to another. Normally I would say, make a dump and then re-import the data into the new schema. But this solution has some serious drawbacks. First you have to copy the complete database. Second you have to maintain the structure of the data. A third problem could be that you have to copy the complete dump to the target location (in case it is not the same machine and your database is a bit larger e.g. some gigabyte). Having these drawbacks in mind I started searching for an alternative solution for my problem.

Here some facts to render my situation more precisely.

  * database containing multiple tables
  * only one has relevant data
  * only the subset of 1 month is needed

**ddl for the original table:**

{% highlight sql %}
CREATE TABLE realtime
(
name varchar(10),
date timestamp,
bid numeric,
ask numeric
)
{% endhighlight %}

**ddl for the target table:**

{% highlight sql %}
CREATE TABLE realtime
(
symbol varchar(10),
date timestamp,
price numeric,
"day" char(5),
max numeric,
avg numeric,
atr numeric
)
{% endhighlight %}

**here the mapping:**

realtime.name -> realtime.symbol

realtime.date -> realtime.date

(realtime.bid + realtime.ask) /2 -> realtime.price

-> other columns filled by trigger

To get this task done I decided to use a dblink between those two database instances ([how-to here](http://www.postgresql.org/docs/current/static/contrib-dblink.html)).

So here is the select I used to transfer the month January to the new db:

{% highlight sql %}
insert into realtime (symbol,date,price)
select * from dblink('dbname=stocks',
              'select name,date,(bid+ask)/2 as price
              from realtime
              where date > to_date(''20081231'',''yyyyMMDD'') and date &lt; to_date(''20090201'',''yyyyMMDD'')')
         as t1 (name character varying,date timestamp,price numeric);
{% endhighlight %}

As you can see this approach is pretty straight forward. You basically write an insert statement for the new table and use a dblink as source. In the dblink definition you can apply any given sql criteria.

One real drawback has this solution, because of the mode of operation of the dblink approach it is pretty slow. Here is what the postgres documentation has to say about this:

dblink fetches the entire remote query result before returning any of it to the local system. If the query is expected to return a large number of rows, it’s better to open it as a cursor with dblink_open and then fetch a manageable number of rows at a time.For me the performance was ok because I just copied several hundred megabytes.
