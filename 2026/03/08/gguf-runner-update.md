---
title: "gguf-runner updates: vision support, releases, and many small improvements"
date: 2026-03-08
description: "gguf-runner gained vision support, ships GitHub release binaries, and received many usability and performance improvements."
tags:
- rust
- llm
- ai
- gguf
---

## A quick follow-up

In the [previous post](/2026/02/17/gguf-runner-blogpost.html) I introduced **gguf-runner**, a small Rust CLI for running GGUF models locally with a focus on:

- CPU-only inference
- mmap-based model loading
- a small, scriptable command line interface

If you haven’t read that one yet, it explains the motivation and the general design of the project.

This post is a follow-up covering some of the more recent additions, most notably **vision support**, along with a few practical improvements like **GitHub release binaries**, better documentation, and a number of performance tweaks.

---

A little while ago I wrote about **gguf-runner**, a small Rust CLI I built to run GGUF models locally on CPU with a focus on simplicity, mmap-based model loading, and scriptable workflows.

Since that post the project has evolved quite a bit. The overall philosophy hasn't changed — it's still meant to be a small, dependable runner — but several features made the tool significantly more practical.

The biggest one is **vision support**.

Repo: https://github.com/apimeister/gguf-runner

---

## Vision support

gguf-runner can now work with **image inputs**.

This allows vision-capable models to perform tasks such as:

- image description
- visual question answering
- OCR-like text extraction

Example:

```bash
gguf-runner \
  --model Qwen3.5-2B-Q4_K_M.gguf \
  --image receipt.jpg \
  --prompt "Extract the text from this image"
```

Or simply:

```bash
--prompt "Describe this image"
```

In practice this works surprisingly well, even with relatively small models.

During testing, **Qwen vision models around the 2B parameter range** already produced useful results for:

- describing scenes
- extracting readable text
- answering basic questions about images

For automation tasks or quick scripts this is often more than sufficient.

Importantly, this new capability still follows the same design principles as before:

- CPU-only inference
- single binary
- no Python runtime
- easy to integrate into scripts or pipelines

So now gguf-runner can act as a small building block for workflows that mix **text and images** without introducing a heavy ML stack.

---

## Small models are getting surprisingly capable

One observation while working on the vision support was how capable **small models** have become.

Models around **2B parameters** are now able to handle tasks that previously required much larger models, especially when quantized efficiently.

Combined with gguf-runner’s mmap-based loading approach, these models can run comfortably on normal machines without large memory requirements.

This makes it practical to experiment with multimodal workflows even on modest hardware.

---

## Why building locally is still recommended

Even though release binaries are now available, **building locally is still recommended for regular use**.

The main reason is CPU optimization.

Prebuilt binaries are compiled for a conservative baseline so they run on a wide range of machines. When you build locally, Rust can optimize the binary for the instruction set of your specific CPU.

You can install gguf-runner directly from source with Cargo:

```bash
# default (portable)
cargo install --git https://github.com/apimeister/gguf-runner

# optimized for this machine (recommended)
RUSTFLAGS="-C target-cpu=native" cargo install --git https://github.com/apimeister/gguf-runner
```

Using `target-cpu=native` allows the compiler to enable additional SIMD instructions supported by your CPU.

On an **AMD Ryzen 7 PRO 8700GE**, this resulted in a noticeable performance improvement:

| metric | portable build | native build | change |
|------|------|------|------|
| tokens/sec | 5.668 | 6.848 | +20.8% |
| runtime | 215.522s | 178.041s | -17.4% |

So while the portable binary works everywhere, a locally built binary can be **significantly faster**.

Note: binaries compiled with `target-cpu=native` are tuned for the build machine and may not run correctly on different CPUs.

---

## Runtime CPU feature detection

To make it easier to understand what the binary can actually use at runtime, gguf-runner now includes a feature inspection command:

```bash
gguf-runner --show-features
```

This prints the SIMD instruction sets detected on the current machine and which optimized kernels gguf-runner will enable.

### Example: Apple M4

```
Architecture: aarch64

feature     ISA                    runtime
--------------------------------------------
neon        ARMv8-A (baseline)         yes
dotprod     ARMv8.2-A                  yes
fp16        ARMv8.2-A                  yes
i8mm        ARMv8.6-A                  yes
sve         ARMv8.4-A (opt-in)         no
sve2        ARMv9-A                    no

gguf-runner kernels (aarch64):
  NEON matmul Q4/Q5/Q6-K MR4:  always enabled
  FCVTL fp16 loads:             always enabled (base AArch64)
  VSHLL bf16 loads:             always enabled (base AArch64)
  dotprod Q8_0:                 runtime=yes
  i8mm Q8_0 MR2 (SMMLA):        runtime=yes
```

### Example: AMD Ryzen 7 PRO 8700GE

```
Architecture: x86_64

feature       ISA                        runtime
--------------------------------------------------
sse4.1        Intel Penryn 2007              yes
avx           Intel Sandy Br. 2011           yes
avx2          Intel Haswell 2013             yes
fma           Intel Haswell 2013             yes
f16c          Intel Ivy Br. 2012             yes
avxvnni       Intel Alder Lk. 2021           no
avx512f       Intel Skylake-X 2017           yes
avx512vnni    Intel Cascade Lk. 2019         yes
avx512vl      Intel Skylake-X 2017           yes

gguf-runner kernels (x86_64):
  AVX2+FMA matmul Q4/Q5/Q6-K:  runtime=yes
  F16C fp16 loads:              runtime=yes
  AVX-VNNI Q8_0:                runtime=no
  AVX-512VNNI Q8_0:             runtime=yes
```

This makes it easier to understand why performance differs between machines and confirms that optimized kernels are actually being used.

---

## GitHub releases

Another practical improvement is that **gguf-runner now ships GitHub releases**.

You can download a prebuilt binary from:

https://github.com/apimeister/gguf-runner/releases

This removes the need for a local Rust toolchain if you just want to try the tool.

---

## Documentation improvements

Another area that received attention is documentation.

The README has been expanded to make the project easier to approach. In addition, several documentation files were added in the `docs/` directory covering:

- features
- model downloading
- image scaling
- module structure
- performance notes

The goal is still to keep the project lightweight, but it should now be easier to understand how things fit together.

---

## Still the same philosophy

Even with the new features, the core idea of gguf-runner remains the same:

- CPU-first
- mmap-based model loading
- small, single binary
- scriptable CLI

The goal is not to build a full inference platform, but rather a **small general-purpose runner** that can act as a reliable building block.

---

## Links

- https://github.com/apimeister/gguf-runner
- https://github.com/apimeister/gguf-runner/releases
