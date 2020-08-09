---
layout: post
title:  "Containerizing TIBCO BusinessWorks 5"
date:   2020-08-09 10:08:54 +0200
tags: tibco businessworks container docker
---

### Preparation

To prepare the container build, I downloaded the current versions of TRA/BW/EMS from the TIBCO [edelivery platform](https://edelivery.tibco.com/).

I downloaded the following artifacts:

* TIB_TRA_5.11.0_linux_x86_64.zip
* TIB_BW_5.14.0_linux26gl23_x86_64.zip
* TIB_rv_8.4.6_linux_x86.zip
* TIB_ems_8.5.1_linux_x86_64.zip

Now to bring those together into a container I copied all of those into a `tibco-businessworks-runtime` directory.

### Installation

To support a headless installation, the TIBCO universal installer uses silent files. I attached my silent file at the end of this post.

The Dockerfile is also attached.

### Running the engine

Now that the container is built, I can start the engine inside. To get the actual code inside, I opted for a volume mount, which only contains the source as a TIBCO Designer project.

The project on my local disk is located on `/Users/jens/tmp/tibco-ide/sample`. This is mapped to the `/tmp/engine` directory.

Now I can start the engine through docker run.

```
docker run \
  -v /Users/jens/tmp/tibco-ide/sample:/tmp/engine \
  businessworks-runtime ./bwengine -p bwengine.tra /tmp/engine
```

### Attachments

<script src="https://gist.github.com/JensWalter/cecb051dd741f125ff512eeac57e580e.js"></script>