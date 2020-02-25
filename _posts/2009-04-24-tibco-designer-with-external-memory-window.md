---
title: TIBCO Designer with external memory window
date: 2009-04-24T18:13:10+00:00
layout: post
tags:
  - designer
  - TIBCO
---
During Research for my last blog post I found an interesting feature of the designer. If the designer uses more than one gigabyte of heap memory, the display of the memory usage gets a bit fuzzy.

<img src="/assets/memorybar.png" alt="memorybar" title="memorybar" width="191" height="48" class="aligncenter size-full wp-image-219" />

Obviously somebody at TIBCO forgot to round the value, so it would fit into this small section of the status bar.

Keeping that in mind I found a start parameter which allows you to start the designer with an external window which only displays the current memory load.

<img src="/assets/memory-window2.png" alt="memory-window2" title="memory-window2" width="338" height="204" class="aligncenter size-full wp-image-216" />

As you can see this is much more useful then the default.

To get this you just have to start the designer with the following command:

> ./designer -memory

I wonder how much more (undocumented) functionality is hidden in the designer.
