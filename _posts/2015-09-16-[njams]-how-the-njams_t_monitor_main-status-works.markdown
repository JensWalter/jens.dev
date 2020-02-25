---
layout: post
title:  "[njams] how the njams_t_monitor_main status works"
date:   2015-09-16 09:11:54 +0200
tags: njams
---
nJAMS/BWPM has a rather complex system for determining the status of a process.
Although all of this is easily accessible through the GUI, you sometimes need to go directly to the database for some further reporting. So here the select to get the calculated state of the GUI.

{% highlight sql %}
SELECT m.jobstart,o.deployment_name,o.objectname,
  CASE
    WHEN m.LASTEVENTSTATUS='3' THEN 'error'
    WHEN m.LASTEVENTSTATUS='2' THEN 'warning'
    WHEN m.LASTEVENTSTATUS='1' THEN
      CASE
        WHEN m.status='3' THEN 'success with error'
        WHEN m.status='2' THEN 'success with warning'
        WHEN m.status='1' THEN 'success'
      END
    WHEN m.LASTEVENTSTATUS='0' THEN 'running'
  END status
FROM njams_t_monitor_main m
INNER JOIN njams_t_domain_objects o ON m.DOMAIN_OBJECT_ID=o.OBJ_ID
{% endhighlight %}

**result:**

|jobstart|deployment|process|status|
|:------:|----------|-------|:------:|
15-07-16 13:57:00|C1_Services|O/C/Starter_C1_SendOrder.process|**success**
15-07-16 14:04:00|ESB_Engine|O/O/Starter_OrderTransformationService.process|**success**
15-07-16 14:05:00|SAP_Services|O/S/Starter_ReceiveOrder_SAP.process|**success**
15-07-16 14:08:00|ESB_Engine|O/O/Starter_OrderTransformationService.process|**error**
15-07-16 14:09:30|ESB_Engine|O/O/Starter_OrderConfirmationService.process|**warning**
15-07-16 14:10:30|C1_Services|O/C/Starter_ReceiveOrderConfirmation_C1.process|**success**
15-07-16 14:11:30|C1_Services|O/C/Starter_ReceiveOrderConfirmation_C1.process|**success with warning**
15-07-16 14:59:30|SAP_Services|O/S/Starter_SAP_SendOrderConfirmation.process|**success with error**
15-07-16 15:00:00|DWH_Services|O/D/Starter_ReceiveOrder_DWH.process|**success**
15-07-16 15:02:00|C1_Services|O/C/Starter_C1_SendOrder.process|**success**


&nbsp;
&nbsp;


> all the stuff shown here works with version 3.1, no clue about other versions of the software
