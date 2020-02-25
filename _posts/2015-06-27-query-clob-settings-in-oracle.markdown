---
layout: post
title:  "query clob settings in oracle"
date:   2015-06-27 11:31:54 +0200
tags: oracle
---
You can query all clob related settings from the database with the following query.
{% highlight sql %}
SELECT table_name,
  column_name,
  securefile  AS "isSecureFile",
  compression AS "Compressed" ,
  encrypt     AS "Encrypted",
  DEDUPLICATION as "Deduplicated",
  in_row      AS "StoredInRow"
FROM user_lobs
{% endhighlight %}

| TABLE_NAME            |  COLUMN_NAME  | isSecureFile | Compressed | Encrypted | Deduplicated | StoredInRow |
| --------------------- | -----------| ---------|---|-|-| -|
|SAMPLE_DATASET_INTRO|XMLDATA|YES|NO|NO|NO|YES|
|SAMPLE_DATASET_EVOLVE|XMLDATA|YES|NO|NO|NO|YES|
|SAMPLE_DATASET_PARTN|XMLDATA|YES|NO|NO|NO|YES|
|SAMPLE_DATASET_FULLTEXT|XMLDATA|YES|NO|NO|NO|YES|
|SAMPLE_DATASET_XQUERY|XMLDATA|YES|NO|NO|NO|YES|
|SAMPLE_DATASET_REPOS|IMAGE|YES|NO|NO|NO|YES|
