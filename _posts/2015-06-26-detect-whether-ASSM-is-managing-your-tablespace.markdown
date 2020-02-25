---
layout: post
title:  "detect whether ASSM is managing your tablespace"
date:   2015-06-26 12:03:54 +0200
tags: oracle
---
I recently had an oracle database where I wanted to compress the clob store for more storage efficiency. To do that, I needed to convert the clob store from basicfiles to securefiles.
As a requirement to use compressed securefiles, oracel states, that the tablespace must be managed by ASSM (Automatic Segment Space Management).
In order to check this, I found the following sql query.
{% highlight sql %}
select tablespace_name, SEGMENT_SPACE_MANAGEMENT
  from user_tablespaces;
{% endhighlight %}
The output looks like:
{% highlight sql %}
TABLESPACE_NAME                SEGMENT_SPACE_MANAGEMENT
------------------------------ ------------------------
SYSTEM                         MANUAL
SYSAUX                         AUTO  
TEMP                           MANUAL
USERS                          AUTO  
EXAMPLE                        AUTO  
|
 11 rows selected
{% endhighlight %}
* AUTO means ASSM is managing the tablespace
* MANUAL means the tablespace is manually managed

The ASSM property can also be queried by table name.
{% highlight sql %}
SELECT segment_name table_name,segment_subtype
FROM user_segments
where segment_type='TABLE';
{% endhighlight %}
The output looks like:
{% highlight sql %}
TABLE_NAME       SEGMENT_SUBTYPE
--------------------------------
T1               ASSM
|
 1 row selected
{% endhighlight %}
