---
title: installing GLUEscript on debian squeeze 64bit
date: 2009-07-15T16:06:15+00:00
layout: post
tags:
  - 64-bit
  - javascript
---
The [GLUEscript](https://sourceforge.net/projects/gluescript/) runtime is still in an pretty early development stage. Basically they use the Firefox spidermonkey javascript engine and build some useful libraries on top of that (like curl, mysql, filesystem support).

They also provide a little help in form of a little text file, but with this, it still took me half a day for my first installation. Most issues I got were based on version mismatches, because debian and also ubuntu use older versions of the required libraries.

First download the GLUEscript source from sourceforge.

A second tool you will need to get this running is [premake](http://premake.sourceforge.net/). This is also a sourceforge project (you can use the binary version of it right away).

After downloading, I copied the premake binary into the glue/src folder.

So now we can start with fetching the dependencies which debian can fulfill.

<pre class='prettyprint lang-shell'>sudo apt-get install libnspr4-0d libnspr4-0d-dbg libnspr4-dev libcurl4-openssl-dev libwxgtk2.8-dev libssl-dev libiodbc2-dev libmysql++-dev
</pre>

In addition to that I needed a library called [poco](http://pocoproject.org/) version 1.3.5 (all repositories I found just provided versions up to 1.3.3 -> those don’t work). So get the source from <http://pocoproject.org/download/> (the complete version). Compiling that should make no trouble cause all the dependencies are already installed.

<pre class='prettyprint lang-shell'>/tmp$ cd poco-1.3.5-all/
/tmp/poco-1.3.5-all$ ./configure
Configured for Linux
/tmp/poco-1.3.5-all$ make
/tmp/poco-1.3.5-all$ sudo make install
</pre>

Now let’s get back to configuring GLUEscript. All configuration is done via lua script which will than be consumed by premake. The config file I needed to edit was the premake.lua file:

> <pre>-- Check NSPR
if ( string.len(nspr_dir) == 0 ) then
  print("Using the NSPR library which is part of GLUEscript")
  dopackage("nspr") -- build our own NSPR
  nspr_dir = "../nspr/include"
  nspr_lib = "nspr"
  nspr_lib_dir = project.libdir
else
  print("You are using your own NSPR library: ")
  nspr_dir = "/usr/include/nspr"
  print("nspr include: " .. nspr_dir)
  print("nspr lib: " .. nspr_lib_dir .. "/" .. nspr_lib)
end
</pre>

I copied the whole paragraph to just make it easier to find the position. Important is the added row in the else part.

> nspr_dir = “/usr/include/nspr”

This is needed because debian has a different file structure for header files than the script expects it.

After that we are done with configuring. To actually start the build process you have to run premake first.

<pre class='prettyprint lang-shell'>./premake gnu
make
</pre>

The output will be generated to the following directory:

> glue/bin/Debug

So far the makefile does not a an installation part. So if you want to install this you have to do it by yourself.

PS: This only works for the 0.0.1 version. So far I didn’t get any more recent svn version running.
