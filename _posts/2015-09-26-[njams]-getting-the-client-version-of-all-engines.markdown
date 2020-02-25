---
layout: post
title:  "[njams] getting the client version of all engines"
date:   2015-09-26 15:41:54 +0200
tags: njams
---
After migrating a nJAMS on a large BusinessWorks environment, you need to check, whether all engines are actually using the updated version of the client. To check this, you can either check every engine log file or you can just go directly to the database.

{% highlight sql %}
SELECT o.DOMAIN_NAME domain,
  o.OBJECTNAME engine,
  o.CLIENT_VERSION,
  o.LAST_UPDATE
FROM njams_t_domain_objects o
WHERE o.type=3
{% endhighlight %}

**result:**

|domain|engine|client_version|last_update|
|-----|:-------|:-------------:|:-----------|
fs_dev|C1_Services-C1_Services-1|3.0.1 (Build: 13649)|15-09-08 06:03:44,687950000 -07:00
SAP 00|IDOC_INBOUND|3.1.0|15-09-23 02:54:22,094548000 -07:00
fs_dev|ESB_Engine-ESB_Services-1|3.0.0.1 (Build: 9018)|15-09-08 06:02:15,381295000 -07:00
fs_dev|C2_Services-C2_Services|3.0.1 (Build: 13649)|15-09-08 06:02:16,678376000 -07:00
fs_dev|DWH_Services-DWH_Services|2.1.2 (Build: 4414)|15-09-08 06:02:45,705832000 -07:00
fs_dev|SAP_Services-SAP_Services|2.1.2 (Build: 4414)|15-09-08 06:02:45,711837000 -07:00
fs_dev|tracktest-tracktest|3.0.0.1 (Build: 9018)|15-09-08 06:10:16,776542000 -07:00
SAP 00|IDOC_OUTBOUND|3.1.0|15-09-23 02:54:21,928280000 -07:00


&nbsp;
&nbsp;


> all the stuff shown here works with version 3.1, no clue about other versions of the software
