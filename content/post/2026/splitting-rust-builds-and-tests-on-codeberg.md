---
title: "Splitting Rust builds and tests on Codeberg"
date: 2026-06-30
description: "A heavy Rust integration test suite kept getting killed by Codeberg's per-job time limit. Here is how a targeted dev profile, a build-once job, and cargo-nextest partitioning got it green again."
tags:
- codeberg
- rust
- ci
---

After I got [building containers on Codeberg](/2026/03/15/building-containers-on-codeberg.html) sorted out, the next thing that broke on me was much more boring on paper: the test job kept getting killed.

Not failing. Killed.

The logs would scroll happily through compilation and a few dozen passing tests, and then the runner would just cut the job off mid-run with a deadline error.

So this post is about that: what to do when your Rust test suite is simply too slow to fit inside a single hosted CI job, and the runner has opinions about how long it will wait for you.

The project is the same one as last time, [ami](https://codeberg.org/apimeister/ami), a Rust photo backend. The relevant detail is that it has the kind of test suite that is genuinely expensive to run.

## The constraint nobody mentions until you hit it

On your own machine, a slow test suite is an annoyance.

On a hosted Codeberg runner it is a hard wall. Each job gets a time budget, and when you cross it the job does not get a warning or a slower lane. It gets terminated.

For my test job that budget was somewhere around ten minutes. That sounds generous right up until you add up what was actually happening inside it:

* roughly five minutes just to compile the test binaries
* then a few hundred tests, some of which were genuinely slow

So the first thing worth saying is the unglamorous part:

> The CI time limit is not a bug to work around. It is a fixed input you have to design the pipeline around.

You do not get to make the runner more patient. You get to make the job smaller.

## Why the tests were slow in the first place

Before reaching for pipeline tricks, it is worth understanding *why* a job is slow, because the fix is different depending on the answer.

In my case the tests were not slow because there were silly sleeps or bad mocking. They were slow because they were honest integration tests. A typical one would:

1. spin up a real server instance
2. create a user, which means a real `bcrypt` hash
3. upload an image, which means real preview generation

That last step is the killer. Preview generation runs through the image and video codec crates, and in a normal debug build those crates are compiled with no optimization.

Unoptimized codec code is *slow*. A single roundtrip test that encoded a preview could sit at ten, twenty, sometimes forty seconds on the runner. Multiply that across a couple hundred tests and you can see where the ten minutes went.

So there were really two separate problems hiding behind one symptom:

* the tests themselves were doing heavy per-test work
* and the code doing that work was running unoptimized

## Lever one: optimize the hot dependencies only

Cargo has a nice feature for exactly this situation. You can override the optimization level of individual dependencies, even in the dev profile, without optimizing your own crate or the rest of the world.

The naive version looks tempting:

```toml
[profile.dev.package."*"]
opt-level = 3
```

That says "optimize every dependency". Do not do this. I did, and it made things worse, not better.

The reason is subtle. That glob also catches the dependencies that build native C code from source, and ami pulls in a few of those (an image library and a TLS stack among them). Telling those to compile at `-O3` does not speed up your tests. It makes the *compile* itself dramatically longer, and the compile was already half my budget. I had simply moved the timeout from the test phase into the build phase.

The fix was to be surgical and list only the pure-Rust codec crates that actually do the per-pixel work:

```toml
[profile.dev.package.rav1e]
opt-level = 3
[profile.dev.package.image]
opt-level = 3
[profile.dev.package.png]
opt-level = 3
[profile.dev.package.zune-jpeg]
opt-level = 3
# ...and the rest of the image/video codec stack
```

Everything not on the list stays at `opt-level = 0`, so compiles stay quick, while the hot loops that the tests hammer run fast.

> The `"*"` glob optimizes your dependencies. It also recompiles the ones you did not want to touch. Name the crates you mean.

This helped. The slowest preview tests dropped sharply. But it was not enough on its own, because on a slow shared runner the dominant cost per test turned out to be the whole package of server setup plus crypto plus codecs, not just the codecs. Tuning one ingredient does not rescue a job that is fundamentally trying to do too much.

## Lever two: stop doing it all in one job

This is where the actual pipeline change comes in.

If a single job cannot finish in the time limit, the structural answer is to split the work across several jobs that each stay under it. For tests, the tool that makes this pleasant is [cargo-nextest](https://nexte.st/), which can partition a test run into deterministic slices:

```bash
cargo nextest run --partition count:1/3
cargo nextest run --partition count:2/3
cargo nextest run --partition count:3/3
```

Each invocation runs roughly a third of the tests, chosen deterministically, with no overlap. Put that behind a matrix and you have three jobs instead of one.

My first attempt was exactly that: a single `test` job with a partition matrix. It worked, in the sense that the suite stopped getting killed. But the timing was lopsided in a way that bothered me:

```text
test (1)   8m54s
test (2)   4m33s
test (3)   3m22s
```

The first shard was almost at the limit again while the others finished in half the time. The reason is the cache. The first shard to run had a cold build cache, so it paid the full five-minute compile *and* ran its slice of the tests. The later shards restored the cache the first one left behind, compiled almost nothing, and breezed through.

So the work was split, but the heavy lifting was not shared. One shard was doing the compile for everybody.

## Lever three: build once, then fan out

The cleaner shape is to make the compile its own job, and let the test shards inherit a warm cache.

The build job compiles the test binaries and does nothing else. The trick is `--no-run`, which builds the harnesses without executing them:

```yaml
build:
  runs-on: codeberg-medium-lazy
  steps:
    - uses: actions/checkout@v4
    - name: Install Rust toolchain
      run: |
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
          | sh -s -- -y --profile minimal --default-toolchain stable
        echo "$HOME/.cargo/bin" >> "$GITHUB_PATH"
    - name: Install cargo-nextest
      run: |
        curl -LsSf https://get.nexte.st/latest/linux \
          | tar zxf - -C "$HOME/.cargo/bin"
    - name: Cache Rust build artifacts
      uses: https://github.com/Swatinem/rust-cache@v2
      with:
        shared-key: test
    - name: Install native build dependencies
      run: apt-get update && apt-get install -y cmake
    - name: Compile test binaries
      run: cargo nextest run --no-run --locked
```

The test job then declares `needs: build`, restores that same cache, and only runs its partition:

```yaml
test:
  needs: build
  runs-on: codeberg-medium-lazy
  strategy:
    fail-fast: false
    matrix:
      partition: [1, 2, 3]
  steps:
    # ...identical checkout / toolchain / nextest steps...
    - name: Cache Rust build artifacts
      uses: https://github.com/Swatinem/rust-cache@v2
      with:
        shared-key: test
        save-if: "false"
    - name: cargo nextest run (partition ${{ matrix.partition }}/3)
      run: cargo nextest run --locked --partition count:${{ matrix.partition }}/3
```

Two small but important details make this work:

* `shared-key: test` ties the build job and every shard to the *same* cache entry, so they all restore what the build job populated instead of each keeping a private copy.
* `save-if: "false"` on the shards stops three parallel jobs from racing to re-save the same key. The build job is the only writer; the shards are readers.

Now no single shard carries the cold compile. The build job absorbs it once, and the test shards start warm and finish at roughly the same time. The lopsided 9-minute shard is gone.

## A Codeberg-specific footnote

One thing that will bite you here if you come from GitHub Actions: the cache action needs its full URL.

```yaml
uses: https://github.com/Swatinem/rust-cache@v2
```

`actions/checkout@v4` resolves fine because Codeberg mirrors the `actions/*` namespace. Anything outside it does not, so you spell out the full `https://github.com/...` path. Same lesson as last time: the defaults are not quite the defaults.

## The honest part about sharding

I want to be careful not to oversell this, because there is a nuance that matters.

On a shared Codeberg runner, those three test shards do not necessarily run in parallel. If there is one runner slot, they run one after another. So sharding did not make my total wall-clock dramatically shorter the way it would on a fleet of parallel runners.

What it bought me is the thing I actually needed:

> Sharding does not make the work smaller. It makes each *job* smaller, and the time limit is a per-job limit.

That is the whole point. The runner does not care that three jobs together take eighteen minutes. It cares that no single job crosses ten. Splitting a twenty-minute job into three seven-minute jobs is a win even if nothing runs in parallel, because three green jobs beat one killed job every time.

And the build-once split gave me the second thing: balance. Every job is now comfortably inside the budget with headroom, instead of one shard living dangerously close to the edge and growing more dangerous with every test I add.

## The lesson I keep relearning

If I am honest, every one of these levers is fighting a symptom.

The real cost is that each test spins up a server, hashes a password, and encodes an image. That is a lot of machinery per assertion. The genuinely cheap fix is not a CI trick at all; it is lighter fixtures: a lower `bcrypt` cost factor in tests, smaller fixture images, shared setup. That would cut the absolute time more than any partitioning scheme.

But that is test-code work, and sometimes you need the pipeline green *today* while you decide whether the test design is worth changing. The CI-level levers are what buy you that breathing room.

So the order I would now recommend for a slow Rust suite on Codeberg is:

1. find out *why* it is slow before optimizing anything
2. optimize only the hot dependencies in the dev profile, and name them explicitly
3. compile once in a dedicated build job that warms a shared cache
4. partition the tests with nextest so each shard stays under the time limit
5. and keep eyeing the actual per-test cost, because that is where the real minutes live

## Closing thought

The container post ended on the idea that on a hosted runner, compatibility is the real constraint. This one has a sibling lesson: on a hosted runner, *time* is the real constraint.

You are not on your laptop, where a slow test run just means a longer coffee break. You are inside somebody else's idea of how long a job is allowed to take, and that boundary is not negotiable.

The good news is that the tools to live inside it are boring and dependable. A targeted Cargo profile, a build job that compiles once, and a test runner that knows how to slice itself into thirds. Nothing clever, nothing fragile.

And in CI, as before, boring and dependable is exactly what you want.
