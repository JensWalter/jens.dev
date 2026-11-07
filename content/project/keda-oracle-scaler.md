---
title: "KEDA external Scaler for Oracle in Rust"
date: 2022-05-22T18:13:50Z
description: "A KEDA external scaler that scales Kubernetes deployments up and down based on the result of a query against an Oracle table."
tags:
- keda
- kubernetes
- oracle
- rust
links:
- name: GitHub
  kind: code
  url: https://github.com/apimeister/keda-oracle-scaler
---

The project “keda-oracle-scaler” on GitHub is designed to scale KEDA (Kubernetes-based Event Driven Autoscaling) targets based on the results of Oracle database table queries. It allows KEDA to adjust the number of replicas for a Kubernetes deployment depending on the data selected from an Oracle table. This can help in dynamically scaling applications based on real-time database metrics.
