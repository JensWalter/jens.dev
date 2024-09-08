---
title: "A Special Purpose HTTP Proxy in Rust"
date: 2024-07-10T14:00:00Z
tags:
 - rust
---
I recently purchased some IoT device based on a pre-built ESP32 firmaware. I wanted to move the server part into the cloud, so I wanted to secure the HTTP calling request with TLS and some form of authentication.

Since the IoT device did not have any TLS or authentication in place, I decided on locally hosting a proxy which transforms HTTP into HTTPS and inject an authnetication in form of an API-KEY.

```text
 ┌──────────┐┌─────┐       ┌───────┐
 │IoT Device││Proxy│       │Backend│
 └────┬─────┘└──┬──┘       └───┬───┘
      │         │              │    
      │HTTP call│              │    
      │────────>│              │    
      │         │              │    
      │         │HTTPS call    │    
      │         │(with API KEY)│    
      │         │─────────────>│    
      │         │              │    
      │         │   response   │    
      │         │<─────────────│    
      │         │              │    
      │response │              │    
      │<────────│              │    
 ┌────┴─────┐┌──┴──┐       ┌───┴───┐
 │IoT Device││Proxy│       │Backend│
 └──────────┘└─────┘       └───────┘
```

So I needed a Proxy, and starting looking around, since I could not be the first one to have this problem. I found various project, but all of them were a poor fit, either I could not get them to work or those implementation are full blown proxy servers. Since I did not want to maintain this workaround, I aborted my search and started to think, 'how hard can it be doing this in Rust?'

# How hard can a Rust implementation be?

Sticking to what I know, I took axum as service implementation and used reqwest for the http calling. Both framework are low maintenance and should have no issue handling the requests. 

## Cargo.toml

```yaml
[package]
name = "proxy"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["full"] }
axum = { version = "0.7" }
reqwest = { version = "0.12", default-features = false, features = [
    "http2",
    "rustls-tls",
] }
```

## main.rs
```rust
use axum::{body::Bytes, http::HeaderMap, routing::get, Router};
use reqwest::StatusCode;
use std::time::Instant;

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(handler));
    // bind to port 8080 for request forwarding
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn handler(headers: HeaderMap) -> Result<Bytes, StatusCode> {
    println!("receiving req");
    let now = Instant::now();
    let client = reqwest::Client::new();
    // construct a client with the API key infected into the header
    let mut builder = client
        .get("https://backend.run.app/")
        .header("X-API-KEY", "test123");
    // copy over existing headers
    for (key, val) in headers {
        let k = key.unwrap();
        if k == "host" {
            continue;
        }
        builder = builder.header(k, val.to_str().unwrap())
    }
    let resp = builder.send().await.unwrap();
    println!("elapsed: {:?}, resp: {:?}", now.elapsed(), resp.headers());
    // return the response after fully consuming the stream
    let x = resp.bytes().await.unwrap();
    Ok(x)
}
```

# Conclusion

So in total it took me about 35 lines of code to implement a very basic HTTP proxy that could serve my purpose. Also with rust I can build this binary and have a no-dependency deployable. So no runtime, no package dependencies, just a single binary. This makes deployment much easier.