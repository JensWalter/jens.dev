---
layout: post
title:  "[mule] flowVars not visible in parent flow"
date:   2015-09-04 14:34:54 +0200
tags: mule
---
Doing some integration in Mule Anypoint Studio a stumbled upon something I didn't expect.
I wanted to have a parent flow which orchestrates several subFlows. The first subFlow was to ensure authentication and generate a security token. So I needed that token in all subsequent flows to embed it in all requests.
To my surprise, this didn't work out-of-box with mule 3.7.

Here the basic process a wanted to build.
![mule flow](/assets/mule-flow.png)

Obviously I missed something pretty basic here.

After some searching around I came to the conclusion, that this could only happen, if the flows are called asynchronously, so that the variables could not be propagated.

Following that hunch, I set the processing strategy of the child flow to 'synchronous'.
![mule flow processing strategy](/assets/mule-processingStrategy.png)

After that, the flow worked as expected.
