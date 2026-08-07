---
title: "Shipping CPU-optimized Rust binaries in container images"
date: 2026-06-28
description: "How to map the OCI platform variant to a rustc target-cpu so a Rust binary actually uses AVX2/AVX-512 for LLM and image work inside a container — and how to merge the variants into one multi-arch tag."
tags:
- rust
- llm
- ai
- gguf
- gguf-runner
- containers
- docker
---

In an [earlier post](/2026/03/08/gguf-runner-update.html) about gguf-runner I made a point that kept nagging at me afterwards.

The point was this: prebuilt binaries are compiled for a conservative baseline so they run everywhere, and if you build locally with `target-cpu=native` instead, the compiler can light up the SIMD instructions your specific CPU supports. On an AMD Ryzen 7 PRO 8700GE that was worth about **+20.8% tokens/sec** for LLM inference. Real, measurable, free.

So the advice was simple: build locally if you care about speed.

But that advice falls apart the moment you put the same code in a container image.

So this post is about that gap, and the surprisingly clean way Docker lets you close most of it.

## The problem with `native` in a container

A container image is built once and run in a lot of places.

That is the whole appeal. You build it on a CI runner, push it to a registry, and it runs on your server, on a colleague's laptop, maybe on a small VPS somewhere.

`target-cpu=native` is exactly the wrong tool for that.

`native` means "compile for the CPU doing the build". On a CI runner you do not know what that CPU is, and you definitely do not know it matches where the image will run. If the build host has AVX-512 and the deploy host does not, the binary does not run a bit slower.

It dies with `SIGILL` the first time it hits an instruction the deploy CPU never heard of.

So inside a container, the honest default is the baseline `x86-64` target. Everything runs. Nothing crashes.

And for a normal web service that is completely fine.

But [everlock](https://everlock.sh) embeds an LLM and does a fair amount of image processing — preview generation, AVIF encoding, SVG rasterization. That code is SIMD-bound. Running it on a baseline `x86-64` target means leaving AVX2 and friends switched off, which is leaving exactly the kind of speedup the gguf-runner post was about on the table.

So the tension is:

> `native` is fast but not portable. Baseline is portable but slow. A shipped image seems to force you to pick one.

It turns out you do not have to.

## The thing I did not know about: x86-64 microarchitecture levels

There is a middle ground between "this exact CPU" and "any CPU from the last twenty years", and it has been standardized for a while.

The x86-64 psABI defines a small ladder of **microarchitecture levels**. Each level is a fixed, named bundle of instruction set extensions:

* **x86-64-v2** — SSE4.2, POPCNT and friends (roughly Nehalem, ~2009)
* **x86-64-v3** — AVX, AVX2, FMA, BMI (roughly Haswell, ~2013)
* **x86-64-v4** — AVX-512 (roughly Skylake-X, ~2017)

The important word is *fixed*. These are not "whatever this machine happens to have". They are distributable baselines. A binary built for `x86-64-v3` runs on any CPU at level v3 or higher, full stop.

rustc and LLVM both know these names directly:

```bash
RUSTFLAGS="-C target-cpu=x86-64-v3"
```

So instead of choosing between "this CPU" and "the floor of all CPUs", you choose a *class* of CPUs and compile for that.

That is most of the `native` win, in a form you can actually ship.

## How Docker hands you the level for free

Here is the part that made this click for me.

OCI platforms are not just `linux/amd64`. They have an optional **variant**, and for amd64 that variant is exactly the microarchitecture level:

```text
linux/amd64        # baseline
linux/amd64/v2
linux/amd64/v3
linux/amd64/v4
```

And BuildKit feeds that variant straight into your build as an automatic build argument. When you build with `--platform linux/amd64/v3`, BuildKit sets:

```text
TARGETPLATFORM=linux/amd64/v3
TARGETOS=linux
TARGETARCH=amd64
TARGETVARIANT=v3
```

So the platform you ask for and the CPU baseline you compile for can be the *same knob*. You just have to connect the two ends.

## The actual mapping

This is the whole trick, lifted straight out of everlock's `Dockerfile`:

```dockerfile
# x86-64 microarchitecture level. BuildKit sets TARGETVARIANT from the
# `--platform` flag (linux/amd64/v2 -> "v2"); map it to a portable rustc
# `target-cpu` so the binary actually uses the extended ISA — v2: SSE4.2/POPCNT,
# v3: AVX/AVX2/FMA, v4: AVX-512. These are fixed, distributable baselines, NOT
# `target-cpu=native`. Override or force with `--build-arg RUST_TARGET_CPU=...`.
ARG TARGETVARIANT
ARG RUST_TARGET_CPU
RUN set -eux; \
    cpu="${RUST_TARGET_CPU:-}"; \
    if [ -z "$cpu" ]; then \
      case "$TARGETVARIANT" in \
        v2) cpu="x86-64-v2" ;; \
        v3) cpu="x86-64-v3" ;; \
        v4) cpu="x86-64-v4" ;; \
      esac; \
    fi; \
    if [ -n "$cpu" ]; then export RUSTFLAGS="-C target-cpu=$cpu"; fi; \
    echo "building with target-cpu=${cpu:-x86-64 (baseline)}"; \
    cargo build --release --locked --features qwen3
```

Two things worth pointing out.

First, `ARG TARGETVARIANT` has to be declared inside the build stage. The automatic build args exist globally, but a stage only sees them once it re-declares them. Forget that line and `TARGETVARIANT` is silently empty, and you are quietly back to a baseline build wondering why nothing got faster.

Second, there is a manual escape hatch. `RUST_TARGET_CPU` wins over the variant mapping, so you can force a specific level without touching the `--platform` flag:

```bash
docker build --build-arg RUST_TARGET_CPU=x86-64-v3 -f Dockerfile.qwen3 -t everlock:v3 .
```

And if you say nothing at all, the `case` falls through, `RUSTFLAGS` stays unset, and you get a plain baseline binary that runs anywhere. The safe path is the default path.

## This is really a `rustc` knob, not a Docker one

It is worth being clear about what is actually doing the work here, because the Docker side is almost incidental.

`--platform` and `TARGETVARIANT` are plumbing. The thing that changes the generated machine code is a single `rustc` flag: `-C target-cpu`. Everything else in this post exists only to set that flag to the right value.

And in Rust that flag is unusually far-reaching, because of how `RUSTFLAGS` propagates. Setting `RUSTFLAGS="-C target-cpu=x86-64-v3"` does not just recompile *my* crate at that baseline. It recompiles the **entire dependency graph** at that baseline — every crate cargo builds from source, all the way down.

That is the part that actually matters, because almost none of the hot code is mine.

The SIMD-heavy work in everlock lives in dependencies: the `image` stack, `ravif` and `rav1e` for AVIF encoding, `resvg` for SVG rasterization, and the quantized kernels behind the embedded model. On a baseline build, LLVM's autovectorizer compiles all of that for plain SSE2, because that is all it is permitted to assume. Raise `target-cpu` and every one of those loops is suddenly allowed to emit AVX2 and FMA — in code I will never touch.

One `RUSTFLAGS` line, the whole graph relocated to a higher floor. That is the win.

Two more Rust details worth keeping straight, because they trip people up:

* **The target triple and the target-cpu are independent axes.** everlock's images compile for `x86_64-unknown-linux-musl` — that triple picks the ABI and libc. `target-cpu` selects the microarchitecture *within* that triple. You are not changing *what* you build, only which instructions the compiler may reach for while building it.
* **`target-cpu` is the named-model knob; `target-feature` is the à-la-carte one.** You could spell the same thing out as `-C target-feature=+avx2,+fma,+bmi1,+bmi2,...`, but the `x86-64-vN` models *are* those bundles under one well-known name. Fewer ways to get the set subtly wrong.

This is also why `-C target-cpu=native` is a Rust footgun specifically inside a container: it asks LLVM to probe the *build* host and bake those exact features in. Great for a `cargo install` on your own workstation, which is what I recommended for gguf-runner. A quiet `SIGILL` waiting to happen once you ship the resulting binary somewhere else.

## Building the variants

With `buildx`, asking for a level is one flag:

```bash
# portable baseline
docker buildx build -f Dockerfile.qwen3 -t everlock:latest .

# AVX2 / FMA class — the sweet spot for most modern hardware
docker buildx build --platform linux/amd64/v3 -f Dockerfile.qwen3 -t everlock:v3 .

# AVX-512 class
docker buildx build --platform linux/amd64/v4 -f Dockerfile.qwen3 -t everlock:v4 .
```

The `:v3` tag is doing real work there. The image is not magically self-describing about which CPUs it needs, so the tag is your contract with yourself about where it is allowed to run.

If you are not sure what level a given host actually supports, glibc will just tell you:

```bash
$ /lib64/ld-linux-x86-64.so.2 --help | grep supported
  x86-64-v3 (supported, searched)
  x86-64-v2 (supported, searched)
```

That is a nice, boring way to pick the right floor for a server before you build for it.

## Why this is worth the bother for AI and image work

For a plain CRUD service I would not lose any sleep over this. The baseline build is fine and the difference is noise.

LLM inference and image processing are the opposite case.

These are tight numeric loops — matrix multiplies, quantized kernels, pixel and DCT math. They are exactly the code that benefits from wider vectors and FMA. Going from baseline to v3 lets the compiler autovectorize across the whole binary with AVX2 and FMA available everywhere, not just in a handful of hand-written kernels.

This is the same win the gguf-runner post measured with `native`, minus the part where the binary only runs on one machine.

> Compile for a CPU *class*, not a CPU. You keep most of the speed and you can still ship the result to anyone in that class.

## It stacks with runtime feature detection

One thing worth being clear about, because it is easy to think these two ideas compete.

In the gguf-runner post I showed `--show-features`, which detects SIMD support at runtime and picks optimized kernels accordingly. In Rust that is the `std::arch::is_x86_feature_detected!` macro gating a function marked `#[target_feature(enable = "avx2")]`: one binary, several code paths, the right one chosen when the program starts.

```rust
if is_x86_feature_detected!("avx2") {
    unsafe { matmul_avx2(a, b, out) } // a #[target_feature(enable = "avx2")] fn
} else {
    matmul_baseline(a, b, out)
}
```

But notice the limit of that pattern: a `#[target_feature]` function gets its feature regardless of the global baseline, yet *only that function does*. The safe code around it, and crucially every dependency, are still compiled at whatever `target-cpu` says. You only get hand-written dispatch where someone sat down and wrote it.

Compile-time `target-cpu` is the other layer. It sets the baseline the compiler is allowed to *assume everywhere* — every loop the autovectorizer touches across the whole crate graph, not only the kernels with an explicit dispatch path.

They are not alternatives. They stack.

Runtime detection makes sure you never execute an instruction the CPU lacks. The platform variant raises the floor of what the whole binary was compiled against in the first place. Using both means the hot kernels pick the best available path *and* the surrounding code is no longer stuck at the lowest common denominator.

## A few caveats

This is genuinely useful, but it is not free of sharp edges.

* It is an x86-64 story. aarch64 does not have the same tidy v2/v3/v4 ladder, so on ARM you lean more on the baseline plus runtime detection. The Apple M4 in the previous post is firmly in that camp.
* A `:v4` image will `SIGILL` on a v3 host. AVX-512 availability on consumer chips is also genuinely patchy. I treat v4 as opt-in for hardware I know, and v3 as the realistic default for "modern server".
* The tag is the only thing stopping someone from running a v3 image on a v2 box. Be disciplined about naming, or you will rediscover this the loud way.
* You are building more than one image if you want to cover more than one class. That is a real cost, so only split the levels you actually deploy to.
* **Each level is a full from-scratch compile.** Cargo's fingerprint includes `RUSTFLAGS`, so changing `target-cpu` invalidates the entire build cache — a v3 image is not an incremental delta on the baseline one, it is the whole graph compiled again. With an embedded model and `lto = "thin"` in the release profile, that is not a cheap rebuild.

## Putting it back together: one tag, every target

So far this post has done nothing but split things apart — baseline, v2, v3, v4, and then aarch64 off to the side, because ARM does not play the microarchitecture-level game at all.

The satisfying part is that OCI lets you hand all of that back to the user as a single tag.

A registry tag can be a **manifest list** — an OCI image index: one name pointing at several platform-specific images. When someone runs `docker pull`, the runtime inspects the host and selects the matching entry, and for amd64 that selection *includes the variant*. A host reporting `x86-64-v3` gets the v3 image; an older box falls back to baseline; an ARM machine gets `linux/arm64`. All resolved from one `docker pull`, no tag-juggling pushed onto whoever runs it.

The build shape I use for everlock is: build each platform, push it under a throwaway platform-specific tag, then merge them with `docker buildx imagetools create` (swap `registry.example.com` for your own registry).

```bash
# build and push each platform under its own intermediate tag
docker buildx build --platform linux/arm64     --push -t registry.example.com/everlock:0.3-qwen3-arm64    -f Dockerfile.qwen3 .
docker buildx build --platform linux/amd64     --push -t registry.example.com/everlock:0.3-qwen3-amd64    -f Dockerfile.qwen3 .
docker buildx build --platform linux/amd64/v3  --push -t registry.example.com/everlock:0.3-qwen3-amd64-v3 -f Dockerfile.qwen3 .

# merge them into one multi-arch tag
docker buildx imagetools create \
  --tag registry.example.com/everlock:0.3-qwen3 \
  registry.example.com/everlock:0.3-qwen3-arm64 \
  registry.example.com/everlock:0.3-qwen3-amd64 \
  registry.example.com/everlock:0.3-qwen3-amd64-v3
```

That final `:0.3-qwen3` tag is the image index. The platform-tagged intermediates are scaffolding — delete them afterwards if you like a tidy registry.

Two things I learned doing this for real, both straight out of the Rust build being heavier than a normal image:

* **Build each platform natively, not under QEMU.** Emulating an aarch64 Rust release compile on an x86 host is brutally slow. Build arm64 on an ARM host, amd64 on an x86 host, push both, and let `imagetools` merge them across machines through the shared registry.
* **Do not hand every platform to one `buildx` invocation.** BuildKit builds the platforms concurrently, and because the binary embeds the GGUF model bytes, several parallel release compiles will cheerfully eat all your RAM. Build them sequentially.

## What I would recommend

If you ship a Rust container that does heavy numeric work, my default would be:

* keep the plain baseline tag as the thing that always runs
* add a `v3` build for the AVX2/FMA class, which covers most modern hardware
* only reach for `v4` when you know the target has AVX-512
* drive it all from `--platform`, and keep a `RUST_TARGET_CPU` build-arg as the manual override
* let an unset variant fall through to baseline, so the safe build is the one you get by accident
* merge the levels and the architectures into one manifest list, so `docker pull` resolves the right image instead of asking your users to

The thing I like about this setup is how little of it is clever. There is no detection magic in the Dockerfile, no probing the build host, no `native` gamble. You declare which CPU class an image is for, and the compiler is told to believe you.

## Closing thought

The gguf-runner post left me with a slightly unsatisfying conclusion: the fast build is the one you compile yourself, and everyone else gets the slow one.

Container images felt like they made that worse, because "build it yourself" is the opposite of what an image is for.

But the platform variant turns out to be the missing piece. It lets an image carry a real CPU baseline instead of the most timid one, while staying a clean, declarative OCI build that anyone in that class can pull and run.

For everlock that means the LLM and the image pipeline get their AVX2, and I still get to hand someone a `docker pull` instead of a Rust toolchain and a coffee.

That feels like the right trade.

## Links

- https://everlock.sh
- https://codeberg.org/JensWalter/everlock
