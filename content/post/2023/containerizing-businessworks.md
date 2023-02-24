---
title:  "Containerizing a BusinessWorks Stack"
date:   2023-05-23T10:08:54Z
tags:
 - tibco
 - container
---
Containerizing BusinessWorks 5 comes with its own set of challenges. Most of those are related to the surrounding ecosystem and architectures that evolved around those.

In a classic scenario, a BusinessWorks Engines run inside a Adminitrator domain and reports is lifecycle through Hawk. Deployment of an engine is also usually handled by an combination of those tools.

The important part here is that only BusinessWorks provides implementations for interfaces. The other tools are used to administer/monitor/maintain BW engines and keep those running.

So to think about containerization, we started with exploring way how to package the BusinessWorks engine into a container. I already [wrote a blog post]({{< ref "/post/2020/containerizing-businessworks-5" >}} "wrote a blog post") about the technical details here, so I will not go deeper into those.

Now that we found a way to package a BusinessWorks engine as container we started to explore options coming with the new ecosystem.

Early on we started with docker CLI on a VM. This provided us tooling for Deployment of engines, Starting/Stopping of engines and also basic monitoring capabilities.

Soon after that we switched to docker-compose. This was caused by the need to define service compositions.
Another feature that came through compose was the optional to deploy and scale engines horizontally through mutliple machines. This was a very early requirement since we wanted to move production services over which had 24/7 HA-requirements.

This rather minimal change already resulted in some signification improvements in our development and operations procedures.

## Benefits

1. Every engine is now packaged as its own container. That means every single engine has its own version of BusinessWorks, has its own set of OS dependencies and can be scaled independently through a standardized interface. Also moving engines between machines and balancing the load throughout a cluster of machines is a standard feature of docker-compose, so no adjustments necessary.

2. Log capturing and forwarding is now done by deploying a fluentbit log forwarder. All Log a gathered in a ElasticSearch and provided to the user through Kibana (WebUI with full text search capabilties). This now becomes the central entry point for every kind of log.

3. Administrator and Hawk are no longer required.

4. Engine lifecycle run fully automated in docker-compose. Healthcheck can be implemented an run inside BW. External issue like machine issue are detected and containers are failed over to another machine. Out-of-memory exceptions are handled the same way without human interaction.

## Feature Stack comparison

Functionally we have reached the following feature set.

| feature | classic | containerized |
|---------|---------|---------------|
| BusinessWorks engine | as is | as is |
| deploy format | EAR-file | container image |
| deploy repository | file directory | container registry |
| deploy script | bash with AppManage calls | docker cli |
| start/stop | AppManage/Administrator | docker cli / portainer |
| monitor | Administrator/Hawk | docker compose |
| Web UI | Administrator | portainer |
| Log Files | Adminitrator | FluentBit, ElasticSearch, Kibana |