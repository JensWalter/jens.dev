---
layout: post
title:  "migrating a mongodb to AWS Athena"
date:   2017-03-27 12:52:54 +0200
tags: athena mongodb
---
I have an existing application that uses a mongodb to store metadata on files to make them searchable. Since searching in those records is not very time sensitive for me, I thought about migrating the whole database to S3/Athena. The advantage here would be, that there would be no longer a database to maintain, since Athena runs serverless on AWS.

I started with a JSON-export of mongodb, to have a look at the document structure.

{% highlight BASH %}
mongoexport --db db --collection jens --out kanri.json
{% endhighlight %}

Unfortunately, this only worked until I discovered the different format that mongodb is storing my filesize information.
{% highlight JSON %}
"size":{"$numberLong":"636649"}
"size":232206
"size":1.953838e+06
"size":951442.0
{% endhighlight %}

So I decided so export my data through the following php script to unify the different number formats into one.

{% highlight php %}
<?php

$m = new MongoClient();
$db = $m->selectDB("db");

$cursor = $db->jens->find();
$file = 'kanri_export.json';
foreach($cursor as $item){
	echo json_encode($item)."\n";
}

?>
{%endhighlight %}
So here is my document structure to begin with.

{% highlight JSON %}
{
  "_id": {
    "$id": "4f75dfe6c06b88c92c000000"
  },
  "description": "njams datasheet",
  "files": [{
    "type": "application\/pdf",
    "name": "nJAMS datasheet.pdf",
    "size": 636649,
    "md5": "4ad2052803db0e6e7455fd5af0e9e6d6"
  }],
  "modified": {
    "sec": 1344177194,
    "usec": 676000
  },
  "tags": ["njams", "fasi", "datasheet"],
  "ts": {
    "sec": 1333132200,
    "usec": 0
  }
}
{% endhighlight %}

I uploaded the whole document into a S3 bucket and then started to look into Athena.

As I found out, Athena (and hereby presto), has some issues with this source format, since it cannot access any element containing a special character like '$' or '_'. For those characters I needed to create a mapping for the SerDe to handle those fields.

Here is the table definition I came up with:

{% highlight SQL %}
CREATE external TABLE structured(
  id struct<oid:string>,
  description string,
  files array<struct<type:string,
                     name:string,
                     size:bigint,
                     md5:string
                    >
             >,
  modified struct<sec:bigint,
                  usec:bigint>,
  tags array<string>,
  ts struct<sec:bigint,
            usec:bigint>
)
row format serde 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
      "mapping.oid"="$id",
      "mapping.id"="_id"
)  
location 's3://kanri-meta/';
{% endhighlight %}

In addition to searching column-wise, mongo also supports searching per RegEx through the complete document. Since Athena only works in columns and rows I created a second table, which only contains the raw JSON string.

{% highlight SQL %}
create external table raw(
  content string
)
row format serde 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe'
STORED AS TEXTFILE
LOCATION 's3://kanri-meta/';
{% endhighlight %}

Now whenever I needed the Regex capability, I could join in the raw-table and run the RegEx on this column. Since Athena separates the read-logic from the actual storage, I also did not need to duplicate my data pool for this.
