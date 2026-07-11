---
title: "Everlock - self-hosting where every commit is locked in forever"
date: 2026-06-09T12:00:00Z
---

Everlock grew out of a simple frustration: handing your code, photos, mail, and calendars to someone else's cloud means trusting that they will still be around — and still on your side — next year. Everlock is built for the opposite stance. You run it on a box you own, and that box quietly takes care of the everyday services a person or a small team needs: Git hosting, websites, a photo gallery, mail, DNS, and a friendly presence on the local network. No vendor account, no subscription, no "we are sunsetting this product" email.

The name comes from how it treats your Git repositories. Every commit you push is locked in forever — content-addressed, immutable, and yours. Nothing rewrites history behind your back, nothing expires, nothing gets quietly migrated to a new format. That same "write it once, keep it for good" instinct runs through the rest of the project too.

That it happens to be a single static Rust binary is almost a footnote — but a useful one. Rust gives it the memory safety you want from something exposed to SSH, HTTP, and DNS traffic, and the performance headroom to grow with you instead of buckling under load. One binary, one config tree, one thing to run. No containers required, no cloud account required, no database to babysit.

## project site
https://everlock.sh

## code repository
https://codeberg.org/JensWalter/everlock
