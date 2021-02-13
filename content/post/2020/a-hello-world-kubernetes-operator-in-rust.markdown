---
title:  "A hello world kubernetes operator in Rust"
date:   2020-09-15 10:08:54 +0200
tags:
  - kubernetes
  - kubernetes-operator
  - rust
---

### Introduction

I read some samples about how to implement a kubernetes operator in Go which shows the basic priciples, but I was not able to find a similar exercise in rust. So I started looking around, how to do an operator in rust.

## Overview

An operator in kubernetes is a service that watches the k8s-API for specific events to happen. Usually the operator also registers some custom resource definitions (CRD) to later watch the lifecycle of those objects.

![K8s Operator Model](/assets/k8s-operator.png)

## Custom Object Definition

To do this in a hello world format, I decided on the following syntax.

My custom resource is called Member and it only has a single optional property called memberOf.

```yaml
apiVersion: helloworld.apimeister.com/v1
kind: Member
metadata:
  name: patrick
spec:
  memberOf: blue
```

The definition of such a resource would look like this:.

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: members.helloworld.apimeister.com
spec:
  group: helloworld.apimeister.com
  versions:
    - name: v1
      served: true
      storage: true
  scope: Namespaced
  names:
    plural: members
    singular: member
    kind: Member
```

## Operators in Rust

There already exists a crate in the rust eco-system which has support for event watching.

The crate I am using here is [kube](https://crates.io/crates/kube).

The operator is acutally pretty slim from an implementation standpoint.

```rust
extern crate serde_derive;
use kube::{api::{Api, ListParams, WatchEvent}, Client};
use futures::{StreamExt, TryStreamExt};
use serde::{Serialize, Deserialize};
use kube_derive::CustomResource;
use kube::config::Config;

#[derive(CustomResource, Serialize, Deserialize, Default, Clone, Debug)]
#[kube(group = "helloworld.apimeister.com", version = "v1", kind="Member", namespaced)]
#[allow(non_snake_case)]
pub struct MemberSpec {
  pub memberOf: Option<String>
}

#[tokio::main]
async fn main() -> Result<(), kube::Error>  {
    println!("starting hello world operator");
    let config = Config::infer().await?;
    let client: kube::Client = Client::new(config);

    let crds: Api<Member> = Api::namespaced(client, "default");
    let lp = ListParams::default();

    println!("subscribing events of type members.helloworld.apimeister.com/v1");
    let mut stream = crds.watch(&lp, "0").await?.boxed();
    while let Some(status) = stream.try_next().await? {
        match status {
            WatchEvent::Added(member) => {
              match member.spec.memberOf {
                None => println!("welcome {}",member.metadata.name.unwrap()),
                Some(member_of) => println!("welcome {} to the team {}"
                          ,member.metadata.name.unwrap()
                          ,member_of),
              }
            },
            WatchEvent::Modified(_member) => {
            },
            WatchEvent::Deleted(member) => {
              println!("sad to see you go {}",member.metadata.name.unwrap());
            },
            WatchEvent::Error(member) => println!("error: {}", member),
            _ => {}
        }
    }
    println!("done");
    Ok(())
}
```

The complete source code can be downloaded from the following github repo [hello-world-operator-rs](https://github.com/JensWalter/hello-world-operator-rs).
