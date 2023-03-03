---
title:  "Containerizing a BusinessWorks Stack"
date:   2023-02-27T14:08:54Z
tags:
 - tibco
 - container
---
Containerizing BusinessWorks 5 comes with its own set of challenges. Most of these are related to the surrounding ecosystem and the architectures that have evolved around it.

In a classic scenario, a BusinessWorks engine runs within an administrator domain and reports its lifecycle through Hawk. Deployment of an engine is also typically handled by a combination of these tools.

It is important to note that only BusinessWorks provides the interface implementations. The other tools are used to manage/monitor/maintain BW engines and keep them running.

So, to think about containerization, we started by exploring how to package the BusinessWorks engine into a container. I already [wrote a blog post]({{< ref "/post/2020/containerizing-businessworks-5" >}}"wrote a blog post") about the technical details here, so I will not go into those in detail.

Now that we had found a way to package a BusinessWorks engine as a container, we started to explore the options that came with the new ecosystem.

Early on, we started with the Docker CLI on a VM. This gave us tools for deploying engines, starting/stopping engines, and also basic monitoring capabilities.

Soon after, we moved to docker-compose. This was driven by the need to define service compositions.
Another feature that came with compose was the ability to deploy and scale engines horizontally across multiple machines. This was a very early requirement as we wanted to move production services that had 24/7 HA requirements.

![docker-compose](/assets/2023/docker-compose.drawio.png)

This rather minimal change already resulted in some signification improvements in our development and operations procedures.

## Initial Benefits

1. Each engine is now packaged as its own container. This means that each engine has its own version of BusinessWorks, has its own set of OS dependencies, and can be scaled independently through a standardized interface. Also, moving engines between machines and balancing the load across a cluster of machines is a standard feature of docker-compose, so no customization is required.

2. Log capturing and forwarding is now done by using a fluentbit log forwarder. All logs are collected in an ElasticSearch and made available to the user via Kibana (WebUI with full text search capabilities). This now becomes the central entry point for any type of log.

3. Administrator and Hawk are no longer needed.

4. Engine lifecycle is fully automated in docker-compose. Healthcheck can be implemented and run within BW. External problems such as machine problems are detected and containers are failed over to another machine. Out of memory exceptions are handled in the same way without human interaction.

5. 25% reduction in hardware footprint by eliminating our standby engines. Previously, each engine consisted of a pair of load balanced engines and a pair of active standby engines. Depending on the type of workload, the process was distributed to the appropriate engine. With Container, we no longer needed this mechanism, all load-balanced engines became 2 instances, all active-standby engines became 1 instance (which is itself hardware independent, so it can failover in case of a problem).

## Feature Stack comparison

Functionally we have reached the following feature set.

| feature | classic | containerized |
|---------|---------|---------------|
| BusinessWorks engine | as is | as is |
| deploy format | EAR-file | container image |
| deploy repository | file directory | container registry |
| deploy script | bash with AppManage calls | docker cli |
| deploy SQL scripts | custom script | n/a |
| deploy EMS destination | custom script | BW projectlib (temporary) || start/stop | AppManage/Administrator | docker cli / portainer |
| monitor | Administrator/Hawk | docker compose |
| Web UI | Administrator | portainer |
| Log Files | Adminitrator | FluentBit, ElasticSearch, Kibana |

[Next Up: Reaping some benefits of containerization]({{< ref "/post/2023/reaping-some-benefits" >}})