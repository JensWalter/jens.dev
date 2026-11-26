---
marp: true
theme: default
paginate: true
size: 16:9
title: "Everlock: Everything Is Git, Protocols Are Just Adapters"
footer: "Everlock · Rust Leipzig · 17 Nov 2026"
style: |
  /* Palette, fonts and surfaces follow everlock/website/assets/style.css */
  :root {
    --paper: #f6f0e3;
    --paper-strong: #fffaf1;
    --ink: #1f1a17;
    --muted: #6d6259;
    --line: #d7cbb8;
    --accent: #a64024;
    --accent-soft: #ead2c7;
    --serif: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    --sans: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    --mono: SFMono-Regular, Menlo, Consolas, Monaco, monospace;
    --mark: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect width='96' height='96' rx='24' fill='%23f7efe1'/><path d='M23 42c0-14.4 11.6-26 26-26s26 11.6 26 26v9h-9v-9c0-9.4-7.6-17-17-17S32 32.6 32 42v9h-9z' fill='%23a64024'/><rect x='18' y='43' width='60' height='38' rx='10' fill='%231f1a17'/><path d='M48 53a8 8 0 0 1 5 14.2V75h-10v-7.8A8 8 0 0 1 48 53z' fill='%23f6f0e3'/></svg>");
  }
  section {
    font-family: var(--sans);
    color: var(--ink);
    font-size: 26px;
    line-height: 1.5;
    padding: 56px 72px;
    background:
      radial-gradient(circle at top left, rgba(166, 64, 36, 0.14), transparent 480px),
      radial-gradient(circle at bottom right, rgba(83, 101, 86, 0.12), transparent 420px),
      linear-gradient(180deg, rgba(246, 240, 227, 0) 0%, rgba(246, 240, 227, 0.85) 92%),
      linear-gradient(rgba(121, 89, 56, 0.06) 1px, transparent 1px) 0 0 / 28px 28px,
      linear-gradient(90deg, rgba(121, 89, 56, 0.06) 1px, transparent 1px) 0 0 / 28px 28px,
      linear-gradient(180deg, #efe5d4 0%, var(--paper) 40%, #efe8da 100%);
  }
  h1, h2, h3 { font-family: var(--serif); color: var(--ink); font-weight: 700; }
  h1 { font-size: 1.9em; }
  h2 { font-size: 1.45em; margin-bottom: 0.45em; }
  strong { color: var(--accent); }
  a { color: var(--accent); }
  code { font-family: var(--mono); font-size: 0.85em; }
  :not(pre) > code {
    padding: 0.08em 0.36em;
    background: rgba(109, 98, 89, 0.09);
    color: var(--ink);
    border-radius: 6px;
  }
  pre {
    font-size: 0.68em;
    line-height: 1.4;
    padding: 0.9em 1.1em;
    background: #201c19;
    color: #f7f0e5;
    border-radius: 14px;
    border: 0;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 18px 40px rgba(69, 44, 22, 0.08);
  }
  pre code { background: transparent; color: #f7f0e5; padding: 0; }
  pre code.language-text { display: block; line-height: 1.18; }
  section pre .hljs-keyword,
  section pre .hljs-selector-tag { color: #f0a07e; }
  section pre .hljs-type,
  section pre .hljs-built_in,
  section pre .hljs-title.class_ { color: #e6c88f; }
  section pre .hljs-title,
  section pre .hljs-title.function_ { color: #f2d3ad; }
  section pre .hljs-string { color: #b8c99a; }
  section pre .hljs-number,
  section pre .hljs-literal,
  section pre .hljs-symbol { color: #e0b07a; }
  section pre .hljs-comment,
  section pre .hljs-doctag { color: #9c8f82; font-style: italic; }
  section pre .hljs-meta,
  section pre .hljs-attr,
  section pre .hljs-property { color: #d9c3a5; }
  section pre .hljs-addition { color: #c6d6a6; background: rgba(184, 201, 154, 0.14); }
  section pre .hljs-deletion { color: #f0a07e; background: rgba(240, 160, 126, 0.14); }
  section pre .hljs-variable,
  section pre .hljs-params,
  section pre .hljs-operator,
  section pre .hljs-punctuation { color: #f7f0e5; }
  table { font-size: 0.78em; border-collapse: collapse; background: transparent; }
  table th, table td {
    background: transparent;
    border: 0;
    border-bottom: 1px solid var(--line);
    padding: 0.42em 0.9em;
  }
  table tr { background: transparent !important; }
  table th { font-family: var(--serif); text-align: left; border-bottom: 2px solid var(--line); }
  blockquote {
    border-left: 4px solid var(--accent);
    color: var(--ink);
    font-family: var(--serif);
    font-size: 1.15em;
    font-style: italic;
    padding-left: 0.9em;
    margin: 0.6em 0;
  }
  ul li::marker { color: var(--accent); }
  footer {
    color: var(--muted);
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  footer::before {
    content: "";
    width: 20px;
    height: 20px;
    background: var(--mark) center / contain no-repeat;
  }
  section::after { color: var(--muted); font-size: 14px; }
  .eyebrow {
    font-size: 0.6em;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.9em;
  }
  section.lead { align-items: center; text-align: center; }
  section.lead::before {
    content: "";
    flex-shrink: 0;
    width: 96px;
    height: 96px;
    margin: 0 auto 36px;
    border-radius: 24px;
    background: var(--mark) center / contain no-repeat;
    box-shadow: 0 12px 40px rgba(166, 64, 36, 0.22);
  }
  section.lead h1 { font-size: 2.5em; line-height: 1.06; margin: 0 0 0.45em; }
  section.lead p { color: var(--muted); }
  .pill {
    display: inline-block;
    padding: 0.45em 1.4em;
    background: var(--accent);
    color: #fff;
    border-radius: 999px;
    font-weight: 600;
    box-shadow: 0 4px 18px rgba(166, 64, 36, 0.35);
  }
  section.big { font-size: 36px; }
  section.big h2 { font-size: 1.35em; margin-bottom: 0.6em; }
  section.big pre { font-size: 0.75em; }
  section.big li { margin: 0.15em 0; }
  section.statement { align-items: center; text-align: center; }
  section.statement h1 { font-size: 2.6em; margin-bottom: 0.3em; }
  section.statement p { font-size: 1.2em; color: var(--muted); }
  .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
  .card {
    padding: 18px 22px;
    background: rgba(255, 250, 241, 0.78);
    border: 1px solid rgba(127, 106, 84, 0.18);
    border-radius: 18px;
    box-shadow: 0 6px 18px rgba(69, 44, 22, 0.05);
    font-size: 0.72em;
    line-height: 1.4;
    color: var(--muted);
  }
  .card .cat {
    display: block;
    font-size: 0.72em;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .card b {
    display: block;
    margin: 0.2em 0 0.3em;
    font-family: var(--serif);
    font-size: 1.2em;
    color: var(--ink);
  }
  .nw { white-space: nowrap; }
  .group {
    margin: 0.5em 0 -0.4em;
    font-size: 0.55em;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .group:first-child { margin-top: 0; }
  .stack { display: flex; flex-direction: column; gap: 14px; margin-top: 0.8em; }
  .layer {
    padding: 18px 24px;
    border-radius: 16px;
    text-align: center;
    font-size: 0.85em;
  }
  .layer.apps {
    background: rgba(255, 250, 241, 0.78);
    border: 1px solid rgba(127, 106, 84, 0.18);
    box-shadow: 0 6px 18px rgba(69, 44, 22, 0.05);
    color: var(--muted);
  }
  .layer.gap {
    padding: 30px 24px;
    border: 2px dashed var(--accent);
    color: var(--accent);
    font-weight: 600;
  }
  .tier {
    display: grid;
    grid-template-columns: 210px 1fr;
    align-items: center;
    gap: 20px;
    padding: 16px 24px;
    border-radius: 16px;
  }
  .tier b { display: block; font-family: var(--serif); font-size: 0.95em; }
  .tier small { display: block; font-size: 0.6em; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.75; }
  .tier.fe { background: rgba(166, 64, 36, 0.16); }
  .tier.be { background: rgba(166, 64, 36, 0.08); }
  .tier.fe b, .tier.be b { color: var(--accent); }
  .tier.base { background: #201c19; color: #f7f0e5; }
  .chip {
    display: inline-block;
    margin: 3px 6px 3px 0;
    padding: 2px 13px;
    border-radius: 999px;
    font-size: 0.66em;
    background: rgba(255, 250, 241, 0.85);
    border: 1px solid rgba(127, 106, 84, 0.2);
    color: var(--ink);
  }
  .chip.client {
    background: var(--paper-strong);
    border-color: rgba(166, 64, 36, 0.35);
    box-shadow: 0 3px 10px rgba(69, 44, 22, 0.06);
  }
  .bubbles { display: flex; flex-wrap: wrap; justify-content: center; padding: 6px 0; }
  .bubbles .chip { font-size: 0.8em; padding: 4px 16px; }
  .clients {
    display: grid;
    grid-template-columns: 210px 1fr;
    align-items: center;
    gap: 20px;
    margin-top: 0.5em;
    padding: 0 40px;
  }
  .clients small {
    font-size: 0.6em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .stack.everlock {
    position: relative;
    gap: 10px;
    margin-top: 22px;
    padding: 24px 14px 14px;
    border: 2px solid rgba(166, 64, 36, 0.3);
    border-radius: 22px;
  }
  .stack.everlock::before {
    content: "Everlock";
    position: absolute;
    top: -12px;
    left: 26px;
    padding: 0 10px;
    background: var(--paper);
    font-size: 0.55em;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .stack.everlock .tier { padding: 13px 24px; }
  .tier.base .chip { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.14); color: #f7f0e5; }
  .layer.git {
    background: #201c19;
    color: #f7f0e5;
    font-family: var(--serif);
    font-weight: 700;
  }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .small { font-size: 0.75em; color: var(--muted); }
---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: "" -->

<div class="eyebrow">Rust Leipzig · 17 Nov 2026 · Basislager Coworking</div>

# Everything Is Git,<br>Protocols Are Just Adapters

Jens Walter · **everlock.sh**

---

<!-- _class: big -->

## What is Git?

> A source code versioning system.

**…right?**

<!--
Ask the room. Everyone says: source code versioning.
Where our code lives; branch, merge, review; every clone has the full history.
Linus Torvalds, 2005, for the Linux kernel.
But what does Git actually know about code?
-->

---

<!-- _class: big -->

## Actually: a text versioning system

```diff
-Talk: Everlock (30 min)
+Talk: Everlock (45 min)
```

Code is just **one kind of text**.

<!--
Git knows nothing about code. It versions files; diff, merge, blame, log -p
all work on lines of text. Binary files are stored too, but without
meaningful diffs or merges (comes back later: big blobs).
-->

---

<!-- _class: big -->

## So Git stores more than code

- Notes
- Issues / bugs
- Pull requests
- Wiki / docs
- Websites

<!--
Notes: Markdown vaults synced with Git, built-in `git notes`.
Issues: git-bug stores issues as Git objects next to the code.
Pull requests: GitHub refs/pull/<n>/head, Gerrit review data in NoteDb.
Wiki/docs: GitHub and GitLab wikis are Git repos; docs-as-code.
Websites: GitHub Pages, static site generators, push to deploy.
How do they do it? Refs.
-->

---

<!-- _class: big -->

## Refs

A ref is a **name that points to a commit**.

Branches, tags and pull requests are all refs, and **moving one** records a change.

<style scoped>pre { font-size: 0.6em; }</style>

```sh
refs/heads/main             → b9a2832   # branch
refs/tags/v0.13.1           → 55355cb   # tag
refs/notes/commits          → 3c1f0e9   # git notes
refs/changes/34/1234/2      → 8d7a6b1   # Gerrit: patch set 2 of change 1234
refs/changes/34/1234/meta   → e41c9a2   # Gerrit: review comments + votes
```

<!--
A ref is a file (or packed-refs line) holding a commit id; HEAD points at a ref.
Commit = move refs/heads/<branch>; tag = create refs/tags/<name>;
GitHub PRs = refs/pull/<n>/head. Ref updates are atomic (lock + rename).
Everlock: a pull request is refs/pull/{slug}/{target}; open = ref exists,
closed/merged = ref deleted. No separate metadata store.
git notes: the notes live in their own commit history under refs/notes/commits,
mapping commit ids to note text.
Gerrit: refs/changes/<last 2 digits>/<change>/<patch set>; NoteDb keeps the
review itself (comments, votes, status) as commits under .../meta.
The main and v0.13.1 hashes are real (everlock repo); the others are illustrative.
-->

---

<!-- _class: statement -->

# Why stop there?

Code, notes, issues, reviews, websites… **what else?**

<!--
If it's text, people have put it in Git. Turns out: a lot more.
-->

---

## An ecosystem of Git-backed apps

<div class="grid">
<div class="card"><span class="cat">Chat</span><b>Glitr</b>Your own repo is the encrypted mailbox</div>
<div class="card"><span class="cat">Calendars</span><b>Xandikos</b>One repo per calendar, one file per event</div>
<div class="card"><span class="cat">Wiki</span><b>Gollum · Hold My Docs</b>Every edit is a commit</div>
<div class="card"><span class="cat">Databases</span><b>inGitDB · nano-git-db</b>Records are files: branch and merge your data</div>
<div class="card"><span class="cat">Websites</span><b>GitHub · GitLab · Codeberg Pages</b>A push publishes the site</div>
<div class="card"><span class="cat">AI agents</span><b>Entire</b>Session checkpoints on a side branch</div>
</div>

<!--
Glitr (glitr.io): E2E-encrypted P2P messenger; a repo you own is the mailbox,
WebRTC/Tor when both online, Git as fallback.
Xandikos (xandikos.org): CalDAV/CardDAV; each calendar/address book a repo,
each event/contact a file, every change a commit.
Gollum: the repo is the wiki database. Hold My Docs (hmd.sool.dev): Markdown
wiki with MCP access; AI edits are commits too.
inGitDB (ingitdb.com): schema-validated YAML/JSON records; branch, merge,
revert, bisect on data. nano-git-db: append-only text, Git's text merge
combines concurrent edits field by field.
Pages: Codeberg serves a `pages` branch; GitLab builds `public/` in CI;
GitHub from a branch or an Actions build.
Entire (entire.io): records AI agent sessions; checkpoints on
`entire/checkpoints/v1` next to the code.
-->

---

## Going deeper: refs as the database

<div class="grid">
<div class="card"><span class="cat">Issues</span><b><span class="nw">git-bug</span> · <span class="nw">git-native-issue</span> · <span class="nw">git-dit</span></b>Issues and comments as commits in their own refs</div>
<div class="card"><span class="cat">Agent tasks</span><b>grite</b>Event log in <code>refs/grite/wal</code>, merged via CRDTs</div>
<div class="card"><span class="cat">CMS</span><b>git-cms</b>Articles in commit messages; publishing moves a ref</div>
<div class="card"><span class="cat">Deploy log</span><b>Shiplog</b>Signed, append-only ledger in <code>_shiplog/*</code> refs</div>
<div class="card"><span class="cat">Binaries</span><b>git-cas</b>Chunks in the object DB, indexed by <code>refs/cas/vault</code></div>
<div class="card"><span class="cat">Locks</span><b>git-locks</b>A lock is a ref; an atomic update picks one winner</div>
</div>

<!--
git-bug: issues as Git objects in dedicated refs, synced with push/pull;
GitHub/GitLab bridges. git-native-issue: `git issue`, one ref per issue under
refs/issues/, trailers hold state/labels. git-dit: every issue and comment a commit.
grite (neul-labs): in-repo tracker for AI agents; append-only WAL ref, CRDT merges.
git-cms, Shiplog, git-cas, git-locks, git-warp: all from the "Git Stunts"
GitHub org, which uses plumbing (refs, trailers, object DB) as app storage.
git-warp (not on slide): offline-first multi-writer causal graph DB.
Source list: wiki-jens, "git-based projects".
-->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: "" -->

# Now let's talk about Everlock


---

## What is Everlock?

Your server, your data, no cloud: the everyday services in one place.

- **Git hosting** with pull requests and CI
- **Websites**, published with a `git push`
- **Mail** for your own domain, in the mail app you already use
- **Calendars and contacts**, synced to your phone
- **File shares** for Finder, Explorer and rclone
- **Photo library** that works with the Immich app
- **Password vault** for the official Bitwarden apps
- **Container registry** and **DNS** for your projects

Managed over SSH, or by an AI assistant through MCP.

<!--
Under the hood: SMTP + IMAP, CalDAV, CardDAV, WebDAV, OCI, the Immich and
Bitwarden APIs, authoritative DNS, mDNS for .local, OAuth/OIDC provider.
All in the one static binary, all data in Git.
Admin: one command engine, exposed as the SSH console and as MCP tools.
-->

---

## The idea

> The talk is less about Git as version control, and more about
> **Git as an application storage primitive**.

Git already gives you:

- **Content addressing**, which means byte-level integrity
- **Atomic commits**, so a multi-file change is all or nothing
- **History**, so audit log and undo come for free
- **Snapshots**, so you can read any path at any commit
- **No database**: no SQLite, no WAL, no migrations; just paths and bytes
- **Transparency**: all data stays open, nothing is locked away

<!--
All system data, including config (everlock-system store), lives in plain
bare repos (data/<name>.git). Nothing is hidden behind a proprietary format:
A backup is a `git clone`, an audit is `git log`, moving hardware is a
`git push`, replication is a mirror, old versions are a `git show` away.
-->

---

## Storage is not an application

No calendar app speaks Git. Something has to **translate**.

<div class="stack">
<div class="bubbles"><span class="chip client">Thunderbird</span><span class="chip client">Apple Calendar</span><span class="chip client">Bitwarden</span><span class="chip client">Immich</span><span class="chip client">Finder</span><span class="chip client">docker</span></div>
<div class="layer gap">? &nbsp;protocols · auth · domain logic</div>
<div class="layer git">Git: the storage foundation</div>
</div>

<!--
Git gives us history, atomicity and integrity, but clients speak CalDAV,
CardDAV, IMAP, SMTP, WebDAV, the Bitwarden and Immich APIs, OCI.
Between the two we need: protocol servers, authentication and authorization,
domain logic (recurrence, IMAP UIDs, sync tokens), background jobs
(thumbnails, indexes). That missing layer is what Everlock is: next slide.
-->

---

## Architecture: three layers

<div class="clients"><small>Clients speak</small><div><span class="chip client">CalDAV</span><span class="chip client">CardDAV</span><span class="chip client">IMAP</span><span class="chip client">WebDAV</span><span class="chip client">OCI</span><span class="chip client">Immich</span><span class="chip client">Bitwarden</span><span class="chip client">MCP</span><span class="chip client">Git</span></div></div>

<div class="stack everlock">
<div class="tier fe"><div><b>Frontends</b><small>speak the protocol</small></div><div><span class="chip">SSH</span><span class="chip">HTTP</span><span class="chip">SMTP</span><span class="chip">IMAP</span><span class="chip">DNS</span><span class="chip">mDNS</span></div></div>
<div class="tier be"><div><b>Backends</b><small>do the work</small></div><div><span class="chip">Git</span><span class="chip">Sites</span><span class="chip">Mail</span><span class="chip">Calendar</span><span class="chip">Contacts</span><span class="chip">Files</span><span class="chip">Photos</span><span class="chip">Vault</span><span class="chip">Registry</span><span class="chip">DNS</span></div></div>
<div class="tier base"><div><b>Primitives</b><small>keep the data</small></div><div><span class="chip">versioned storage (Git)</span><span class="chip">users</span><span class="chip">jobs</span></div></div>
</div>

<!--
Frontends (frontend-*): transport only. Framing, TLS, auth, routing; no domain logic.
Backends (backend-*): domain logic, transport-agnostic; they must not import
russh, axum or any other transport library.
Primitives: versioned-storage (Git), user registry, job scheduler; always on.
Fills the "?" from the previous slide.
-->

---

## Where Git maps surprisingly well

Sync protocols keep reinventing version control. **Git already has it.**

| Git has | Protocols call it | You get |
|---|---|---|
| **A commit**: something changed | WebDAV `PUT` / `MOVE` / `DELETE`, new mail, vault edit | audit log and undo |
| **A commit id**: the state of everything | CalDAV / CardDAV `sync-token`, Bitwarden `revisionDate` | "what changed since?" is a diff |
| **A blob id**: the state of one file | HTTP `ETag`, `If-Match` | conflicts caught on write |
| **Content addressing**: same bytes, same id | OCI layer digests | a copy moves zero bytes |

<!--
Story: every sync protocol reinvents version control, with its own words.
1. A commit = "something changed". Every WebDAV PUT/MOVE/DELETE, every delivered
   mail, every vault edit is exactly one commit. The share's history is a git log:
   audit and undo come for free (history(), read_at()).
2. A commit id = "the state of everything". CalDAV/CardDAV sync tokens and the
   Bitwarden revisionDate are derived from the store's commit id. "What changed
   since token X?" = list_at(X) diffed against now. No extra sync database.
3. A blob id = "the state of one file". ETag / If-Match compare the content id;
   a stale write fails inside the write lock (commit_checked + Precondition).
4. Content addressing = "same bytes, same id". OCI uploads stage a blob, then
   StoreOp::Copy points the digest path at it: a new reference, zero bytes copied.
-->


---

## Where the abstraction leaks (1): data model

Each leak gets a small, explicit fix. **Not a second database.**

<style scoped>table { display: table; width: 100%; }</style>

| Protocols need | Git gives you | Everlock adds |
|---|---|---|
| **IMAP UIDs** that only go up | no counters | `next_uid`, bumped in the same commit |
| **IMAP folders** | directories, the obvious fit | a sidecar tag: `MOVE` edits metadata |
| **Two clients**, one event | last writer wins | compare-and-swap in the write lock |

<!--
IMAP UIDs: mailbox.toml { next_uid, uidvalidity }; take the value, write
msg-{uid}.eml, bump the counter, all in one commit. next_uid never decreases.
Folders: the obvious mapping (directories) isn't always right; the folder is a
sidecar tag, so MOVE is a metadata edit, not a rename.
Two clients: Git's default is last writer wins on a path. Fix:
  let seen = Precondition { path, expected: store.content_id(&path)? };
  store.commit_checked(&[seen], ops, "update the record")?; // Err(PreconditionFailed)
The check runs inside the same serialization as the commit. Same idea as the
ETag / If-Match row on the previous slide.
-->

---

## Where the abstraction leaks (2): operations

Running it for real brings its own surprises.

<style scoped>table { display: table; width: 100%; }</style>

| Operations need | Git gives you | Everlock adds |
|---|---|---|
| **Multi-GB** videos and layers | no large-file story (hence LFS) | streaming into the object DB |
| **Disk space** back | history that never forgets | retention window + daily `gc` |
| **Search** and listings | `git log`, not an index | rebuildable caches, built by jobs |
| An **async** server | gix is blocking | `spawn_blocking` discipline |

<!--
Multi-GB: write_stream / read_stream hash and compress straight into the object
DB, never a Vec<u8> of the whole video or layer.
Disk space: per-repo retention window plus a daily git.gc job. Truncation
rewrites history, so every retained commit gets a new id. Deleting a file
doesn't forget it until then.
Search: derived indexes are caches, rebuildable from the store, rebuilt by jobs.
Async: gix is sync, the server is tokio. Argon2, keygen and gc once ran on the
SSH reactor (UX review, July 2026).
-->

---

<!-- _class: statement -->

# One big Rust monolith

Because “everything is Git” wasn't **controversial enough**.

<!--
Storage, protocol servers, adapters and background jobs: one process, one binary.
The default answer today is microservices and containers. Ask the room:
who would run their mail server and their password vault in the same process?
-->

---

## Why a monolith?

<div class="grid">
<div class="card"><span class="cat">Deploy</span><b>Self-contained</b>One static file: no runtime, no containers, no installer</div>
<div class="card"><span class="cat">Correctness</span><b>Strongly typed</b>Every seam between protocol, logic and storage is checked by the compiler</div>
<div class="card"><span class="cat">Operations</span><b>Updateable</b>Self-update swaps one file; the old one stays for rollback</div>
<div class="card"><span class="cat">Dependencies</span><b>Nothing breaks underneath</b>Everything pinned and compiled in: no system libs, no external tools</div>
<div class="card"><span class="cat">Compatibility</span><b>Non-breaking updates</b>All modules ship together, so there's no version skew between services</div>
<div class="card"><span class="cat">Rollback</span><b>Forward and backward</b>Roll back the binary and revert the Git store to the commit before the update</div>
</div>

<!--
Self-contained: statically linked (musl), every frontend and backend compiled in,
enabled at runtime.
Strongly typed: modules talk through Rust traits (Store, capability registry),
not JSON over a network; a breaking change is a compile error, not an outage.
Updateable: daily self-update job fetches from everlock.sh, verifies SHA-256,
swaps the file, hands the sockets to the new process (seconds of downtime);
previous binary kept as everlock.old for a one-step rollback.
Dependencies: Cargo.lock pins every crate; embed over execute, no git or
openssl on the host to drift.
Non-breaking: one version number for everything; no "mail service v3 needs
storage service v5".
Forward and backward: data and binary move as a pair. Going back means
everlock.old plus resetting each store's ref to the commit before the update;
the stores are plain bare repos, so that's ordinary git. Writes made after the
update are still in history and can be replayed or cherry-picked.
-->

---

## Inside the monolith

One process: storage, protocol servers, adapters, background jobs.

- **All modules always compiled in.** No Cargo features at all.
- Enable at runtime: `/backends enable calendar-http`
  → written to `config/calendar-http.toml` in the `everlock-system` store
  → *the config is a Git repo too*
- Shared for free: user registry, TLS + ACME, DNS records derived from vhosts,
  mDNS announcements on the LAN
- **An embedded AI model**: GGUF weights compiled into the binary, run in-process
  by our own `gguf-runner` runtime

<!--
Model: MiniCPM-V 4.6 Thinking, a vision model (slices an image into an overview
plus a grid, so small text in screenshots survives). Weights are embedded at
compile time by the everlock-ai-runtime crate; gguf-runner is self-developed
(github.com/apimeister/gguf-runner).
Two lanes on the same weights: interactive (admin /ai prompts, 32K context) and
background (image captions, 16K context, SCHED_IDLE on Linux), so captioning
never delays an admin prompt and yields the CPU to mail, git and HTTP.
Admin assistant: free-text input in the SSH REPL, the handbook as system prompt,
a search_docs tool over the docs.
Captioning: backend-image-http reuses the loaded runtime through the
ImageInferenceProvider trait, no second copy of the model.
-->

---

## How Rust ties it together

<div class="cols">
<div>

**Traits as adapter seams**
One `Store` trait behind every backend; the Git store overrides `read_stream`, `content_id`, `copy` with cheaper versions.

**Crates enforce layering**
37 workspace crates. A backend *can't* reach for `axum`, because it isn't in its `Cargo.toml`.

**Newtypes for safety**
`UserId`, `GroupId`, `StorePath`. Path containment is checked in **one** place.

</div>
<div>

**Capability lookup**
Frontends ask a registry for *"git"*, not for a concrete type. A disabled backend is simply not mounted.

**Config per crate**
Each module owns its `clap::Args` struct, flattened into one CLI in `main.rs`.

</div>
</div>

<!--
Capability lookup in code:
  if let Some(git) = ctx.backends.get::<dyn GitBackend>("git") {
      router.mount_git(git);
  }
BackendRegistry is a type-erased map keyed by capability name.
-->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: "" -->

<div class="eyebrow">Building principles</div>

# The rules we abide by

A monolith only works if it stays disciplined.

<!--
Divider. A single binary with 37 crates can turn into a ball of mud quickly.
These five rules are written down in the repo (agents.md,
module-design-principles.md) and enforced in review; they're what keeps
the monolith from becoming one.
-->

---

## Rule #1: embed over execute

```rust
// NEVER: not for git, not for anything
std::process::Command::new("git")…
```

No subprocesses: a true static binary, no shell injection surface, no "is `git` installed?".

| Need | In-process crate |
|---|---|
| Git protocol + object DB | `gix` |
| SSH | `russh` |
| HTTP / TLS / ACME | `axum` + `hyper`, `rustls`, `instant-acme` |
| DNS | `hickory-*` |
| Markdown / templates | `pulldown-cmark`, `tera` |
| AI captioning + admin assistant | embedded GGUF model, own `gguf-runner` |

<!--
agents.md calls this "non-negotiable": no std::process::Command, ever.
Why: subprocesses break the static-binary contract, add shell-injection
surface, leak environment variables, and need tools installed on the host.
-->

---

## Rule #2: transport is not logic

<style scoped>table { display: table; width: 100%; }</style>

| | Does | Never does |
|---|---|---|
| **Frontends** | framing, TLS, auth, routing | domain logic |
| **Backends** | domain logic, data model | import `russh`, `axum`, … |

**Write the logic once, serve it over any protocol:**

- one Git engine, served over SSH *and* HTTP
- one admin engine, served as SSH console *and* MCP tools

<!--
agents.md / architecture.md: every feature belongs to exactly one layer;
put code in the wrong layer and refactor it before merging.
A backend can be compiled and tested without any networking library.
Git: backend-git owns repos, jobs and storage; backend-git-ssh and
backend-git-http are thin transports that register their own capability.
-->

---

## Rule #3: Git is the only database

No config files. No data files. No database. **Only Git repos.**

```text
data/
├── everlock-system.git    # config/*.toml, users, credentials, TLS certs
├── everlock-mail.git      # every delivered mail
└── <instance>.git         # calendars, contacts, files, photos, vault, …
```

- **Even config is a commit:** enabling a backend commits to the system repo
- **Nothing else is the source of truth:** indexes and previews are caches, rebuilt from Git

<!--
primitives.md: "the git repo IS the store — no WAL, no SQLite".
Checked in code: Cargo.lock has no database crate; users and credentials are
TOML files in the system store under identity/, every change a commit.
No module reads a config or data file from disk: the frontend-http vhosts,
TLS certificate PEMs, DNS zones, module enable flags all live in stores.
Checked in code: the only direct filesystem access outside the stores is
git's own internals, /dev/urandom, build-time model packing, the local
`everlock site preview` command, and the self-update download staging file.
-->

---

## Rule #4: config decides what runs

Every module is always compiled in. **The workspace has no Cargo features.**

- **One artifact for everyone:** no build matrix, the binary you test is the binary you ship
- **Switch at runtime:** enable a module from the admin console, no rebuild
- **No silent fallbacks:** a disabled module says so, and names the flag to set

<!--
module-system.md: "Every module always compiles into the binary; the enabled
flag decides what runs. The workspace defines no Cargo features at all."
module-design-principles.md anti-pattern: #[cfg(feature = ...)] around
runtime logic. Principle 5: missing capabilities degrade gracefully; the
error must name the missing module by config flag.
-->

---

## Rule #5: break internals, never the contract

<div class="cols">
<div>

**Inside the binary**
Traits, modules, config structs

- change freely
- fix every caller in the same PR
- no shims, no `#[deprecated]`

</div>
<div>

**At the edge**
CLI flags, env vars, protocols

- treated like a versioned API
- a rename is a breaking change
- new behaviour gets a new flag

</div>
</div>

That's what makes **non-breaking updates** possible.

<!--
module-design-principles.md, rules 11 and 12.
Inside: one workspace, one binary, no external consumers of the module
system, so compatibility shims are pure overhead.
At the edge: operators script Everlock; a flag rename silently breaks
deployments in ways CI won't catch. Wire protocols follow their standards.
-->

---

## Boring facts

<div class="cols">
<div>

<div class="group">History</div>

- **May 2026**: Everlock development starts
  - registry backend since **Dec 2023**
  - photos backend since **Feb 2026**
- **v0.14.0**, after **17** releases, MIT

<div class="group">Code</div>

- **~194k** lines of Rust
- **37** workspace crates
- **~770** packages in `Cargo.lock`

</div>
<div>

<div class="group">Architecture</div>

- **6** frontends, **~17** backends

<div class="group">Tests</div>

- **~2,900** tests, **94%** line coverage

<div class="group">Result</div>

- **1** binary, **~1.8 GB** with the AI model
- **0** external tools spawned at runtime
  <span class="small">(only re-exec of itself on restart; tests check interop against real `git`)</span>

</div>
</div>

<!--
Registry: dtz-containerregistry-api (DownToZero), first commit 25 Dec 2023.
Its OCI layer was extracted into apimeister-registry (22 May 2026), which now
backs both DTZ and Everlock's backend-oci-http.
Photos: apimeister-photos, 7 Feb 2026. Everlock: first commit 2 May 2026.
Vault: apimeister-vault, 2 Jul 2026.
Releases: 17 tags, v0.3.0 (27 Jun 2026) to v0.14.0 (12 Nov 2026).
Code: 193.6k lines in 340 .rs files, up from 124.5k at v0.13.1 a week
earlier; the coverage push drove it (1.6k to 2.9k test functions).
Tests: 2,868 in the last coverage run, 94.3% line coverage
(docs/test-coverage.md, 12 Nov 2026); the v0.13.1 doc recorded 80.8%.
Cargo.lock: 774 packages.
Binary: ~1.6 GB per the distribution doc, ~1.8 GB download per the website;
almost all of it is the embedded MiniCPM-V model. Static musl build.
-->

---

## Fun facts

<style scoped>.grid { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 0.8em; }</style>

How Everlock greets me every Monday morning:

```text
jens@mba-2 everlock % cargo clean
     Removed 166974 files, 235.1GiB total
```

That's **235 GiB** of `target/` for **one** project.

<div class="grid">
<div class="card"><span class="cat">The AI model</span><b>The eyes outweigh the brain</b>Vision part 1,109 MB, language part 600 MB. The Rust code is just a rounding error.</div>
<div class="card"><span class="cat">Docs</span><b>A third as much prose as code</b>~63k lines of Markdown next to ~194k lines of Rust</div>
</div>

<!--
Real terminal output from the dev laptop (mba-2).
AI model (docs/backends/ai.md): MiniCPM-V 4.6 Thinking,
MiniCPM-V-4_6-Thinking-Q6_K.gguf (language) 600 MB,
mmproj-MiniCPM-V-4_6-Thinking-F16.gguf (vision sidecar) 1109 MB.
Docs: 63.5k lines in 223 Markdown files, incl. website and docs/chats.
-->

---

<!-- _class: lead -->
<!-- _paginate: false -->
<!-- _footer: "" -->

# Questions?

<span class="pill">everlock.sh</span>

---

## Food for thought

<style scoped>.grid { margin: 0.4em 0 1.2em; } .grid + p { color: var(--muted); }</style>

<div class="grid">
<div class="card"><span class="cat">Library</span><b>Everlock as a library</b>Build your own Git-backed stack on the same crates</div>
<div class="card"><span class="cat">Bare metal</span><b>Boot straight into Everlock</b>From UEFI directly into the binary, no OS needed</div>
<div class="card"><span class="cat">AI</span><b>Explore AI options</b>Hardware GPU support and an inference API</div>
</div>

Worth exploring, or a dead end?

---

## Everlock next to the cloud suites

<style scoped>table { display: table; width: 100%; font-size: 0.68em; }</style>

| | Everlock | Google Workspace<br>Business Starter | Microsoft 365<br>Business Basic |
|---|---|---|---|
| **Mail, calendar, contacts** | IMAP, CalDAV, CardDAV | Gmail, Calendar, Contacts | Exchange, Outlook |
| **Files** | WebDAV, as big as your disk | Drive, 30 GB per user | OneDrive, 1 TB per user |
| **Photos** | Immich app, AI captions | Google Photos | in OneDrive |
| **Websites** | static, by `git push` | Google Sites | SharePoint, intranet only |
| **Office documents** | — | Docs, Sheets, Slides | Word, Excel, PowerPoint (web) |
| **Chat and video calls** | — | Chat, Meet | Teams |
| **Password vault** | Bitwarden apps | browser only | browser only |
| **Git, CI, registry, DNS** | built in | — (Google Cloud) | — (GitHub, Azure) |

<!--
Compared against the smallest business plan of each suite.
Rows 1 to 4 overlap: same job, but Everlock speaks the open protocols, so the
client is whatever app you already use.
Rows 5 and 6 are the honest gap: no office suite, no chat, no meetings.
Rows 7 and 8 are what the suites sell elsewhere or not at all: a shared vault
(Chrome and Edge only have their built-in password managers), Git hosting with
CI, a container registry, DNS.
Google's 30 GB is pooled and shared by mail, files and photos. Basic's Office
apps are web and mobile only. SharePoint has no public websites.
If asked about price (Germany, annual plan, excl. VAT, 15 Nov 2026): Starter
6,80 €, Basic 6,07 € per user/month; Everlock is MIT, plus your own hardware.
Sources: workspace.google.com/intl/de/pricing.html; Microsoft's plans page and
its German-language pricing page (de-at). microsoft.com/de-de timed out on
15 Nov, so re-check the Microsoft cells before the talk.
-->

---

## Everlock next to the self-hosted stack

<style scoped>
p { margin: 0 0 0.5em; }
.apps { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
.apps span {
  padding: 7px 12px 8px;
  background: rgba(255, 250, 241, 0.78);
  border: 1px solid rgba(127, 106, 84, 0.18);
  border-radius: 12px;
  font-size: 0.48em;
  line-height: 1.3;
  color: var(--muted);
}
.apps b { display: block; font-family: var(--serif); font-size: 1.3em; color: var(--ink); }
.bag { display: grid; grid-template-columns: 240px 1fr; align-items: center; padding: 9px 0; border-top: 1px solid var(--line); }
.bag .n { display: flex; align-items: baseline; gap: 12px; font-size: 0.62em; color: var(--muted); }
.bag .n b { width: 30px; font-family: var(--serif); font-size: 2.7em; line-height: 1; color: var(--accent); }
.units { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.u { display: grid; grid-template-columns: 42px 1fr; column-gap: 12px; font-size: 0.64em; line-height: 1.25; }
.u::before { content: ""; grid-row: 1 / span 2; width: 42px; height: 48px; background: center / contain no-repeat; }
.u b { align-self: end; color: var(--ink); }
.u small { align-self: start; font-size: 0.82em; color: var(--muted); }
.u.db::before { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 46'><path d='M3 10v26c0 4.4 7.6 8 17 8s17-3.6 17-8V10z' fill='%23201c19'/><ellipse cx='20' cy='10' rx='17' ry='8' fill='%23453c35'/><path d='M3 23c0 4.4 7.6 8 17 8s17-3.6 17-8' fill='none' stroke='%23f6f0e3' stroke-opacity='.35' stroke-width='1.6'/></svg>"); }
.u.cache::before { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 46'><rect x='3' y='6' width='34' height='34' rx='9' fill='%23ead2c7' stroke='%23a64024' stroke-opacity='.45' stroke-width='1.4'/><path d='M22.5 11 12 25h7l-1.5 10L28 21h-7z' fill='%23a64024'/></svg>"); }
.u.web::before { background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 46'><rect x='3' y='7' width='34' height='32' rx='7' fill='%23fffaf1' stroke='%231f1a17' stroke-width='1.8'/><path d='M3 16.5h34' stroke='%231f1a17' stroke-width='1.8'/><path d='M15.5 23l-4 4.5 4 4.5M24.5 23l4 4.5-4 4.5' fill='none' stroke='%23a64024' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/></svg>"); }
.more .chip { font-size: 0.58em; margin: 3px 5px 3px 0; }
.more .chip small { margin-left: 5px; color: var(--muted); }
.sum {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  padding: 10px 24px;
  border-radius: 16px;
  background: #201c19;
  color: #f7f0e5;
  font-size: 0.8em;
}
.sum b { font-family: var(--serif); font-size: 1.9em; line-height: 1; }
.sum small { margin-left: auto; font-size: 0.85em; opacity: 0.75; }
.sum small + b { color: #f0a07e; }
</style>

Eight projects cover the same jobs. **This is what they bring along.**

<div class="apps">
<span><b>Forgejo</b>Git, CI, registry</span>
<span><b>Caddy</b>websites, TLS</span>
<span><b>mailcow</b>mail</span>
<span><b>Nextcloud</b>calendars, files</span>
<span><b>Immich</b>photos</span>
<span><b>Vaultwarden</b>password vault</span>
<span><b>PowerDNS</b>DNS</span>
<span><b>Keycloak</b>single sign-on</span>
</div>
<div class="bag"><div class="n"><b>4</b>database servers</div><div class="units"><span class="u db"><b>PostgreSQL</b><small>for Nextcloud</small></span><span class="u db"><b>PostgreSQL</b><small>for Immich</small></span><span class="u db"><b>PostgreSQL</b><small>for Keycloak</small></span><span class="u db"><b>MariaDB</b><small>for mailcow</small></span></div></div>
<div class="bag"><div class="n"><b>4</b>cache servers</div><div class="units"><span class="u cache"><b>Redis</b><small>for Nextcloud</small></span><span class="u cache"><b>Valkey</b><small>for Immich</small></span><span class="u cache"><b>Redis</b><small>for mailcow</small></span><span class="u cache"><b>Memcached</b><small>for mailcow</small></span></div></div>
<div class="bag"><div class="n"><b>4</b>web + PHP servers</div><div class="units"><span class="u web"><b>Apache or nginx</b><small>for Nextcloud</small></span><span class="u web"><b>PHP</b><small>for Nextcloud</small></span><span class="u web"><b>nginx</b><small>for mailcow</small></span><span class="u web"><b>PHP-FPM</b><small>for mailcow</small></span></div></div>
<div class="bag"><div class="n"><b>6</b>more moving parts</div><div class="more"><span class="chip">ML service<small>Immich</small></span><span class="chip">JVM<small>Keycloak</small></span><span class="chip">ClamAV<small>mailcow</small></span><span class="chip">Unbound<small>mailcow</small></span><span class="chip">CI runner<small>Forgejo</small></span><span class="chip">Docker<small>Forgejo</small></span></div></div>
<div class="sum"><b>26</b>things to keep up to date<small>with only 2 updates each per year, that is</small><b>52</b>updates: one every week</div>

<!--
The top strip is the mainstream pick per job, not the leanest one. The point
is everything below it: what you run in addition to the thing you wanted.
Count: 4 database servers (3x PostgreSQL, MariaDB) and 4 cache servers of 3
kinds (Redis twice, Valkey, Memcached), plus 3 SQLite files (Forgejo,
Vaultwarden, PowerDNS). The PostgreSQLs don't simply merge: Immich ships its
own image with the VectorChord extension.
Web + PHP: mailcow runs nginx and PHP-FPM as two containers; Nextcloud wants
Apache or nginx plus PHP 8.3+ (with Apache's mod_php the two share a process).
Bottom line: 8 projects + 4 + 4 + 4 + 6 = 26 things, each with its own
upstream releases. Two updates a year each is a deliberately low assumption:
52 a year, one every week. Fair caveat: some arrive bundled (mailcow updates
its containers together, Immich ships the ML service with the server), so it
is fewer than 52 maintenance windows, but each of the 26 still has its own
releases and security fixes. Backups and config come on top.
If asked for the Everlock number: one binary, one self-update.
mailcow: 18 services in its docker-compose.yml (Postfix, Dovecot, Rspamd, SOGo,
MariaDB, Redis, Memcached, ClamAV, Unbound, nginx, PHP-FPM, ...).
Nextcloud: PostgreSQL or MariaDB recommended, SQLite "only for testing and
minimal instances"; Redis recommended for file locking, not required; cron
recommended for background jobs.
Immich: server, machine learning, Valkey, PostgreSQL 14 + VectorChord.
Forgejo: SQLite recommended for low to moderate activity, MySQL or PostgreSQL
for high. The Runner is installed separately and runs jobs in Docker/Podman or
LXC (host mode has no isolation). Storage is local disk by default or an
S3-compatible server (tested with MinIO and Garage). OCI registry built in,
no Pages feature, hence Caddy plus a deploy job.
Vaultwarden: SQLite by default, MySQL or PostgreSQL possible.
Keycloak: the default dev-file database is "not suitable for production".
PowerDNS: generic SQL backends (MySQL, PostgreSQL, SQLite), also LMDB and BIND.
Fair objection: leaner picks exist. Stalwart (Rust) is one server for mail,
calendars, contacts and files; Vaultwarden and Forgejo on SQLite are light.
S3 is optional everywhere in this stack, so it is neither on the slide nor in
the count; it becomes a real row with GitLab or a standalone registry.
Around all of it: a backup job per database, an upgrade path and a config
format per project, separate user lists (hence Keycloak).
Sources (checked 15 Nov 2026): docker-compose.yml of immich-app/immich and
mailcow/mailcow-dockerized; admin docs of Nextcloud 36, Forgejo 17, Keycloak
(server/db) and PowerDNS (backends); Vaultwarden .env.template; stalw.art.
-->
