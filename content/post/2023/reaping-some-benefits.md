---
title:  "Reaping some benefits of containerization"
date:   2023-05-24T10:08:54Z
tags:
 - tibco
 - container
---
We just started the migration and saw some impressive results very early on.

### Deployment

We started with some very heavy custom scripting to deploy large composites. These composite container definitions for BW engines, SQL script, EMS definitions and file system deployment. Overall, this process became so complex that even a "simple" composite deployment could easily take 2-3 hours.

By splitting the composite into containers and building our composite structure on top of Docker Compose, deployment times were now down to minutes (up to 5 minutes for container pulls and restarts). This is a huge improvement over existing deployment times.

Also, by using YAML managed in a git repository as a compose definition, our definitions became reversible. So if a production rollout failed, we could easily roll back to the last state (especially regarding the 5min deployment time). Before that, there was also the consideration of whether a rollout really helped, or if a hotfix (meaning manual interaction) was faster after the rollout. This is no longer a consideration.

### Infrastructure

Rolling out a classic Tibco environment means installing the software on multiple machines and then creating a management domain on top of it. From that point on, all the machines involved need to be kept in sync. So updates to either the operating system or the Tibco software have to be done in tandem to ensure consistency across the fault domains.

With the move to Docker, these requirements disappeared. The only requirement on the OS was that the Docker daemon was installed and accessible.

* That in itself decoupled our software from the infrastructure. Now we can move/swap machines on the fly with very little effort.
* Security became much easier as the OS could be patched at any time, even during downtime, without affecting our service.
* The hardware layout (such as 2 machines per region as a HA cluster) was no longer set in stone. We could split machines horizontally and add machines as needed.

### Healthchecks

Docker containers themselves only provide a hosting environment for the application. But with the introduction of container orchestration (docker-compose) we were able to implement container specific health checks.

We implemented a generic health check for BW to guarantee that the engine is still functional (not just running). We also provided a mechanism so that each engine can also extend this generic check with some specific checks. For example, if a database connection is often the cause of errors, we can implement a health check and deal with it at the container level.

### Security

Since all the software became part of the container image, we no longer had any dependencies on the underlying OS. OS patches or even major upgrades could happen at any time without us worrying that some library or functionality would break.

Also, updating dependencies we need for certain engines (openssl, Oracle AQ drivers) became easier because it would only affect a single container. So we can update and test that single engine and not worry about shared dependencies leaking into the stack.

Updating our software stack (like updating a JDK or even the BW version) became an iterative problem. We could update each engine on its own without interfering with other engines. This led to a huge increase in updating spped of our core components (we did the first 2 major BW updates within 1 year).

### Future Perspective

By decoupling the OS from the base software (Tibco BusinessWorks, Hawk,...) and also from our code, we became independent from our fixed infrastructure.
This led to new ways of partitioning and scaling hardware. From there, we saw the opportunity to do something similar with the code we deployed.

Up to that point, we had been collecting all the code related to a backend in Engine. This is a necessity because deployment and infrastructure would get out of control. Thanks to our decoupling, we no longer had this limitation, so we started working on different code segmentations.

After some back and forth about how to split and maintain our codebase, we always came to the same conclusion. In the final design, we would always split our code base into "micro services" so that each process starter would become its own engine. This was the only way to ensure the flexibility we wanted. The only downside was the massive amount of infrastructure we would need to host so many engines.