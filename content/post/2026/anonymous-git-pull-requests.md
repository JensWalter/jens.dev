---
title: "Anonymous Git pull requests"
date: 2026-09-20
description: "Some thoughts on why contributing to an open source project requires an account, and how Git itself could carry pull requests without one."
tags:
- git
- conceptual
- everlock
---
## A distributed system, used authoritatively

After writing about [Git as universal storage](/2026/09/11/git-as-universal-storage.html), there is a question from the same line of thinking that kept coming back to me, and it is not a storage question but a collaboration question: why does contributing to an open source project require an account?

To get there, I have to start with an observation. Git is a fully distributed system, every clone is a complete copy, every machine is equal, and nothing in the protocol needs a center. But that is not how we use it. In practice, every project designates one authoritative repository, the origin everybody pulls from and the place where the real history lives. That in itself is fine and probably unavoidable, even the kernel works this way, somebody's tree is the tree.

The problem is what gathered around that authoritative copy. Today it usually lives on a hosting platform, GitHub, GitLab, Codeberg, and the platform holds much more than the repository. Pull requests, issues, reviews, workflow state, all of that lives outside the Git universe, in the database of the hosting service. The repository itself I can clone, fork and mirror anywhere. The collaboration around it I cannot, because it is an artifact of the platform, not of the repository.

## Central artifacts, central identity

This has a direct consequence. Since those artifacts live in a platform database, writing to them needs a platform account, and that makes any decentral version of collaboration rather complex: for every decentrally hosted repository, every potential contributor first has to register a new account on that particular instance.

This friction feeds a loop. If contributing anywhere else costs an account ceremony, everybody naturally converges on the one place where they already have an account, and every project that wants contributions follows them there. Which is how a fully distributed version control system ended up producing one of the most centralized ecosystems we have. The barrier was never removed, it was just prepaid on one platform, and the moment you move away, the full price becomes visible again.

The account itself was also never a Git concept. Git has no accounts, it has claimed author strings inside commits. The account exists for the platform: notifications, spam control, the social graph, terms of service. Those are real needs, but they are platform needs, not collaboration needs.

There are exceptions, the Linux kernel being the most prominent one. Kernel development never moved onto a forge, patches travel by email, and no account is involved anywhere. But the exceptions are rare, and their workflows have a reputation for scaring newcomers away.

## What about federation?

There is a serious attempt at fixing the identity problem through federation. ForgeFed, an extension of ActivityPub, describes how forges could exchange collaboration artifacts across instances, and Forgejo has had federation on its roadmap from the start: identities, stars, issues and eventually pull requests flowing between independent servers, the Mastodon model applied to code hosting. I genuinely like the concept, and if it existed, large parts of this post would be unnecessary.

But this development has been basically stalled for years. The ForgeFed specification has been in draft state since 2019, and what has actually shipped so far are small fragments, nothing close to a federated pull request. I do not say this to bash the projects, federation is genuinely hard and the people working on it do so with very limited resources. But as somebody who has to decide today how to accept contributions on self-hosted repositories, it is not something to hope for or wait on.

And even in the best case, federation solves a slightly different problem than the one I am after: it makes accounts portable between instances, but the artifacts still live in platform databases, they are just synchronized ones. Somebody still has to have an account somewhere.

## The signup wall

For self-hosting, this is not an academic problem. The moment you move your projects away from the big platforms, you feel it immediately. On GitHub, a stranger fixes your typo in thirty seconds, because they already have an account, they are already logged in, and the fork button is right there. On a self-hosted forge, that same stranger looks at your repository, sees a signup form, and leaves.

And honestly, I understand them, I do the same. I am not creating an account on somebody's private Forgejo instance to fix a typo in their README. The fix costs me thirty seconds, the account ceremony costs me five minutes and one more identity to remember, on an instance I will probably never visit again.

There is also a strange asymmetry hiding in here. Reading is anonymous, anybody can clone a public repository without telling anyone who they are. But the moment somebody wants to give something back, we demand a full identity ceremony. The direction we should make easy is exactly the direction we make hard.

And for open source and self-hosting, I think collaboration carries a higher goal than convenience. Every bit of friction we remove decides whether somebody adopts self-hosting at all, and whether a patch gets sent or silently dropped. Right now, the contribution funnel of most self-hosted projects dies at the signup form. Not at the code, not at the review, at the signup form.

## Git is not the problem

Coming from this problem space, my conclusion is that Git itself is not the problem here, it is the solution. The distribution part is already solved: clone, push, pull, replicate, all without a central instance and all without an account. What Git does not carry is semantics. It knows objects, trees, commits and refs, but it has no concept of an issue, no concept of a workflow, and not even a concept of a pull request. Those meanings were invented by the platforms, and that is exactly why they ended up in platform databases.

That is why I started looking into whether at least some of those semantics could be expressed inside Git itself, and whether it would even be helpful to do so. Pull requests seemed like the right place to start, because they are the smallest of those artifacts, and the closest to what Git already does.

## What a pull request actually is

To think about this, it helps to strip the pull request down to its core. Underneath all the platform features, a pull request is one sentence: here is a commit, please consider merging it into that branch. That is the whole payload. Everything else, the comment threads, the CI checks, the labels, the review state, the little green button, is tooling that platforms built around that sentence.

And Git could always express that sentence without a platform. The kernel workflow I mentioned above is exactly that, and `git request-pull`, the command the term "pull request" actually comes from, produces a plain text message. No account is involved anywhere in that flow. Identity is a name and an email address written into the commit, and trust comes from review, not from a login.

So the interesting part is not that pull requests without accounts are possible, we know they are, email proved it. The interesting part is that we collectively forgot this the moment collaboration moved onto platforms.

## The mailbox detour

So my first instinct was to steal the email model directly. Email has exactly the trust shape this problem needs: anybody can deliver a message to my server without having an account on it, the message lands in a mailbox, and I decide what happens with it. Anyone can send, only I decide what enters. Applied to code, that would be some form of patch inbox next to the repository, a place where strangers drop proposals and I triage them.

I discarded that model, and the reason is not the technology, it is the people. Email is one of the most established protocols we have, but sending patches through email is something almost nobody expects anymore, and most people, me included, are simply not used to it. The kernel community makes it work because they have been doing it for decades, but for the rest of the world, `git format-patch` and patch files in mail clients are a foreign workflow.

There is also a more fundamental awkwardness in it. I already have a Git repository on both ends, so why would the transport in the middle be email? Git brings its own transfer protocol, push and pull exist, and routing a change through a second protocol means leaving the Git world, converting the change into text, mailing it, and converting it back on the other side. Email is good for identity, every message carries a sender, but as a transport for commits it is a break in the middle of an otherwise closed workflow. And since the whole point of this exercise is reducing friction, a workflow break in the middle is not the way forward.

But the trust shape of email is right, and it is worth keeping: anyone may deliver, only the receiver decides what enters. The rest of this post is essentially that shape, rebuilt inside Git itself.

## Forks do not decentralize

The next thing to get out of the way is the fork, because on the platforms the fork looks like the answer to where a stranger's work lives. A stranger cannot push into my repository, so they push into their own copy, and the platform connects the two.

But fork semantics are something a central platform came up with, and they only work because both copies live in the same database. The platform knows the fork belongs to my repository, it can list the fork's branches next to mine, and the pull request is just a row connecting the two. Decentrally, none of that exists. If a stranger clones my repository onto their machine or their own server, that is simply another repository somewhere in the world. I cannot see it, I cannot reach it, and most likely it sits behind NAT or is offline half the day. A fork that the source origin cannot access is not a contribution mechanism, it is just a copy.

Turn it around and the requirement becomes clear: if I, the maintainer, should ever see the proposed commits, they have to be stored somewhere I can reach. And the one place that is guaranteed to be reachable from my repository is my repository. Which leads to the uncomfortable conclusion: the origin itself has to accept writes from strangers.

I know how that sounds. Anonymous write access to a repository is a huge attack surface, and I am not pretending otherwise. But I think it can be managed, through the protocol, through one strict ref rule, and through garbage collection. So let me build it up one step at a time.

## Objects first, refs second

The first step is the upload itself, and it is less dramatic than it sounds. In Git terms, uploading is just placing objects on a remote machine. Objects on their own do nothing. They are not part of any branch, no checkout ever sees them, nothing executes them. An object that no ref points to is invisible dead weight, and the next garbage collection run deletes it. If a stranger uploads objects and nothing more happens, the repository cleans itself up. No harm, no foul.

That changes the shape of the problem. The dangerous act is not uploading data, the dangerous act is making data stick. And in Git, sticking has exactly one mechanism: a ref has to point at it.

So this is where the actual rule lives. An anonymous writer, and anonymous here simply means an origin I have not verified, must not set arbitrary refs. They must not touch branches, they must not touch tags, they must not invent creative new namespaces. They get exactly one ref shape, and that shape encodes everything I need to know about their intent: which commit they propose, and which branch they propose it for. That constrained ref is the entire pull request. And as a side effect, the ref does double duty: it pins the uploaded objects, so the proposal survives garbage collection for exactly as long as it stays open.

The only thing genuinely missing at this point is a description, some text explaining why the change exists. That is metadata, and metadata is an open point altogether, I will come back to it.

## A pull request is just a ref

So the whole design condenses into one ref namespace:

```text
refs/heads/main            protected, writers only
refs/tags/v1.0             protected, writers only
refs/pull/typo-fix/main    open for proposals
```

A pull request becomes a ref like `refs/pull/{slug}/{target}`. The ref existing means the proposal is open. The commit it points at is the proposed state. The last segment names the target branch. Updating the proposal means pushing a new commit to the same ref, closing it means deleting the ref, and whether it merges cleanly can be computed on the fly from the two commits involved.

What I like about this shape is that it needs no metadata store. No database with a pull_requests table, no JSON files next to the repository, nothing. The repository carries its own proposals, and since everything is just refs and objects, a clone or a replica carries them too. This is the same instinct as in the storage post: instead of building a service next to Git, use what Git already has.

It is also worth noticing how little of this is actually new. A branch is not a Git feature in any deep sense, it is a convention: `refs/heads/` means branch because we all agreed it does. `refs/tags/` is a convention, git notes live in `refs/notes/`, the stash is a ref. Git itself only knows names pointing at objects, and all meaning on top is layered by agreement. So a proposal namespace does not extend Git, it uses Git exactly the way branches already do.

The namespace is not even hypothetical. Gerrit has been running code review through magic refs like `refs/for/main` for well over a decade, at Android scale. GitHub itself exposes every pull request as a read-only ref under `refs/pull/`. The idea is already deployed on every major forge. The only thing missing is the permission to write to it without an account.

The server side stays small: validate the ref shape, check that the target branch exists, check that the pushed commit actually arrived, refuse to overwrite somebody else's open proposal. That is not a collaboration platform, that is a handful of rules.

## The security question

I promised that the attack surface can be managed, so let me be precise about the architecture. The system ends up with two classes of writers. Authenticated users, the maintainers, can do everything they always could: create branches, delete branches, tag releases, merge. Unverified writers are bound to the proposal semantics and nothing else. They can create a ref under `refs/pull/`, update it, and delete it. That is the complete list.

Every ref update in a push is authorized on its own, so a push that also touches `refs/heads/main` gets exactly that update refused, even if the same push legally creates a proposal ref. Branches and tags, the things that define what the project actually is, stay writable only for maintainers.

And the merge is a separate act. A merge writes the target branch, so it stays with the people who may write branches. An anonymous proposal becoming part of `main` requires a maintainer to look at it and decide, which is exactly the same trust model as today. Nobody merges a stranger's GitHub PR because the stranger has an account, we merge it because we read the diff.

That is the point I keep arriving at: the review is the security boundary, not the login. A GitHub account created five minutes ago tells me precisely as much about a stranger as no account at all.

## Abuse

The honest problem is not security, it is abuse. If anybody can push proposals, somebody will push garbage: spam proposals, huge objects to fill my disk, maybe attempts to park unrelated data in my repository.

I do not think this problem disappears, but I think it stays boring, because the blast radius is one namespace. The same mechanism that made naked uploads harmless works in reverse here: delete a proposal ref, and the objects it pinned lose their protection and fall back to the garbage collector. Cleaning up after an abusive contributor means deleting refs and running gc, not restoring from backup. On top of that, the usual mechanical limits apply: a maximum push size, rate limits per source, a cap on open proposals.

Email patches had exactly the same problem, it was called spam, and mailing lists survived it with moderation and filters. Anonymous proposals need the equivalent, a moderation view rather than an open door directly into the project. That is work, but it is bounded work.

## Identity without accounts

Anonymous is also a slightly misleading word here, because anonymous does not mean unattributable. Every commit already carries an author name and email, which is a claim of identity. And if a claim is not enough, Git has signed commits: a GPG or SSH signature turns the claim into something verifiable. A maintainer can require signatures on proposals without requiring signup anywhere.

I find this model more honest than platform identity. The signing key belongs to the contributor, not to a platform, and the reputation attached to it travels with them across every repository they ever contribute to.

## The feedback loop

There is one part of the platform experience I have not replaced yet, and I want to be upfront that this is full of open points: the feedback loop. On a platform, the contributor gets notified, their PR turns purple, everybody knows what happened. Without accounts there is nobody to notify.

What Git gives me instead is observable state. The fate of a proposal can be read by anyone who fetches: the ref is gone and the commit is reachable from the target branch, merged. The ref is gone and the commit is not, declined. That is crude, but it is honest, and it needs no infrastructure at all.

The commit log can carry more than that. A merge commit records what was merged, when, and by whom, and the merged commits keep their original author lines. So the history itself becomes the record of who did what, even when the who was never authenticated. It is a claim rather than a verified identity, but the signatures from the previous section could close that gap: a contributor who signs their commits can later prove that this merged work was theirs, without ever having registered anywhere. I find that direction interesting, reputation attached to the work itself instead of to a profile page.

And for actual conversation, the commit already carries the author's email address, a built-in return channel. If I have questions about a proposal, the contact is part of the data. This is thin compared to threaded review comments, and I will not pretend it scales to large features. But it might be enough for the class of contributions this whole idea is aimed at.

## The metadata gap

That leaves the biggest hole, and I want to name it clearly instead of hiding it: metadata is not solved. A proposal in this model is a commit and a target, nothing more. There is no description explaining the why, no comment thread, no review state, no labels. On the platforms, all of that is the actual product, and none of it falls naturally out of a ref pointing at a commit.

I have ideas, of course. Description files inside the proposed commit, conventions inside the commit message. But every one of them has drawbacks I am not happy with yet, and I do not want to pretend this part is finished thinking. If the proposal mechanics are the solid ground of this idea, the metadata question is the open construction site next to it, and collaboration on this one is very welcome.

What keeps me relaxed about the gap is looking at what actually gets lost. The contributions that the signup wall kills are not large features with three rounds of review. They are typo fixes, one-line corrections, a broken link, a small documentation improvement, contributions where the whole conversation is "thanks, merged". For those, a commit message is honestly enough metadata. The big features can keep their accounts and their review tooling, the small end just needs the door unlocked.

## So, do we need the account?

For running a platform, yes. For accepting a contribution, I increasingly think no. The trust decision about a change was never made at signup time, it is made at merge time, by a person reading a diff, and that does not change one bit in this model.

I am exploring this direction in [Everlock](https://everlock.sh), where anonymous is not a special mode but simply a user like any other, and access can be granted to just the pull request namespace while branches stay closed. But as with the storage question, the idea is not tied to one implementation. Any forge, any Git server could make the same decision tomorrow, the protocol already allows it.

Git never asked anybody for a login. Maybe our forges do not have to either.

If you have thoughts on this, or you are experimenting in a similar direction and want to exchange ideas, feel free to drop me a line at [me@jens.dev](mailto:me@jens.dev).
