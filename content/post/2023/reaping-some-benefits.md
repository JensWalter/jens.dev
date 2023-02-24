---
title:  "Reaping some benefits of containerization"
date:   2023-05-24T10:08:54Z
tags:
 - tibco
 - container
---
We just started out migration and saw some impressive result very early on.

### Deployment

We started with some very heavy custom script rolling out big composites. Those composite container definitions for BW engines, SQL script, EMS definitions and filesystem deployment. Overall this process grew so complex that even a `simple` composite deployment could easily take 2-3 hours.

By splitting the composite apart into containers and building our composite structure on top of docker compose deployment times where now down to minutes (up 5 minutes for container pulls and restarts). This is a huge improvement over the existing deployment times.

Also by using YAML managed in a git repository as compose definition our definitions became reversible. So if a production rollout failed, we could easily roll back to the last status (especially regarding the 5min deployment time). Before that, there alsway was some consideration of whether a roullout actually helped of if a hotfix (meaning manual interaction) after the rollout was faster. This was now no longer a consideration.

### Infrastructure

Rolling out a classic tibco environment means installing the software on multiple machines and then creating a management domain on top of that. From that point onward all of the involved machined have to be maintained in sync. So Update either OS or Tibco Software need to happen in tandem to ensure consistency across failure domains.

With the switch to Docker, those requirements disappeared. The only requirement for the OS was that the docker daemon was installed and is accessible.

* That itself lead to decoupling of our software from the infractructure. Now we can move/switch machine on the fly with very little effort.
* Security became a lot easier, since the OS could be patch even with downtime at any time without affecting our service
* The hardware layout (like 2 machines per Region as HA-Cluster) was no longer set in stone. We could split machines up horizontally, and also add machines on-demand if we needed to.

### Healthchecks

Docker container itself do only provide a hosting environment for application. But with the introduction of container orchestration (docker-compose) we were able to implement container specific HelathChecks.

We did implement some generic health check for BW to guarantee that the engine is still functional (not just running). We also provided a mechanism so every engine can also extend this generic check with some specific check. For example if a database connection is often the cause of error, we can implement a health check and deal with it on the container level.

### Future Perspective

After decoupling the OS from base software (Tibco BusinessWorks, Hawk,...) and also our code, we became independent from our fixed infrstructure.
That lead to new options of how to split/setup and scale hardware. Starting with that we also saw the opportunity to do something similar with the code we deployed.

Up to that point we collected all code regarding one backend in engine. This is a neccesity because deployment and infractructure would go out of control. Thanks to our decoupling we no longer had this restriction, so we started to elaborate on different code segmentations.

After a back an forth about how to split and maintain our codebase, we always came to the same consclusion. In the final draft, we would always split our code abse into 'micro services', so every process starter becomes its own engine. This was the only way how we could ensure the fexibilty we wanted to go forward. The only downside that came with that was the massive amount of infrastructue we would need to host this many engines.