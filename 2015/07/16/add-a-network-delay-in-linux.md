---
title:  "add a network delay in linux"
date: 2015-07-16T16:34:54Z
tags: 
  - linux
---
Adding a delay to all network traffic is pretty easy and can be done through the following command.

**adding a delay**
```bash
#for device enp0s3
tc qdisc add dev enp0s3 root netem delay 100ms
```

**query the current delay**
```bash
#for all devices
tc -s qdisc
#for device enp0s3
tc qdisc show dev enp0s3
```

**removing the delay**
```bash
tc qdisc del dev enp0s3 root netem
```
