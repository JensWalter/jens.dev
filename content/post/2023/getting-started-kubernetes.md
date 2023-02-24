---
title:  "Getting Started with Kubernetes"
date:   2023-05-5T10:08:54Z
tags:
 - tibco
 - cloud
---
The more engines we migrated, the more we reached the limits of our approach.

Deployments grew more and more complex, since we could not check or validate our YAML before bringing it to an actual machine. Sizing Hardware also was an issue, since adding or removing machines still was a manual task.

The deployment was still error prone and relied on bash script execution on the target host. Analyzing issues become more complex.

EMS deployment (Queues/Topics/Bridges) was not possible with the current approach.

So far we had no way of implementing persitence, since all containers were running stateless and local files would get discarded after the container completed.

Also docker-compose has no concept of how we could scale our configuration out to the multitude of our DEV/TEST environments (which we had tens of to support). So maintaining environment configurations also grew into a complex task itself.

Getting resource consumption statistics grew more complex since gathering this information meant interacting with a host directly. We also did not want to go further into operating procedures of the OS, but focus our Code.

