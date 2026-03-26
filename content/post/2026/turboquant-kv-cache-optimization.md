---
title: "TurboQuant in gguf-runner: roughly half the memory at nearly the same speed"
date: 2026-03-26
description: "Implementing TurboQuant in gguf-runner cuts KV-cache memory roughly in half while staying close to Q8 throughput."
tags:
- rust
- llm
- ai
- gguf
---

## A more technical follow-up

In the [previous post](/2026/02/17/gguf-runner-blogpost.html) I introduced **gguf-runner**, a small Rust CLI for running GGUF models locally on CPU.

In the [follow-up](/2026/03/08/gguf-runner-update.html) I wrote about vision support, release binaries, and a number of smaller improvements.

This post is about one of the more practical changes: adding **TurboQuant** as a new KV-cache mode that cuts KV-cache memory sharply without giving up much throughput.

Repo: https://github.com/apimeister/gguf-runner

---

## Why the KV-cache matters so much

For long-context inference, the KV-cache quietly becomes one of the dominant costs.

Every generated token has to attend over all previous tokens, which means repeatedly reading keys and values that were stored earlier. As the sequence grows, that cache grows with it. On machines with limited memory bandwidth or limited unified memory, this quickly turns into a bottleneck.

The obvious baseline is to quantize the KV-cache to **Q8** instead of leaving it in higher precision. That already reduces storage substantially and is a very reasonable default.

In my measurements, that baseline delivered **7.255 tok/s**.

What I wanted to know was whether it was possible to push the cache much further down in size without meaningfully hurting inference speed.

## What TurboQuant does

TurboQuant is a compression scheme published by Google Research in [TurboQuant: Redefining AI Efficiency with Extreme Compression](https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/).

The short version is:

- rotate the vector with an FWHT-based random transform
- quantize the rotated values to **2 bits**
- store a **1-bit sign residual** for part of the remaining error

That gives a practical storage cost of roughly **3.125 bits per element**, including the scale metadata.

The reason the random rotation matters is that raw activations are not always friendly to very low-bit quantization. Some dimensions may dominate, which makes a naive 2-bit scheme behave badly. Spreading the energy out first makes the quantization error less structured and therefore easier to tolerate.

So conceptually this is very attractive:

- much smaller KV-cache
- still simple enough to implement inside a small inference engine
- potentially useful on Apple Silicon and other memory-constrained systems

## The first version was too slow

The first working TurboQuant implementation came in at **5.068 tok/s**.

That was about **30% slower than Q8**, which was not good enough.

This was not especially surprising in hindsight. TurboQuant adds real work:

- encoding the K/V vectors when they are written
- unpacking low-bit data during attention
- reconstructing the residual contribution
- applying the transforms efficiently enough that they do not dominate everything else

I then did the classic thing you do when staring at a slow inner loop: I added NEON code.

That made it worse.

The first SIMD pass regressed throughput to **4.768 tok/s**.

That ended up being useful, because it forced me to stop assuming that "more SIMD" automatically meant "faster code". The problem was not just a missing intrinsic here or there. Some of the surrounding structure was wrong.

## Where the time actually went

After profiling attention on a roughly 600-token prefill, several issues stood out.

### Scalar reduction after NEON loads

The first NEON dot-product path unpacked values with SIMD and then finished with a scalar reduction loop. That created a sequential dependency chain right at the end of the hot path.

Switching to four independent `vfmaq_f32` accumulators and reducing them as a tree brought throughput from **4.768** to **6.147 tok/s**.

### Regenerating sign patterns on the hot path

The rotation sign tables were initially generated with `splitmix64` during inference, one element at a time.

That was simply the wrong place to spend CPU time. The sign patterns only depend on model structure, so they can be precomputed at load time and then reused.

Moving that work out of the hot path increased throughput to **6.612 tok/s**.

### Scalar bit extraction around the FWHT

I also added a NEON FWHT implementation, but the first result was another regression to **6.381 tok/s**.

The reason was that the transform itself had become faster, while the sign application around it was still doing scalar bit extraction using expressions of the form `(bits[i / 8] >> (i & 7)) & 1`.

That meant the surrounding scalar code was now the bottleneck.

The fix was to fuse the sign handling into the FWHT stages directly, so the transform and sign application become one branch-free pass instead of several loosely connected passes.

### Temporary stack buffers in the unpack path

Some of the unpack helpers decoded 16 values into a temporary `[f32; 16]` buffer on the stack and the caller then loaded them back into NEON registers.

That costs more than it looks like. It creates needless store/load traffic in a path where the values really want to stay in registers.

Returning four NEON vectors directly removed that extra round-trip through memory.

### Too much work per encoded element

On the encoding side, the original loop did per-element division by `sigma` and updated packed bytes with read-modify-write bit twiddling for each value.

That got cleaned up by:

- using a precomputed `inv_sigma`
- assembling full bytes before writing them
- handling the zero-sigma case as a bulk fill

### Validation overhead that had outlived its usefulness

During development I had optional validation paths in the dot-product and axpy implementations. Even when guarded carefully, that kind of machinery is still overhead in code that runs millions of times.

Once the implementation had test coverage and enough confidence, I removed that hot-path validation logic entirely.

### Two passes over the same data

Another structural issue was that the dot-product and axpy paths handled the Q2 base values and the residual signs in separate loops.

That means touching the query data twice and paying loop overhead twice.

Fusing those into a single pass reduced both memory traffic and loop overhead and ended up being one of the more worthwhile cleanups.

## The final result

Here is the full progression:

| Configuration | Throughput | Memory per KV element |
|---|---|---|
| Q8 KV-cache (baseline) | 7.255 tok/s | 8 bits |
| TurboQuant (initial) | 5.068 tok/s | ~3.125 bits |
| TurboQuant (after NEON regression) | 4.768 tok/s | ~3.125 bits |
| TurboQuant (accumulator fix) | 6.147 tok/s | ~3.125 bits |
| TurboQuant (precomputed signs) | 6.612 tok/s | ~3.125 bits |
| TurboQuant (fused FWHT + unpack) | 6.381 tok/s | ~3.125 bits |
| TurboQuant (all optimizations) | **6.950 tok/s** | ~3.125 bits |

So the final TurboQuant path ends up **4.2% slower than Q8** while using **61% less KV-cache memory**.

That is really the headline: a much smaller KV-cache while staying very close to the Q8 baseline on throughput.

## Why the context size changes the picture

One thing that became very obvious during testing is that TurboQuant only really pays off when the KV-cache is allowed to become large.

If the context is capped at a small value, the model weights dominate memory and the cache savings are barely visible. In that situation TurboQuant mostly looks like extra codec overhead.

### Capped context (`--context-size 2000`)

| Mode | Throughput | Peak memory footprint |
|---|---|---|
| Q8 | 7.199 tok/s | 1.69 GB |
| TurboQuant (initial scalar) | 5.208 tok/s | 1.65 GB |

At 2,000 tokens, the footprint difference is nearly irrelevant and TurboQuant is just slower.

### Native context (`seq_len = 262144`)

| Mode | Throughput | Peak memory footprint |
|---|---|---|
| Q8 | 7.255 tok/s | 15.41 GB |
| TurboQuant (initial scalar) | 5.068 tok/s | 7.89 GB |
| TurboQuant (final, all optimizations) | **6.950 tok/s** | 7.91 GB |

With the full native context, the picture changes completely.

The peak memory footprint drops from **15.41 GB** to about **7.9 GB**. On a machine with 16 GB of unified memory, that is the difference between "this is probably going to hurt" and "this is still workable".

That is really the point of the exercise. Not winning a synthetic micro-benchmark, but making very large context allocations much more practical.

## Complete benchmark progression

All numbers below were measured with the native context configuration:

| Iteration | Change | Throughput | Instructions retired |
|---|---|---|---|
| Q8 baseline | — | 7.255 tok/s | 12.68T |
| TurboQuant scalar | Initial implementation | 5.068 tok/s | 19.51T |
| + NEON (broken) | Scalar reduction after NEON loads | 4.768 tok/s | 15.12T |
| + Fixed accumulators | 4x independent `vfmaq_f32` + tree reduction | 6.147 tok/s | 21.85T |
| + Precomputed sign table | Eliminate per-element `splitmix64` on hot path | 6.612 tok/s | — |
| + NEON FWHT | Fuse sign passes into butterfly stages | 6.381 tok/s | — |
| + Fused transform + register unpack + batch Q2 encode | Eliminate intermediate buffers and passes | ~6.6 tok/s | — |
| + Fused dot/axpy + pre-scaled unpack + remove validation | Single-pass NEON, no atomic hot-path overhead | **6.950 tok/s** | 22.02T |

The instruction counts are interesting because they show that the final implementation does not win by doing less work in an absolute sense. It retires more instructions than Q8.

What improved is that the work is structured better:

- less scalar glue around SIMD code
- less redundant memory traffic
- fewer avoidable passes over the same data
- less bookkeeping inside the hot loops

That is the type of optimization work that tends to matter for attention kernels.

## Test setup

All benchmarks were run on an **Apple MacBook Air M4** with **32 GB unified memory**, using an aarch64 release build of **gguf-runner**.

**Model:** `Qwen3-VL-30B-A3B-Instruct-Q4_K_M.gguf` with `mmproj-Qwen3VL-30B-A3B-Instruct-Q8_0.gguf`

This is the multimodal MoE variant with:

- 48 transformer layers
- 32 attention heads
- 4 KV heads
- head dimension 128
- native maximum sequence length 262,144

**Prompt and image:** `regression/IMG_0138.jpg` at 768x768 plus the prompt `please describe the image`

Total prefill was **605 tokens**: 30 text tokens and 576 image tokens.

CLI used for the main runs:

```bash
# Q8 KV-cache
/usr/bin/time -l ./target/release/gguf-runner \
  --model ./Qwen3-VL-30B-A3B-Instruct-Q4_K_M.gguf \
  --image regression/IMG_0138.jpg \
  --prompt 'please describe the image' \
  --debug --show-tokens --temperature 0

# TurboQuant KV-cache
/usr/bin/time -l ./target/release/gguf-runner \
  --model ./Qwen3-VL-30B-A3B-Instruct-Q4_K_M.gguf \
  --image regression/IMG_0138.jpg \
  --prompt 'please describe the image' \
  --debug --show-tokens --temperature 0 \
  --kv-cache-mode turbo
```

Without `--context-size`, the runner uses the model's native `seq_len=262144`, which is what was used for the main benchmarks.

## Origin

TurboQuant originated at Google Research. This post is about implementing that scheme inside **gguf-runner**.

Original reference:

- https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/

## Links

- https://github.com/apimeister/gguf-runner
