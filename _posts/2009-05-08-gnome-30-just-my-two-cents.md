---
title: gnome 3.0, just my two cents
date: 2009-05-08T14:10:59+00:00
layout: post
tags:
  - gnome 3.0
  - gnomeshell
  - gtk
---
Over the last weeks there were several discussions how to handle the gnome 3.0 release. There are a lot of different points of view out there what has to be done in gnome to deserve a 3.0 release.

One fact that often seems to be forgotten is the fact that the timeframe for all this is something about a year. So some of the suggestions like switching the [core language](http://gnomejournal.org/article/63/letter-from-the-editor-gnome-30) of the gtk seem like a bit overkill to me. Personally I think the C language a good and solid base for gtk. It provides the performance and flexibility you need for such a framework.

**GTK**

So on my end the complexity and structure of the existing framework is a necessity. What can and should be done is to clean up, remove deprecated functionality and maybe change little things to make the framework smoother.

**File management**

Today file management is mainly done through applications like nautilus and gnome-terminal. Managing information through folders and files is the default way since way back. For me this seems a perfectly fine way to handle information. On the other hand, with increasing storage capabilities I see more and more people wandering around the filesystem without any plan where to search for what information. There are multiple approaches to address this issue.

One would be to do everything through a search engine (like [google desktop search](http://desktop.google.com), [beagle](http://beagle-project.org/)). This would require that every peace of information would be crawlable and the indexer understands the structure and content. In reality this is not easily achievable. Most crawler just don’t understand the file format or can’t analyze the content correctly. If I have an text file in my home folder and it is a header file the information that I want from this file are completely different then if that file would be my mailbox backup in form of a mbox file. Todays crawler (at least the ones I have seen) ignore this fact and try to match strings against the plain content. This can help but is a very primitive way and the results are pretty random. So for me this seems not likely the way to go as a general approach.

Another approach could be to embrace a meta information level to give the user a custom structure on top of the filesystem. Basically this means just tag everything the way you want. This way you can create a different abstraction level where to find information. Mainly for MP3 this is the default way to organize music (ID3-tags). For pictures this is in creation through EXIF and XMP. Both are useful and standardized formats, but as always, let the format wars begin. For other file types it is pretty thin out there. So far I have seen no general system how to handle tags for binary files. It would be nice to see some progress on that end.

So there are quite a few things that could be done on the file management side but like in the gtk section the interesting question is what can be done in such short timeframe. For me, a tag system which plugs into nautilus (or other file managers) would be the ideal solution, because that way, you have the chance of bringing this to other desktop environments like KDE or (lets think big) maybe even Windows Explorer (Yes, it is extendable by API).

**UI**

My final point would be the UI and with UI I mean the complete environment starting with the desktop leading to application design. First let’s start with the desktop. It hasn’t changed since a very long time. So now there are two fractions out there.

One, everything should stay the same for ever.

Two, everything should be done some new way (although nobody states how).

For me both seam a bit drastic. The proposal to change the desktop to GnomeShell seams like a good compromise to me. You get a new interface but basically keep the classic applet bar and application menu structure. One side effect of GnomeShell is that it is implemented in JavaScript. So it should get easier to build some extensions for it (at least in theory). Another plus would be the integration of graphical effects in the system. I know that this is partly controversial because there are a lot of legacy system out there which can’t handle it, but for me eye-candy is always a good thing. So there should be at least some switch to disable the eye-candy for those who don’t want it (so far I didn’t see something like this during my first try).

A few weeks ago I was at a Microsoft conference (yes I know, evil) and they showed some of the new features of Windows 7. There was one thing which really impressed me. Aside from the new ‘superbar’ (former task bar) they could integrate widgets on the fly everywhere on the desktop. These widgets were partly some of the old stuff, known from vista’s sidebar, but some were quite interesting and could easily build via simple scripting. I would hope that Gnome would also bring some widget support which is not only usable in the gnome-applet bar. Especially the support for scripting languages as widget platform would really help to bring more developers to extending the desktop.

I know there are a lot of projects out there which have the goal of bringing gtk to different languages like [Python](http://www.pygtk.org/), [JavaScript](http://live.gnome.org/Gjs), [Perl](http://gtk2-perl.sourceforge.net/), [C#](http://www.mono-project.com/), only to name a few, but so far these are still relatively complex to use for simple widgets or applications.

So far I am no big fan of introducing another abstraction layer for designing applications (like XUL or XAML), but these systems encourage not so experienced developers to create new content (seen in the massive market of firefox plugins). So maybe it should be considered.

That’s it so far. For me it seams there is a lot to cover for the gnome 3.0 release. I think most of it is just visionary and not implementable in the short term. In the long term however I really would like to see some changes to the way users interact with computers (no, I do not mean multitouch).
