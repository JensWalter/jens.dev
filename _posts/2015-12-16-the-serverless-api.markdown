---
layout: post
title:  "the serverless API"
date:   2015-12-16 11:53:54 +0200
tags: amazon aws api101 api-gateway
---
Building an API does come with a lot of different facets to consider. One of the greater ones is, how to run all this. Building an API implementation is a rather easy Task, most developers today have some experience with connecting with API and already had their point of contact with various technologies to fulfill this task.

A much greater pain point comes in if you start to think about, how to host this implementation and make it secure. Especially security is hard, since mistakes can expose all kind of data and make it accessible to whomever is using the service. So you do not want to expose your internal system to the world, just because there is an error in the implementation.

So to tackle some of the concerns, you come up with something like this.

![traditional way](/assets/traditional.png)

Basically to get this running, you have to talk to a lot of guys and create an initial effort thats way beyond the worth of the POC/project.

The solution to this could be to cut the infrastructure out of the deal and start deploying to cloud. What I mean by this is, take critical components out of the calculation and start building a minimum viable API where the majority of the implementation is hosted offsite.

Amazon in particular has some interesting stuff out there with what you can easily build a stateless API on a complete pay-per-use basis.

![serverless way](/assets/serverless.png)

What we have here is break the API functionality into two parts.

**part 1**

Gather the data you want to expose publicly and push that out to an external database.

**part 2**

Implement the API as aws lambda function. These functions than only access the provided data within the cloud.

All this looks really nice on paper, but I will start implementing this concept as proof of concept to see that it actually works as expected.
