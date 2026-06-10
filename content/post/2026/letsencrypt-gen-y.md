---
title: "When Let's Encrypt Is Valid but GitHub Actions Still Rejects It"
date: 2026-06-10
description: "Debugging a TLS certificate validation failure in GitHub Actions caused by Let's Encrypt's new Generation Y certificate hierarchy and an untrusted ISRG Root YE certificate."
tags:
  - letsencrypt
  - github-actions
---

A few days ago I ran into a surprisingly tricky TLS issue while setting up automated tests for a service running behind Let's Encrypt certificates.

The symptoms were confusing at first:

- Browsers accepted the certificate.
- `curl --insecure` worked.
- The certificate looked perfectly valid.
- Yet GitHub Actions consistently failed with:

```text
SSL certificate problem: unable to get local issuer certificate
```

At first glance this looked like a classic missing intermediate certificate problem.

It wasn't.

## The Error

The failing test was executed using Hurl inside GitHub Actions:

```text
error: HTTP connection

GET https://ueo.ventures/

(60) SSL certificate problem:
unable to get local issuer certificate
```

Running OpenSSL against the endpoint produced a similar result:

```text
verify error:num=20:
unable to get local issuer certificate
```

The certificate itself looked completely normal:

```text
subject=CN = ueo.ventures

issuer=C = US,
O = Let's Encrypt,
CN = YE2
```

The server also provided an intermediate certificate:

```text
Let's Encrypt YE2
```

which was issued by:

```text
ISRG Root YE
```

Nothing appeared to be missing.

## First Suspect: Broken Certificate Chain

Whenever OpenSSL reports:

```text
unable to get local issuer certificate
```

the first thing to check is whether the server sends the full certificate chain.

The output confirmed that both the leaf certificate and the intermediate were present:

```text
Certificate chain

0: ueo.ventures
1: Let's Encrypt YE2
```

So the server configuration was not the problem.

## Second Suspect: An Outdated CA Store

The tests were running on GitHub Actions using the `ubuntu-latest` runner.

At the time of writing, `ubuntu-latest` resolves to Ubuntu 24.04 LTS (Noble Numbat), which is generally considered a modern and well-maintained platform.

Checking the installed CA package showed:

```text
ca-certificates 20240203
```

At first glance, this made the trust-store theory seem unlikely. Ubuntu 24.04 is the current LTS release, and GitHub keeps the runner images regularly updated.

Reinstalling the package changed nothing:

```bash
sudo apt install --reinstall ca-certificates
sudo update-ca-certificates
```

The verification error remained.

This was the first clue that the issue was not caused by an outdated operating system or a stale package installation.

Instead, we were dealing with a certificate chain that had moved faster than the trust stores available in common CI environments.

## The New Let's Encrypt Generation Y Hierarchy

The certificate had been issued from Let's Encrypt's newer Generation Y hierarchy:

```text
ueo.ventures
 └─ Let's Encrypt YE2
     └─ ISRG Root YE
```

The GitHub Actions runner image we tested did not yet trust `ISRG Root YE`.

The chain itself was perfectly valid.

The trust store simply did not contain the root certificate required to complete verification.

From the client's perspective the chain effectively ended in mid-air:

```text
ueo.ventures
 └─ YE2
     └─ Root YE

Root YE: unknown
```

Result:

```text
unable to get local issuer certificate
```

## Why Browsers Worked

Modern browsers often maintain their own trust infrastructure and update independently from the operating system.

CI runners, containers and server operating systems usually rely on the OS certificate bundle.

This means a certificate can be accepted in Chrome while failing in automated build pipelines.

A frustrating difference that is easy to overlook.

## How We Verified the Root Cause

The key clue came from OpenSSL:

```text
depth=1
C = US,
O = Let's Encrypt,
CN = YE2

verify error:num=20:
unable to get local issuer certificate
```

Notice that verification fails above the leaf certificate.

OpenSSL was able to validate:

```text
ueo.ventures -> YE2
```

but could not find a trusted issuer for:

```text
YE2 -> Root YE
```

That narrowed the problem down immediately.

## Our Solution

After confirming that the certificate chain itself was valid, we shifted our focus to the GitHub Actions runner.

The root cause was that the `ubuntu-latest` runner, which currently resolves to Ubuntu 24.04 LTS, did not yet trust the new `ISRG Root YE` certificate used by Let's Encrypt's Generation Y hierarchy.

Reinstalling the CA bundle did not help because the required root certificate simply was not part of the installed trust store.

The solution was to explicitly install the missing root certificate during the CI run and update the local trust store before executing the tests.

In our GitHub Actions workflow the fix looked like this:

```yaml
- name: Install ISRG Root YE
  run: |
    curl -fsSL https://letsencrypt.org/certs/gen-y/root-ye.pem \
      -o root-ye.pem

    sudo cp root-ye.pem \
      /usr/local/share/ca-certificates/root-ye.crt

    sudo update-ca-certificates

- name: Verify certificate chain
  run: |
    openssl s_client \
      -connect ueo.ventures:443 \
      -servername ueo.ventures \
      -verify_return_error \
      </dev/null

- name: Run Hurl tests
  run: |
    hurl --test tests/container-registry/test.hurl
```

Once the runner trusted `ISRG Root YE`, certificate verification succeeded and the Hurl tests passed without any further changes.

This confirmed that the issue was never the certificate itself, but rather a mismatch between the certificate hierarchy used by Let's Encrypt and the trust anchors available in the GitHub Actions environment.

## Lessons Learned

When debugging TLS issues, it is tempting to focus exclusively on the server certificate.

However, there are three distinct components involved:

1. The leaf certificate
2. The intermediate certificates
3. The trust anchors available on the client

A certificate chain can be perfectly valid while still failing because the client does not trust the root certificate at the end of that chain.

In our case:

- The leaf certificate was valid.
- The intermediate certificate was present.
- The root certificate was not trusted by the GitHub Actions environment.

One of the more surprising aspects of this issue was that it occurred on GitHub Actions' `ubuntu-latest` runner, which currently uses Ubuntu 24.04 LTS.

When most engineers hear "certificate trust problem", they immediately think of old operating systems, outdated containers, or forgotten package updates.

In this case, none of those assumptions were true.

The environment was fully up to date, but the certificate hierarchy was newer than the trust store available in the runner image.

The error appeared during local testing, but the root cause was neither DNS nor localhost routing.

The actual issue was a trust mismatch between a newly issued Let's Encrypt certificate chain and the CA bundle available in GitHub Actions.

The certificate was valid, the chain was complete, and the server configuration was correct. The missing piece was simply that the CI runner did not yet trust the new root certificate used by Let's Encrypt's Generation Y hierarchy.

As always with TLS, the interesting bugs tend to live one layer deeper than expected.