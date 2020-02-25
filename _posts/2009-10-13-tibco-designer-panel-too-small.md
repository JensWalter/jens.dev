---
title: TIBCO Designer Panel too small
date: 2009-10-13T18:52:38+00:00
layout: post
tags:
  - BusinessWorks
  - designer
  - TIBCO
---
Recently I ran into some rather trivial problem which isn’t really addressed by the TIBCO Designer. I had a process which wouldn’t fit into the Design Panel. There was just not enough space on the canvas to fit in the actual flow.

After asking around I came to the conclusion that every designer (from different colleges I work with) had a different resolution for the Design canvas. Nobody knew any kind of property where you can set this resolution, so I began searching around.

The designer uses basically 2 Folder for its configs. One is the installation folder with the designer.tra ([already explored this one](/2009/04/22/improve-tibco-designer-tester-performance-under-linux.html)). The other one is the .TIBCO folder in your user home directory. In that folder there exists a file with the name “Designer5.prefs”.

The content of this file consists mainly of position data of the various dialogs. Further to that it includes all the values which you can set through the designer preferences window. Back to the actual topic, I found the following two values:

> graph.height.pref=712

> graph.width.pref=1515

These values represent the default size which the Designer allocated for its canvas. As you can see the default is pretty small on this one. I also found installations where both values where ten times larger then this. So far I found no performance penalty to this.

The only pattern I found is that newer installation had smaller values as default. Where this value comes from and how it is determined stays unclear to me.

One other thing I found during my research. If the panel is to small for the current process you can drag one activity right next to the border and then start to move it via keyboard (‘Shift + Cursor’). By doing so you drag the icon out of the canvas, but the position will be updated internally. After that you just need to refresh the process view and voila you have expanded the canvas size. But this is just a quick and dirty work-around.
