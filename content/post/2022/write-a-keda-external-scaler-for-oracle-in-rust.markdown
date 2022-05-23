---
title: "Write a KEDA external Scaler for Oracle in Rust"
date:  2022-05-22T10:13:50Z
tags:
  - kubernetes
  - rust
  - keda
---

## Introduction

[KEDA](https://keda.sh/) (Kubernetes Event-driven Autoscaling) is as the name says a scaling framwork for kubernetes. This frameword can scale based in internal scalers as well as externally defined scalers. Here I wate to write a Rust based scaler, which implements ths gRPS [external scaler interface](https://keda.sh/docs/2.7/scalers/external/).

## Overview

The proto definition gives the following interface.

```
service ExternalScaler {
    rpc IsActive(ScaledObjectRef) returns (IsActiveResponse) {}
    rpc StreamIsActive(ScaledObjectRef) returns (stream IsActiveResponse) {}
    rpc GetMetricSpec(ScaledObjectRef) returns (GetMetricSpecResponse) {}
    rpc GetMetrics(GetMetricsRequest) returns (GetMetricsResponse) {}
}
```

For now I am ignoring the option for the streaming service. That leaves me with the isActive and GetMetrics invocations.

So to re-iterate:
- isActive: returns true if the target should be scaled up, false if it should be scaled down.
- GetMetrics: returns the value, that the scaler bases its decision on the desired number of replicas.

## Setup


## IsActive

The `isActive`-call is used to determine if the scaler should scale up or down. So it must contain the logic to determine this. The first thing to figure out here is, how to get any parameters into that call.

From the keda docs, the following sample describes the usage of the external scaler.
```
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: scaledobject-name
  namespace: scaledobject-namespace
spec:
  scaleTargetRef:
    name: deployment-name
  triggers:
    - type: external-push
      metadata:
        scalerAddress: service-address.svc.local:9090
        key1: value1
        key2: value2
```

So in my case this qould look like this.
```
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: scale-on-bookings
spec:
  scaleTargetRef:
    name: booking-svc
  triggers:
    - type: external-push
      metadata:
        scalerAddress: db.svc:10000
        query: select * from bookings where status = 'confirmed'
```

The first thing to worry about the `isActive` call is actually, what is handed over and how can I access the data. So again, I looked it up in the proto definition of the service. It seems there is a generic name/value section at the end of the call which should hand over any custom defined parameters from the yaml to the external scaler.

```
message ScaledObjectRef {
    string name = 1;
    string namespace = 2;
    map<string, string> scalerMetadata = 3;
}
```

No that we have a query, we can call the database with that and retrieve the count.

```rust
async fn run_query(query: &str) -> i64 {
    match DB_CONNECTION.lock() {
        Ok(conn) => {
            let rows = conn.query(query, &[]).unwrap();
            let mut metric_value: i64 = 0;
            let mut counter = 0;
            for row_result in rows {
                let row = row_result.unwrap();
                counter += 1;
                if counter== 1 {
                    let first_column: Result<i64, _> = row.get(0);
                    match first_column {
                        Ok(value) => metric_value = value,
                        Err(_) => metric_value = counter,
                    }
                }else{
                    metric_value = counter;
                }
            }
            return metric_value;
        },
        Err(_e) => {
            log::error!("poison error, restarting...");
            std::process::exit(1);
        }
    }
}
```

The only thing left to do here is to patch this call into the isActive routine.

```rust
  async fn is_active(
      &self,
      request: Request<ScaledObjectRef>,
  ) -> Result<Response<IsActiveResponse>, Status> {
      let inner = request.into_inner();
      let metadata = inner.scaler_metadata.clone();
      let mut metric_value:i64 = 0;
      if metadata.contains_key("query"){
          let query = metadata.get("query").unwrap();
          metric_value = run_query(query).await;
          log::debug!("{metric_value} from query \"{query}\"");
      }else{
          log::warn!("no query found in metadata: {:?}", metadata);
      }
      if metric_value > 0 {
          Ok(Response::new(IsActiveResponse {
              result: true,
          }))    
      }else{
          Ok(Response::new(IsActiveResponse {
              result: false,
          }))    
      }
  }
```

## GetMetrics

Similar to the `isActive`, the `GetMetrics` call is used to determine the desired number of replicas. So the only change I needed to implement here was return the actual value instead of the true/false for scaling.

```rust
async fn get_metrics(
    &self,
    request: Request<GetMetricsRequest>,
) -> Result<Response<GetMetricsResponse>, Status> {
    let inner = request.into_inner();
    let name = inner.metric_name;
    let scaled_object = inner.scaled_object_ref.unwrap();
    let metadata = scaled_object.scaler_metadata.clone();
    log::debug!("{name}: {:?}", metadata);
    if metadata.contains_key("query"){
        let query = metadata.get("query").unwrap();
        let metric_value = run_query(query).await;
        log::debug!("{metric_value} from query \"{query}\"");
        return Ok(Response::new(GetMetricsResponse {
            metric_values: vec![MetricValue{
                metric_name: name,
                metric_value: metric_value,
            }],
        })); 
    }else{
        log::warn!("no query found in metadata: {:?}", scaled_object);
        Ok(Response::new(GetMetricsResponse {
            metric_values: vec![MetricValue{
                metric_name: name,
                metric_value: 0,
            }],
        }))
    }
}
```

## Finishing up

The complete source code can be downloaded from the following github repo [keda-oracle-scaler](https://github.com/apimeister/keda-oracle-scaler).