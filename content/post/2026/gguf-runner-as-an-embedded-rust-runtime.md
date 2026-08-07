---
title: "gguf-runner as a Rust library"
date: 2026-08-06
description: "gguf-runner started as a small command-line tool. It can now be used as a library inside Rust applications, with model loading, token streaming, vision, tools, and conversation handling kept in-process."
tags:
- rust
- llm
- ai
- gguf
- gguf-runner
- everlock
---

When I first wrote about [gguf-runner](/2026/02/17/gguf-runner-blogpost.html), it was exactly what the name suggested: a small binary that loaded a GGUF model and wrote the result to the terminal.

That shape worked well.

It gave me a simple way to run a local model from a shell script, and it kept the project focused. Later it gained [vision support, release binaries, and faster CPU kernels](/2026/03/08/gguf-runner-update.html), but it was still primarily something you started as a separate process.

The project has changed again since then.

gguf-runner is still a command-line tool, but the command line is no longer the whole product. The inference engine can now be used as a normal Rust library and embedded directly into another application.

That sounds like a small packaging change. For me it changed what the project is useful for.

Repo: https://github.com/apimeister/gguf-runner

## The binary was a useful boundary

A standalone binary is a very good place to start.

It gives every caller the same interface:

```text
prompt or image -> process -> stdout
```

There is no dependency coupling, and it works from any language that can start a process. It is also easy to inspect and debug because the exact command can be copied into a terminal.

That is still how the standalone version of [apimeister-photos](https://codeberg.org/apimeister/apimeister-photos) can run its metadata enhancement jobs today. It starts `gguf-runner` with a model, an image, and a prompt, then reads the generated text from stdout.

For occasional jobs this is a perfectly sensible interface.

But a process boundary also means that every invocation has its own lifecycle. The model has to be opened again, the runtime has to be initialized again, and conversation state has to be passed around separately if it should survive more than one call.

Once I wanted to put an LLM inside a larger Rust service, the binary stopped being the most useful boundary.

## The CLI is now one frontend

gguf-runner now builds both a binary and a library.

The library exposes an `EmbeddedRuntime` which owns a loaded model and provides the main pieces an application needs:

- text generation, either collected into a string or streamed as tokens
- conversation history supplied by the host application
- image input for vision-capable models
- host-defined tools that the model can call
- generation statistics such as token counts and decode speed
- context-size and sampling controls
- optional RAG and prefill-cache support

A Rust project can add the repository as a normal Cargo dependency:

```toml
[dependencies]
gguf-runner = { git = "https://github.com/apimeister/gguf-runner.git", branch = "main" }
```

A minimal embedded use looks roughly like this:

```rust
use gguf_runner::EmbeddedRuntime;

fn main() -> Result<(), String> {
    let mut runtime = EmbeddedRuntime::load_from_file(
        std::path::Path::new("./models/Qwen3.5-2B-Q4_K_M.gguf"),
    )?;

    runtime
        .set_context_size(4096)
        .use_hidden_think_mode();

    let answer = runtime.generate_collect(
        &[],
        "Summarize the last deployment report.",
        "You are a concise operations assistant.",
    )?;

    println!("{answer}");
    Ok(())
}
```

The model can also be compiled into the application and loaded from a static byte slice. A vision projector can be embedded in the same way. For larger models, loading from a file remains useful, and gguf-runner can discover a matching `mmproj` sidecar when the first image request arrives.

The important point is not the exact loading method.

It is that the application now owns the runtime.

```text
application
  -> load the model once
  -> keep the runtime alive
  -> send many text or image requests
  -> decide how history, tools, access, and concurrency work
```

gguf-runner still handles the GGUF details, model-family differences, tokenization, prompt templates, quantized inference, multimodal preprocessing, and token generation. The host application handles the things that are specific to its own domain.

That split has turned out to be much more useful than trying to grow gguf-runner into a general AI server.

## What embedding does not decide

The library API is deliberately synchronous and the runtime is mutable.

That means the embedding application has to decide who owns it. A small program can keep it directly in `main`. A server will usually put it on a dedicated worker thread and communicate with that thread through channels.

I like this because model inference is a heavy resource, not a normal stateless request handler.

The application should be explicit about:

- whether there is one runtime or several
- how concurrent requests are queued
- where conversation histories live
- which tools the model is allowed to call
- how access checks happen before a prompt reaches the model
- whether a model-loading failure disables one feature or the whole application

Those are product decisions. They should not be hidden inside a generic runner.

Everlock is a good example of how this can be arranged.

## Everlock: one runtime behind the admin shell

[Everlock](https://everlock.sh) embeds gguf-runner in its `everlock-ai-runtime` crate.

The model and its vision projector are included in the Everlock binary at build time. When Everlock starts, one worker thread loads them into an `EmbeddedRuntime`. Other parts of Everlock receive a cheap handle which sends work to that thread over channels.

Conceptually it looks like this:

```text
admin SSH session
  -> access check
  -> Everlock tools and system prompt
  -> AI runtime channel
  -> one gguf-runner EmbeddedRuntime
  -> streamed tokens back to the session
```

The admin interface already has a command language. Lines beginning with `/` remain normal admin commands. Plain text is sent to the embedded model.

The useful part is that the model does not receive unrestricted access to Everlock internals. The host supplies explicit tools implementing gguf-runner's `Tool` trait. Those tools map onto the existing admin command surface, so model-triggered operations pass through the same command implementation and authorization checks as manually entered commands.

Everlock also owns the conversation history. It keeps a separate history per SSH session and passes the relevant turns into the runtime on the next request. gguf-runner knows how to encode and trim that history for the model, but it does not decide which users or sessions should share it.

This is the kind of separation I wanted from the library:

> gguf-runner provides inference and tool calling. Everlock provides identity, permissions, domain tools, and lifecycle.

Because the model stays loaded, a follow-up prompt does not have to start a new process and initialize the model again. Tokens can also be streamed directly into the SSH session while they are generated.

## apimeister-photos: image description, OCR, and tags

The second example is [apimeister-photos](https://codeberg.org/apimeister/apimeister-photos), or `ami`.

Its metadata enhancement job looks at newly added images and asks an image-capable model for three different results:

1. a natural-language description of the image
2. visible text for OCR
3. a compact set of search tags

Those are three prompts against the same image. The answers are normalized and added to the image metadata so they become useful for browsing and search.

ami does not need to know how a model is loaded. It defines a small `ImageInferenceProvider` trait with one operation:

```rust
fn generate_with_image(
    &self,
    image_path: &Path,
    prompt: &str,
) -> Result<String, String>;
```

The enhancement job only talks to that trait.

In the standalone `ami` binary, the provider can still start `gguf-runner` as a subprocess. That keeps the standalone deployment simple and preserves the old CLI boundary.

When ami is embedded in Everlock, the provider is different. Everlock installs a small adapter which forwards the image and prompt to the already-running `EmbeddedRuntime`.

```text
ami enhance-metadata job
  -> ImageInferenceProvider
  -> Everlock shared-runtime adapter
  -> the same gguf-runner runtime
     used by the admin SSH session
```

There is no second model load for the photo library.

This is where the library form becomes more than a nicer API. The same heavy model can serve two very different parts of the application:

- interactive, tool-enabled text prompts in the admin shell
- background image description, OCR, and tagging in the photo library

The callers do not have to know about one another. They only share the runtime and its queue.

## Why I prefer the small library surface

It would have been possible to turn gguf-runner into an HTTP service and make both projects call that.

There are cases where that is the right design, especially if several machines or several languages need to share one model server.

It was not what I needed here.

Keeping inference in-process gives me:

- one Rust dependency instead of another deployed service
- no local HTTP protocol to design and version
- direct token streaming through normal Rust callbacks and channels
- host-defined tools without exposing a general remote execution API
- one application lifecycle for the model and its callers
- the option to compile the model into the final binary

It also keeps deployment close to the original gguf-runner idea: a Rust binary, local model execution, no Python environment, and no external AI service.

The difference is that the binary can now be the application I actually wanted to build, not only the runner itself.

## Still useful from the shell

None of this replaces the CLI.

The command-line interface is still the easiest way to try a model, inspect its behavior, reproduce a prompt, or put inference into a shell pipeline. It is also a useful fallback boundary for applications such as standalone ami.

But internally, the CLI is now one consumer of the same engine that another Rust application can consume directly.

That is the transformation:

> gguf-runner started as a program you run. It is now also a runtime you build with.

I still do not want it to become an AI platform. The project is most useful when it stays focused on local GGUF inference and provides a few strong primitives around it.

The standalone binary is one way to assemble those primitives.

Everlock and apimeister-photos are two others.

## Links

- https://github.com/apimeister/gguf-runner
- https://codeberg.org/apimeister/apimeister-photos
- https://everlock.sh
