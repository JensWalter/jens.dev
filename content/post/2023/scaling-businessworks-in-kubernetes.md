---
title:  "Scaling BusinessWorks in Kubernetes"
date:   2023-05-5T10:08:54Z
tags:
 - tibco
 - cloud
---
Scaling our services in Kubernetes represented a multitude of problems.

As long as our engine contain multiple process starter, the engine can only be manually scaled. Only the developer/maintainer of that engine knows how it behaves if we scale from 1 instance to 2.

Also every Starter in BusinessWorks comes with its own special need in term of parallelism. For Example a Queue receiver can scale horizontally, where as a Topic Consumer cannot.
Also Timer based processes need a guarantee that only one instance is running at one point in time.

Also Tibco internal processes like Synchornization-Groups or Shared Variables (across engines) do no longer work as expected.

So lets drill down into one problem at a time.

### Engine Complexity

Every engine must be brought down to aingle starter. All multi-Starter engines can only fall back to manual scaling.

Every engine must expose some property how operations can derive that this engine is horizontally scalable.

Vertical scaling of BusinessWorks is even more complex, so we only did this when we are out of options. This kind of scaling always needed coordination between the developers and operations.

### Different Starter Types

All queue based engines can be scaled horizontally because EMS takes care of the distribution of messages.

All topic based engines should be refactored into queue based engine. If that was not possible, those engines are not scaled and stay with a replica count of one.