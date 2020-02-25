---
layout: post
title:  "[njams] getting a daily success/error rate per deployed service"
date:   2015-09-17 09:11:54 +0200
tags: njams
---
Often people ask for various reports which can be generated out of the nJAMS/BWPM data pool.

To start with a simple one, here the select for getting a success/error/warning rate of all deployed engines over time aggregated on daily basis.

{% highlight sql %}
select trunc(jobstart) datum, deployment_name,
    count(*) execution_count,
    sum(case when LASTEVENTSTATUS='1' then 1 else 0 end) success_count,
    sum(case when LASTEVENTSTATUS='2' then 1 else 0 end) warning_count,
    sum(case when LASTEVENTSTATUS='3' then 1 else 0 end) error_count,
    sum(case when LASTEVENTSTATUS='0' then 1 else 0 end) running_count
from (
  SELECT m.jobstart,o.deployment_name,m.LASTEVENTSTATUS
  FROM njams_t_monitor_main m
  INNER JOIN njams_t_domain_objects o ON m.DOMAIN_OBJECT_ID=o.OBJ_ID
) t
group by trunc(jobstart),deployment_name
order by trunc(jobstart),deployment_name
{% endhighlight %}

**result:**

|datum|service|executions|success|warning|error|running|
|-----|-------|:-------------:|:-----------:|:-----------:|:---------:|:-----------:|
15-07-15|C1_Services|733|733|0|0|0
15-07-15|C2_Services|146|146|0|0|0
15-07-15|DWH_Services|236|236|0|0|0
15-07-15|ESB_Engine|504|384|120|0|0
15-07-15|SAP_Services|313|245|49|19|0


&nbsp;
&nbsp;


> all the stuff shown here works with version 3.1, no clue about other versions of the software
