---
title: "Building containers on Codeberg"
date: 2026-03-15
tags:
- codeberg
- containers
- ci
---

I have been moving more and more of my smaller projects over to Codeberg lately.

For plain git hosting and Forgejo based CI, it is a very pleasant setup. The one area where I had to do a bit more work than expected was container builds.

At first glance this looks like it should be boring:

1. write a `Dockerfile`
2. add a CI step
3. build the image

But on a hosted Codeberg runner this is exactly the type of thing where the defaults are not quite the defaults you may be used to from GitHub Actions or from your own machine.

So this post is about that.

The generic version first: how to build OCI images in a Codeberg CI environment.
And then, because real examples are more useful than abstract advice, I will use `ami` as the concrete case in the second half.

## The simple mental model

When people say “build a docker image in CI”, they often really mean one of three different things:

1. run a Docker daemon and ask it to build an image
2. run Podman and let it build an image in a daemonless way
3. run Buildah directly and produce an OCI image

Locally, all three can feel pretty interchangeable.
In a hosted CI environment they are not.

On Codeberg, you should assume the following:

* you do not control the runner kernel
* you do not control which device nodes are exposed
* you should avoid anything that needs a privileged Docker daemon
* rootless container storage details suddenly matter

This is why “just use docker build” usually does not help here.

## Why the default Docker tooling is not the right fit

The classic Docker workflow assumes there is a Docker daemon somewhere.
That daemon either runs on the host already, or you start some docker-in-docker setup, or you mount `/var/run/docker.sock` from the host into your job.

All three options are awkward in hosted CI.

If the runner does not already provide a Docker daemon, you are stuck.
If you try docker-in-docker, you are now in privileged-container territory.
If you rely on a host socket, you are back to depending on runner internals you do not control.

That is not a great base for a portable workflow.

More importantly, it is also not really necessary anymore.
For simple CI builds, a daemon is just one more moving part.

So the first conclusion is:

> On Codeberg hosted runners, do not start from the assumption that Docker is the right build interface.

## Why Podman is not enough either

The next obvious choice is Podman.
It is daemonless, scriptable, and usually works well on normal Linux machines.
So why not just run `podman build` in CI?

Because in these environments Podman is not magic either.
Under the hood it still relies on the same container storage stack and the same mount capabilities as Buildah.

That is where the real problem showed up for me.

The failure looked like this:

```text
using mount program /usr/bin/fuse-overlayfs: unknown argument ignored: lazytime
fuse: device not found, try 'modprobe fuse' first
fuse-overlayfs: cannot mount: No such file or directory
```

This tells you quite a lot:

* the build stack tried to use `fuse-overlayfs`
* the runner did not expose a usable FUSE device
* therefore the default overlay based storage driver could not mount its working filesystem

At that point `podman build` and `buildah bud` are both going to fail if they both use the default storage settings.

So the second conclusion is:

> Podman is not the issue, but it does not save you from the storage-driver problem.

If you just replace `docker build` with `podman build`, you may still be standing on the exact same broken mount path.

## Why Buildah is the right tool here

So why use Buildah directly?

Because it is the simplest tool in this layer.
It builds OCI images without requiring a daemon, and it gives you very explicit control over storage and isolation settings.

That last part is the key.

Once you accept that the problem is not “which container brand do I like”, but “which storage backend works on this runner”, Buildah becomes the most direct solution.

For Codeberg CI, the practical setup is:

* use `buildah`
* force the storage driver to `vfs`
* force isolation to `chroot`

That avoids overlay mounts and avoids depending on `/dev/fuse`.

Is `vfs` slower than overlay?
Yes.

Does that matter for a small or medium image build in CI?
Usually not enough to care.

The important thing is that it works predictably.

And in CI, predictable beats theoretically faster every single time.

## The actual workflow change

The only part I had to adjust in the Forgejo workflow was the image build job.

This:

```yaml
- name: Build image
  run: |
    buildah bud -t ami:latest .
```

became this:

```yaml
- name: Build image
  env:
    STORAGE_DRIVER: vfs
    BUILDAH_ISOLATION: chroot
  run: |
    buildah --storage-driver="$STORAGE_DRIVER" \
      bud --isolation="$BUILDAH_ISOLATION" -t ami:latest .
```

That is the whole trick.

No daemon.
No podman wrapper.
No docker socket.
No special runner setup.

Just telling the image builder to use the boring fallback path instead of the fancy mount path.

## Why `vfs` and `chroot` help

It is worth being explicit here because otherwise the fix looks a bit random.

### `vfs`

The `vfs` storage driver does not rely on overlay filesystem mounts.
It copies files into its working layers in a simpler way.

That means:

* less kernel feature dependence
* no need for `fuse-overlayfs`
* lower chance of runner specific mount surprises

The tradeoff is performance and disk usage.
For CI image builds that is often perfectly acceptable.

### `chroot`

The `chroot` isolation mode is another step toward compatibility.
It avoids some of the namespace and runtime expectations that can become brittle on hosted runners.

Again, it is not the fanciest option.
It is just the one that tends to work in restricted environments.

This is a general theme for CI:

> The best build setup is often the least clever one that still does the job.

## A generic container build example for Codeberg

Let us say you have a normal project with a standard `Dockerfile`.
Then a small Forgejo job can look like this:

```yaml
container:
  runs-on: codeberg-medium-lazy

  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Install buildah
      run: |
        apt-get update
        apt-get install -y buildah

    - name: Build OCI image
      env:
        STORAGE_DRIVER: vfs
        BUILDAH_ISOLATION: chroot
      run: |
        buildah --storage-driver="$STORAGE_DRIVER" \
          bud --isolation="$BUILDAH_ISOLATION" \
          -t myapp:latest .
```

That already gets you a repeatable image build on Codeberg.

If you want to push the image somewhere afterwards, you can add `buildah login` and `buildah push`.
But I would keep the first version minimal until the build itself is stable.

## The `ami` case

Now for the concrete example.

[ami](https://codeberg.org/apimeister/ami) is a Rust binary, and that makes it a pretty nice candidate for a small container image.
The build is a classic multi-stage setup:

```dockerfile
FROM docker.io/library/rust:alpine AS builder
RUN apk add --no-cache cmake g++ musl-dev
WORKDIR /app
COPY . .
ENV RUSTFLAGS="-C link-arg=-static-libstdc++ -C link-arg=-static-libgcc"
RUN cargo build --release

FROM scratch
COPY --from=builder /app/target/release/ami /ami
ENTRYPOINT ["/ami"]
```

There are a few reasons I like this shape:

* the builder image is explicit
* the final image is tiny
* the runtime has no extra package manager baggage
* deployment becomes “ship one binary”

This is one of the places where Rust really shines.
If your application can live as a single statically linked binary, then your container story becomes much simpler.

And that simplicity matters even more in CI, because fewer runtime assumptions mean fewer surprises on weird runners.

In the `ami` workflow I already had separate jobs for:

* `cargo fmt`
* `cargo clippy`
* `cargo test`
* HTTP level integration tests with `hurl`

The container build was intentionally placed after those.
That is a useful pattern in general.

There is no reason to spend time building an image if your unit tests or integration tests are already red.

So the pipeline order became:

1. static checks
2. unit tests
3. integration tests
4. image build

This keeps the expensive or more environment-sensitive step at the end.

## A small but important lesson

The interesting thing here is that the `Dockerfile` was fine.
The image content was fine.
The application was fine.

The failure was purely about the container build environment.

That distinction matters because it changes how you debug the problem.

If the first layer already fails to mount, do not waste time tuning your application image.
Look at:

* storage driver
* overlay support
* fuse availability
* runner privileges
* isolation mode

In other words: treat CI container failures as infrastructure problems first, not application problems first.

That sounds obvious, but it is easy to lose an hour tweaking base images when the real issue is just “this runner cannot do fuse mounts”.

## What I would recommend going forward

If you build containers on Codeberg hosted runners, my default recommendation would be:

* start with Buildah, not Docker
* use `vfs` unless you know the runner supports overlay cleanly
* use `chroot` isolation for maximum compatibility
* keep the container build late in the pipeline
* only optimize build speed after the workflow is stable

If you are on your own dedicated runner, the answer may be different.
There, Podman or even Docker may be perfectly fine because you control the kernel, devices, and privileges.

But on a hosted environment, compatibility is the real constraint.

## Closing thought

I still like containers for the same reason I liked them years ago: they decouple software from the machine.
But CI is the place where that promise gets tested a bit harder.

You are suddenly not building on your laptop anymore.
You are building inside somebody else’s idea of a safe runner.

That is why the old “just use docker build” advice ages badly in these environments.

The good news is that the solution is not complicated.
You just need to drop one abstraction layer lower and tell the image builder exactly how conservative it should be.

For me that meant using Buildah directly.

And yes, the immediate motivation here was getting `ami` to build cleanly on Codeberg.
But the pattern is generic enough that I would now use it as the default for any small service I want to package there.

If the final result is a reproducible image build without a daemon, without privileged hacks, and without runner specific magic, that is already a pretty good place to be.
