---
title: "Git as universal storage"
date: 2026-09-11
description: "Some thoughts on why a plain Git repository might be the most underrated storage building block for self-hosted and open source software."
tags:
- git
- conceptual
- everlock
---
## A general observation

In the past months I started digging more and more into the self-hosting space. On the one side due to the rising prices for hosting and cloud, but also since I saw way less movement on the development side for new projects.

So overall, most of the needed parts either had a solution that one could buy or had some version of an open source solution. Since my overall plan is to become less dependent on single-ecosystem products, I am naturally more interested in the open-source world.

One general thing that came up for more and more solutions is the explosion of dependencies. Nowadays even the simplest open source tools/servers need at least some Redis for caching/queueing, some database (mostly Postgres), some application server. And more often than not, distributed workers, blob stores for files and so on. All of this left me with a fatigue, since nearly every one of those stacks would not just cost me considerable time to set up, but also come with a great cost in regards to maintaining the solution.

If you want some examples of how big this software has become, here are some of the projects I looked at during my discovery phase.

- Forgejo for project hosting
- Immich for photos
- Vaultwarden as a self-hosted password manager
- Harbor as a container registry

And just as a side note: all of those are good projects with a huge amount of functionality. The problem is not that they are badly designed. The problem is that as a single person, maintaining several complete application stacks for private infrastructure very quickly becomes a project by itself.

Starting a container is easy. Understanding which parts of an application actually contain valuable state, how they depend on each other, how to back them up consistently and how to restore them five years later is the hard part.

That is the part that started bothering me.

## Thoughts about it

So coming from there, I was thinking about how most of those technology stacks are built and leveraged, and which parts are actually necessary. Especially since I am not the next Google, I needed something I can host and share without too much of an effort.

The problem became two-fold. First the protocol: to fulfill most of the needs, the software has to implement special protocols to work, so an email server needs SMTP and IMAP, a container registry needs OCI, a calendar server needs iCal. The second problem is storage: every one of those services must have some internal storage mechanism to provide persistent memory to perform its operations.

If I look at existing stacks, both problems are usually solved through a mixture of technologies that are just stacked up, often to allow for a scale-up or scale-out factor that few installations will ever reach, but every installation has to deal with.

So coming back to the most simple form of both: the protocol needs special software implementing it, but the storage part, in its most basic form, is a filesystem. It is versatile, probably not the most feature-rich or performant option, but it is the most basic building block we have, and the protocol can adapt and enhance the experience later on.

Sadly, just using a filesystem has its drawbacks, especially for higher-value information (stuff that I do not want to lose, like photos from 30 years ago, or passwords I need for my daily business). To solve this, most people are using backup solutions (yeah, another software stack with its own requirements) which take the burden off the single-instance problem.

That leaves another problem: what if something goes wrong, like a software update, an accidental delete (again, talking 30 years of photos) or other unforeseen issues like hardware. One of the solutions here could again be backup, but that raises the bar, since pure replication is no longer solving the problem.

Also, pushing this problem further down the stack to the actual filesystem is only an option on some systems, not a general solution. BTRFS and ZFS are good solutions with snapshots, compression, copy-on-write semantics and so on, but they are not universally available, and again hard to elevate into something hardware-independent (disk-failure redundant, OS redundant, machine redundant).

So overall, I am talking about a very basic building block here. Leaving protocol (and therefore performance) out of the picture, I land at a very basic conclusion: filesystems work for organising information, and filesystems are agnostic to the data stored inside them. What a filesystem is not good at is versioning and replication (distributed attributes that cross the machine/hardware boundary). But there already is a perfectly fine solution for distributed file sharing out there, and it powers most of the open-source ecosystem anyway.

## Git - it's already there

So Git is the missing piece that adds to the basic filesystem building block. It inherently has versioning inside, and replicating files to another machine is as easy as a Git push/pull. That ticks off so many issues, because it does not need extra tooling or services that we would have to provision. It is available as a binary executable on all operating systems, and its replication/communication can either work through file sharing or something more sophisticated like SSH or HTTP.

But it also opens up new questions that would otherwise be answered by the classic stack, and I want to dig into those a little bit.

### Atomicity

Filesystems do have atomic operations, replacing a file through a rename for example. But that is not quite the kind of atomicity I am interested in here. What matters to me is having a logical boundary around a complete version of a dataset, and Git has exactly such a boundary: the commit.

Before a commit exists, I may have a number of local changes. Files can be written, removed or transformed. Once I create a commit, I have an immutable description of one complete state of the repository. A commit points to a tree, and the tree describes the state of all files at that point in time.

That gives me a natural publication boundary. A service can prepare several related changes and only make the new state visible once the commit has been created and the corresponding reference moved. That is not a replacement for database transactions, but for many storage workloads it is a surprisingly useful form of atomicity.

### Binary data

One common assumption is that Git fundamentally works with text. That is not really true at the storage level. Git stores file contents as blobs, and a blob is just a sequence of bytes. Git does not have one object type for text files and another for JPEGs, both are blobs.

Where the difference becomes visible is in Git's higher-level tooling. Diffing source code line by line is useful, trying to produce a human-readable line diff between two JPEG files is generally not. Merging two source files can often be done automatically, merging two independently modified halves of a JPEG is not something I particularly want to see. So binary data loses some of the functionality that makes Git so convenient for source code, but the actual storage model works perfectly well with binary content.

Git can even delta-compress binary objects internally when it packs a repository. The delta algorithm does not need to understand JPEG or PNG formats, it simply looks for matching byte sequences and can represent one object partly in terms of another. That happens to work extremely well for text, because small textual modifications usually leave most of the bytes unchanged. For compressed binary formats such as JPEG, the result is often less efficient, because a small visual change can produce a large change in the compressed byte stream. But that is an efficiency question, not a fundamental capability problem.

### Large binary data

Another common complaint is that Git is not built for "large" binary data. I think this needs more refinement, because what exactly is large? For the kind of data I care about, large means anything from a couple of megabytes to a few gigabytes: photos, software artifacts, container layers, archives. I am not talking about multi-terabyte scientific datasets here. And in that range I have so far found very little evidence that Git simply cannot handle the data.

What matters much more is the access pattern. There is a huge difference between storing a 2 GB object that never changes and replacing the same 2 GB object every hour. Git keeps history, that is the feature. But it also means that continuously replacing very large objects can make the repository grow quickly. A collection of mostly immutable photos is therefore a very different workload from repeatedly committing database dumps.

The same applies to repository size. A repository containing hundreds of gigabytes of mostly immutable data is not the same problem as a repository with a small working tree but years of extremely high churn. These are different dimensions:

- total repository size
- individual object size
- amount of historical churn

Hosted Git providers obviously care about those limits, because every repository consumes shared infrastructure. For self-hosting, I can make a different decision. If I am willing to dedicate several hundred gigabytes to a repository, that is my choice. I am already storing tens of gigabytes of photos and hundreds of gigabytes of container image data this way without running into any fundamental issue. That does not mean Git is infinitely scalable, it means that "Git does not support large files" is too simple a statement.

Git LFS is often presented as the obvious answer here, but LFS solves a somewhat different problem. It keeps large objects outside the normal Git object database and stores small pointer files inside the repository. That can make sense for hosted source repositories where developers should not download gigabytes of assets as part of a clone. For what I am trying to achieve, however, it introduces yet another storage system, and that is exactly the kind of thing I am trying to avoid. If my Git repository can already store the objects directly, adding another service just to move those objects outside Git does not automatically make the architecture better.

## Content addressing

Another property that becomes interesting when using Git as storage is that the content itself has an identity. Git does not identify a file only through its path, objects are addressed through hashes derived from their contents. At first this sounds like an implementation detail, but for storage it is much more useful than that.

If two repositories contain the same Git object, they contain the same bytes. I do not need another database record telling me whether those objects are identical, the identity comes from the object itself. That also helps replication: when two Git repositories communicate, they can determine which objects already exist on both sides and transfer only what is missing. For source code this behavior mostly disappears behind `git push` and `git fetch`, but for a generic storage system it is a fairly powerful property.

A photo can be a blob. An email can be a blob. A container layer can be a blob. If the same object is referenced from multiple places, it does not need to be stored as multiple independent copies.

This idea is also not particularly unusual. Container registries already use a similar content-addressed model, layers and manifests are identified by digests. Git simply provides a mature object model and replication mechanism around the same general idea.

## Integrity for free

Earlier I dismissed BTRFS and ZFS as good-but-not-universal solutions. Commits already recover one of their headline features, snapshots. But there is a second feature of those filesystems that matters even more for long-lived data: checksumming.

A plain filesystem does not verify contents. If a disk quietly flips a bit in a photo from 1998, ext4 will happily keep serving the corrupted bytes, and my backup jobs will faithfully replicate the damage until no clean copy is left. Bit rot is exactly the failure mode a decades-old archive needs to worry about, and it is invisible right up to the moment I open the file.

Git closes that gap almost as a side effect of content addressing. Every object is identified by a hash of its own contents, so the identity doubles as a checksum. `git fsck` can walk the complete object database and verify every single object against its name, on any filesystem, on any operating system. And since replicas share the same object model, comparing two repositories is also a verification: if the objects match, the bytes match.

So Git effectively upgrades a dumb filesystem with the two properties I wanted from ZFS, snapshots and integrity, without forcing a filesystem or operating system choice first. For an archive that is supposed to survive decades, being able to ask "is my data still intact?" and getting a trustworthy answer is not a small feature.

## Replication

This is where Git becomes significantly more interesting than just putting files onto a filesystem. A filesystem gives me persistent storage on one machine, Git gives me a mechanism to move that state between machines. Replication is not some separate subsystem bolted onto Git, it is one of the things Git fundamentally does.

I can have a repository on machine A, clone it to machine B and push it to machine C. Every machine can hold a complete independent copy, including history, and the storage model does not depend on whether those machines run Linux, macOS or something else.

This does not mean Git replaces backups. If every copy gets deleted, I still lose the data, and if I deliberately rewrite history and propagate that everywhere, Git cannot protect me from every possible mistake. But it does change the backup problem. Instead of backing up an application, its SQL database, an object store and a collection of configuration directories, I can back up a repository that already contains its own history. The thing I am backing up was designed to be copied.

That makes backup and disaster recovery considerably more boring. And boring is exactly what I want from backups.

## Protocols become adapters

This is where the idea became most interesting to me. Applications still need specialized protocols, that requirement does not disappear. An email client will not suddenly start speaking Git instead of IMAP, Docker will not pull a container by cloning a repository, and a calendar client expects something like CalDAV.

But the application implementing that protocol does not necessarily need to own the persistence model as well. The protocol can become an adapter on top of the storage. An IMAP server can expose mail that happens to live in a Git repository. An SMTP server can receive a message and convert it into repository state. A photo server can expose photos through HTTP while the originals are stored as Git blobs. A registry can implement the OCI protocol while manifests and layers live in Git.

Conceptually, the architecture starts looking more like this:

```text
 SMTP / IMAP          HTTP            OCI
      |                 |              |
      v                 v              v
 Mail Server      Photo Server     Registry
      |                 |              |
      v                 v              v
+-------------------------------------------+
|               Git repository              |
|    (files, history, content addressing)   |
+-------------------------------------------+
                      |
                 push / pull
                      |
                      v
          replicas on other machines
```

The protocol implementation interprets the data. Git owns persistence, history and replication. That is quite different from the usual model where every application builds its own independent storage universe.

On the implementation side this does not mean that every service shells out to the `git` binary and juggles a working tree somewhere. An application can use one of the Git libraries (libgit2, gitoxide and friends) and interact with the repository directly: read blobs, build trees, create commits, move references. Seen this way, Git stops being a tool that runs on top of my files and becomes an embeddable storage engine, and the application gets direct access to the whole Git feature set as an API.

## Interoperability as a side effect

There is another consequence that I initially did not consider particularly important. Once the application's durable state is stored in a generic format, I become less dependent on the application itself. If the photo server stops working, my photos still exist as files and Git objects. If the mail server has a bug, my mail archive does not suddenly become inaccessible because only one particular application version understands some database schema.

I can clone the repository. I can inspect the files. I can use normal Git tools, write a Python script against the data, or build a completely different server on top of exactly the same repository.

That matters a lot for self-hosting. I am not primarily interested in whether a particular application survives for another six months, I am interested in whether I can still access the information in ten or twenty years. Applications come and go, data should survive them. A directory containing known file formats inside a Git repository is a fairly conservative way of storing information, and in this case conservative is a compliment.

## But Git is not a database

At this point there is an obvious counterargument: why not just use a database? For many workloads the answer is simple: use a database. Git would be a terrible replacement when I need to continuously update thousands of small records, perform arbitrary queries, maintain indexes or coordinate hundreds of concurrent writers. It would also be a bad fit for queues, caches and high-frequency telemetry. If I am writing ten thousand metrics per second, I definitely do not want ten thousand Git commits.

The idea is not that Git should replace PostgreSQL or Redis. The interesting question is how much of the information we put into those systems actually requires database semantics. A photo changes very rarely. An email, once received, ideally never changes at all. A container image is immutable by definition. A calendar event changes occasionally. Those workloads look very different from transactional application data.

For information like this, a system built around immutable objects, snapshots and replication starts to look much less unreasonable. The same properties that make Git a poor transactional database can make it a very attractive archive. I do not want my photo from 1998 to be updated in place, I want the original object to remain the original object forever.

## Multiple writers

One area where things become more complicated is multiple writers. Git was designed around distributed modification, but not in the same way as a database. Two users can independently modify a repository and Git can represent both histories. For source code we normally solve that through merging, for arbitrary data the correct behavior depends on the application.

If two users upload different photos, there may be no conflict at all, both objects can simply exist. If two people edit the same calendar event independently, however, the application needs to decide what those changes mean. Git can tell me that the histories diverged, it cannot tell me which meeting time is correct. That responsibility still belongs to the protocol layer.

But I actually like this separation. The storage system can preserve the conflicting states instead of immediately destroying one of them, and the application then has enough information to make a domain-specific decision. Git gives me history, it does not need to understand calendars.

And to put the whole problem into perspective: since I am talking about self-hosting here, most of these applications run as a single instance anyway. There is one mail server, one photo server, one registry, and each of them is the only writer to its repository. Divergent histories then mostly show up in replication and recovery scenarios, not in daily operation, which makes the potential merge work far less relevant than it sounds.

## Git does not forget

There is a flip side to all this immutability: Git does not forget. Most of the time the strong guarantee is exactly the point, nobody should be able to silently rewrite my photo archive. But an honest look at storage has to include the opposite case too, because sometimes data should really be gone: files I am not allowed to keep forever, or simply something that never should have been committed in the first place.

With immutable history, real deletion means rewriting history, and rewritten history invalidates every replica. The same property that makes replication so easy makes forgetting expensive.

The way I deal with this is retention as an explicit opt-in. By default a repository keeps everything, and that default should stay. But for datasets where forgetting is a requirement, the history can be truncated at a defined boundary, for example everything older than 365 days.

It is worth spelling out what such a truncation actually removes, because "delete everything older than a year" sounds much more dangerous than it is. Retention works on history, not on data. The current state of the repository, meaning the newest revision of every file that still exists, is always referenced by the latest commit and therefore never touched. A photo I uploaded ten years ago and never changed survives a 365-day retention without any problem, because it is still part of the current state.

What actually disappears are the things only the old history knows about: files that were deleted at some point, and outdated revisions of files that were changed later. Once the history before the boundary is truncated, those objects are no longer referenced by any remaining commit, they become loose objects and the normal Git garbage collection removes them for good. Inside the retention window the full guarantee still holds, files can be restored and changes can be undone. Beyond it, deleted really starts meaning deleted.

The important part for me is that this stays a deliberate decision per dataset, not a general behavior. Photos and mail archives should keep their full history forever. Deletion is the exception, and I want it to look like an exception.

## Derived data does not need the same treatment

Not everything an application produces is equally valuable. A photo server is a good example: the original photo is important, a generated thumbnail usually is not. If the thumbnail disappears, I can regenerate it. The same applies to search indexes, temporary caches, previews and other derived information.

This leads to a distinction I find very useful:

```text
source data  -> Git
derived data -> cache
```

That does not mean I can never use Redis, SQLite or another database. It means those components no longer necessarily contain the authoritative copy of my information. If a search index disappears, rebuild it. If a cache disappears, rebuild it. If a thumbnail directory disappears, rebuild it.

This substantially changes how much infrastructure I need to treat as critical. Losing a cache is annoying, losing thirty years of photos is something entirely different. Applications often mix those two categories into the same persistence stack, I would rather make the distinction explicit.

## So, is Git universal storage?

Probably not, at least not in an absolute sense. There are plenty of workloads where Git as a primary storage system would be awkward, inefficient or completely absurd. But that is not really what I mean by universal. A filesystem is universal even though nobody would claim that ext4 is the ideal database engine. It is universal because it is a sufficiently generic primitive that many different kinds of applications can build on top of it.

Git adds a surprisingly useful collection of properties to that primitive:

- immutable objects
- history
- snapshots through commits
- content addressing
- integrity through checksums
- replication
- offline copies
- a mature ecosystem
- a format understood on almost every platform

That is a lot of functionality for one relatively small building block.

I am exploring this direction myself in [Everlock](https://everlock.sh), where the individual services implement the protocols the outside world expects while Git carries the durable state underneath. But the idea is not tied to any particular project. Any application could make the same decision, and the data it writes would outlive the application itself. If the software disappears tomorrow, the repository is still Git.

And perhaps the biggest advantage is not technical at all. I already have Git. I already know how to inspect it, how to copy it, how to recover repositories and how to debug it when something goes wrong. Twenty years from now, there is a reasonably good chance that somebody will still know how to open a Git repository. For self-hosting, where the person running the application and the person responsible for preserving the data are often the same person, that simplicity has a value of its own.

Git is not a universal database. But I increasingly think it can be a surprisingly good universal storage primitive.

If this topic resonates with you, or you are building something in a similar direction and want to exchange ideas or collaborate, feel free to drop me a line at [me@jens.dev](mailto:me@jens.dev).
