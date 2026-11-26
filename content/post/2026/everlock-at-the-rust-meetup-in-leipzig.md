---
title: "Everlock at the Rust meetup in Leipzig"
date: 2026-11-19
description: "On Tuesday I talked about Everlock at the Rust meetup in Leipzig: Git as an application storage primitive, with the protocols as adapters on top. Here are the slides and their Markdown source."
tags:
- everlock
- git
- rust
- self-hosting
---
On Tuesday I gave a talk at the [Rust meetup in Leipzig](https://www.meetup.com/rust-modern-systems-programming-in-leipzig/events/313816501/): "Everlock: Everything Is Git, Protocols Are Just Adapters". It is the practical side of my post about [Git as universal storage](/2026/09/11/git-as-universal-storage.html), with [Everlock](https://everlock.sh) as the example. Thanks to everybody who came.

<div style="margin:0 0 30px">
<iframe src="/assets/2026/everlock-rust-meetup-2026-11.html" title="Slides: Everlock: Everything Is Git, Protocols Are Just Adapters" style="display:block;width:100%;aspect-ratio:16/9;border:1px solid #DDDBCC;border-radius:3px" loading="lazy" allowfullscreen></iframe>
</div>

Click into the slides and use the arrow keys, or open them [in their own tab](/assets/2026/everlock-rust-meetup-2026-11.html). The [Markdown source](/assets/2026/everlock-rust-meetup-2026-11.md) of the deck is available as well, speaker notes included.

## Food for thought

The deck ends with two comparisons.

Next to the cloud suites, Google Workspace and Microsoft 365, Everlock covers mail, calendars, contacts, files, photos and websites, and it does so through open protocols, so the client is whatever app you already use. On top of that it brings a password vault, Git hosting with CI, a container registry and DNS, which the suites sell elsewhere or not at all. The honest gap: no office documents, no chat and no video calls.

Next to the self-hosted stack, the question is what it replaces. Eight projects cover the same jobs: Forgejo, Caddy, mailcow, Nextcloud, Immich, Vaultwarden, PowerDNS and Keycloak. Along with them come 4 database servers, 4 cache servers, 4 web and PHP servers and 6 more moving parts. That makes 26 things to keep up to date, and with only two updates each per year that is one update every week. Everlock replaces them with one binary and one self-update.

If you have an opinion on that, feel free to drop me a line.
