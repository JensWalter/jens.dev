---
title: "A HTTP Server-Timing Header for axum"
date: 2023-04-20
---
Recently I was wondering how I could track the timings of an API I wrote and was looking for ways to implement something to keep track of the individual stages of a request process.

So the overall timing is logged as time in the access log, usually provided by some ingress provider or load balance. But that only shows part of the story, I also wanted to drill down into the timing of subsections of the process.

So the first option was to adopt Opentelemetry, since this project was built to capture tracing data to accumulate this kind of information. Unfortunately, it requires a full stack, like instrumented engines, a collector, some form of persistence, and some front-end to visualize the result. So that was a bit out of scope for what I wanted to do.

So I started looking for smaller scale alternatives and found the following header in the http spec.

from the mozilla docs: [HTTP Server-Timing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing)

    The Server-Timing header communicates one or more metrics and 
    descriptions for a given request-response cycle. It is used to 
    surface any backend server timing metrics (e.g. database read/write,
    CPU time, file system access, etc.) in the developer tools in the 
    user's browser or in the PerformanceServerTiming interface.

The provided sample looks like this

```
Server-Timing: db;dur=53, app;dur=47.2
```

This is good enough for me, and since it is part of the http header, it can easily be extracted and put into a access log file.

Next, where can I find an implementation of this? Unfortunately neither Axum nor Tower have an implementation yet.

Long story short, there is now an extension layer that can be added to an Axum implementation.

[https://crates.io/crates/axum-server-timing](https://crates.io/crates/axum-server-timing)

Adding a layer to the Axum routes.
```rust
let app = Router::new()
    .route("/", get(handler))
    .layer(axum_server_timing::ServerTimingLayer::new("HelloService"));
```

This will produce the following output on every request

```
HTTP/1.1 200 OK
content-type: text/html; charset=utf-8
content-length: 22
server-timing: HelloService;dur=102
date: Wed, 19 Apr 2023 15:25:40 GMT

<h1>Hello, World!</h1>
```