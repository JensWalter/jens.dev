---
title: "gguf-runner: a minimal GGUF CLI"
date: 2026-02-17
description: "A small Rust CLI to run GGUF models locally: mmap loading, CPU-only inference, and a general-purpose terminal runner that can lean on RAM (and swap) for large models."
tags:
- rust
- llm
- ai
- gguf
- gguf-runner
---

I’ve been playing with local LLMs again.

Not in the “let’s build a platform” way. More in the “I want a tiny tool I can keep in `~/bin` and forget about” way.

So I built **gguf-runner**: a small Rust CLI to run **GGUF** models locally, **CPU-only**, with a focus on *low memory overhead* and a clean “pipes and scripts” workflow.

Repo: https://github.com/apimeister/gguf-runner

## Memory first: GGUF + mmap

The core idea behind gguf-runner is simple:

> Load the model using memory mapping (mmap) so the OS can page it in as needed.

GGUF is a model format that stores tensors and metadata in a way that works well with memory mapping. Instead of “read the entire model file into RAM”, you map it and let the OS do what it’s good at: caching, paging, and sharing pages.

That has a few nice properties:

- **Low startup overhead**: you don’t copy gigabytes into process memory up front.
- **Lower peak RSS** in practice compared to naive file reads.
- **Predictable behavior**: the OS decides which pages are hot and keeps them.
- **It scales surprisingly far**: you can run models that are bigger than physical RAM.

This last point is the one I care about most.

If the model is larger than your RAM, the OS will eventually page parts of it out. If you have swap enabled, you can still run the model. It will get slower, obviously, but it’s often still useful for experiments, batch runs, or “I just want to see if this works”.

This is not meant as a recommendation to run 30B models on a tiny laptop.  
But it *is* a practical escape hatch, and I wanted the tool to support it.

## CPU-only, intentionally

gguf-runner is **CPU-first**. There’s no CUDA, no Metal, no “install the correct driver version”, no VRAM juggling.

This is a deliberate design choice:

1. It keeps the build and runtime environment simple.
2. It makes the tool portable across machines.
3. It avoids turning “run a model” into a GPU dependency story.

Also, in practice, CPU inference for quantized GGUF models is already surprisingly usable.

For many tasks, I’d rather have:
- a model that runs everywhere,
- a simple binary,
- and a predictable workflow,

than a tool that’s 2× faster but only on one specific setup.

## A general-purpose vehicle (not a chatbot product)

I didn’t build gguf-runner to be a chat UI, a server, or a framework.

It’s meant to be a general-purpose engine you can plug into whatever you’re doing:

- prompt in -> text out
- stream tokens to stdout
- script it
- pipe it
- use it in batch jobs
- wrap it in your own tools

That’s it.

This also means the project stays small. Which is the point.

## Current performance

I’m keeping raw notes in `docs/performance.md`, but here’s a condensed snapshot across different machines and model sizes.

| Model | Machine | Tokens/sec |
|--------|----------|------------|
| Qwen3-0.6B-Q4_K_M | mac-m4-32g | ~24.5 |
| Qwen3-4B-Instruct | lnx-13600k | ~3.8 |
| Qwen2.5-Coder-14B | mac-m4-32g | ~1.25 |
| Qwen3-30B-A3B | lnx-9700-64g | ~7.28 |

A few observations:

- Small 0.6B quantized models easily reach **20+ tokens/sec** on modern laptops.
- 4B models are perfectly usable for interactive CLI work.
- 14B models are slower but still practical.
- Even 30B-class models can run on a 64GB Linux machine without GPUs.

This is all **CPU-only**. No GPU acceleration involved.

The goal here is not to win benchmark charts. It’s to provide predictable, scriptable throughput on normal hardware.

- [Performance notes (`docs/performance.md`)](https://github.com/apimeister/gguf-runner/blob/main/docs/performance.md)

## Models I’ve been using

So far I’ve been using gguf-runner across a mix of GGUF model families, only in quantized variants (often Q4_K_M or similar):

- **Qwen** (examples from my perf notes):
  - Qwen3-0.6B-Q4_K_M
  - Qwen3-4B-Instruct
  - Qwen2.5-Coder-14B
  - Qwen3-30B-A3B
- **Llama family** (Llama-style instruct/chat models in GGUF form)
- **Gemma family** (Gemma models in GGUF form)

The smaller models are great for quick experiments and scripting.  
The mid-size ones (around 4B–14B) are where things start to feel properly useful.  
And for the bigger models, mmap plus OS paging (and swap, if needed) makes “this is bigger than RAM” a performance problem rather than an immediate crash.

## Tested runtime environments

All runs are CPU-only. No GPUs involved.

| Host ID | CPU | Cores | RAM | OS | Notes |
|---|---|---:|---:|---|---|
| mac-m4-32g | Apple M4 | 10 | 32 GB | macOS 15.3 | laptop |
| lnx-n150-12g | Intel N150 | 4 | 12 GB | Gentoo Linux | Beelink ME mini |
| lnx-1340p-32g | Intel i5-1340P | 16 | 32 GB | Fedora 14 | Framework 13 |
| lnx-125h-32g | Intel Ultra 125H | 18 | 32 GB | Gentoo Linux | Minisforum M1 Pro-125H |
| lnx-13600k-8g | Intel i5-13600K | 20 | 8 GB | Ubuntu 24.04 |  |
| lnx-9700-64g | AMD Ryzen 7 PRO 8700GE | 16 | 64 GB | Ubuntu 24.04 | Hetzner AX42 |

These cover a fairly typical range: modern laptop, mid-range desktop, and a 64 GB Linux box for larger experiments.

The common denominator: just CPUs, RAM, and occasionally swap.

## What it looks like

Build it:

```bash
git clone https://github.com/apimeister/gguf-runner
cd gguf-runner
cargo build --release
```

Run it:

```bash
./target/release/gguf-runner \
  --model ./models/your-model.gguf \
  --prompt "Write a haiku about mmap."
```

It prints tokens. You can tune generation with the usual knobs:

- temperature / top-k / top-p
- max tokens
- system prompt

And there are a couple of flags for debugging and timings.

## Why I like this approach

The thing I like most about this project is that it leans on boring, battle-tested primitives:

- **the OS page cache**
- **mmap**
- **CPU threads**
- **a single model file**

There’s no magic. No background daemon. No runtime environment. No “download this 5GB dependency first”.

Just a runner.

## What’s next

This is still early and I’m sure there are sharp edges.

Things I’m interested in next:

- structured output modes (JSON)
- better chat templates (without turning it into a framework)
- a tiny benchmark harness
- bash/zsh completion

But I’m deliberately trying to keep the project from growing tentacles.

## Links

- https://github.com/apimeister/gguf-runner
