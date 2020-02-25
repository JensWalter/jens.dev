---
title: 'what&#8217;s the sitch'
date: 2009-04-09T00:26:32+00:00
layout: post
tags:
  - streaming api
  - yahoo finance
---
As I have a lot to do right am not really coming closer to my goal to write a general purpose app which can pull data from the yahoo streaming server. So I decided to post a few facts about the yahoo api. I hope this helps someone developing his app. So lets see what we have. First an explanation of these cryptic symbols:

> a00: ask price

> b00: bid price

> g00: day’s range low

> h00: day’s range high

> j10: market cap

> v00: volume

> a50: ask size

> b60: bid size

> b30: ecn bid

> o50: ecn bid size

> z03: ecn ext hr bid

> z04: ecn ext hr bid size

> b20: ecn ask

> o40: ecn ask size

> z05: ecn ext hr ask

> z07: ecn ext hr ask size

> h01: ecn day’s high

> g01: ecn day’s low

> h02: ecn ext hr day’s high

> g11: ecn ext hr day’s low

> t10: last trade time, will be in unix epoch format

> t50: ecnQuote/last/time

> t51: ecn ext hour time

> t53: RTQuote/last/time

> t54: RTExthourQuote/last/time

> l10: last trade

> l90: ecnQuote/last/value

> l91: ecn ext hour price

> l84: RTQuote/last/value

> l86: RTExthourQuote/last/value

> c10: quote/change/absolute

> c81: ecnQuote/afterHourChange/absolute

> c60: ecnQuote/change/absolute

> z02: ecn ext hour change

> z08: ecn ext hour change

> c63: RTQuote/change/absolute

> c85: RTExthourQuote/afterHourChange/absolute

> c64: RTExthourQuote/change/absolute

> p20: quote/change/percent

> c82: ecnQuote/afterHourChange/percent

> p40: ecnQuote/change/percent

> p41: ecn ext hour percent change

> z09: ecn ext hour percent change

> p43: RTQuote/change/percent

> c86: RTExtHourQuote/afterHourChange/percent

> p44: RTExtHourQuote/change/percent

These are the ones I found in the javascript sources. For most of it I don’t have a clue what it is for so don’t ask me what it means.

Next thing I want to mention is the result. A general approach would be to request your data and then run it through a proper JSON parser so you can work with the data as an object. Luckily this doesn’t work. The JSON returned is not 100 percent compliant with the JSON definition. Yahoo packs these symbols (seen above) not into quotes, so the parser denies to read it. A simple way around it is to string replace all possible symbols with quotes.

That’s it so far. I will post more if I have new information to share.
