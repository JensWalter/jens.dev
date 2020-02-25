---
title: installing TIBCO TRA 5.6 on a debian 64bit
date: 2009-02-24T00:59:40+00:00
layout: post
tags:
  - 64-bit
  - TIBCO
  - TRA
---
Recently I got a hardware upgrade so I could finally switch to a 64-bit environment. To fully use that machine I wanted to install TIBCO in 64-bit mode. After starting the installation I got this message:

> TIBINS202527: Error: ERROR: You are running a 64-bit product installer on a 32-bit system.

> This is not supported.

The Problem was I was running a 64-bit OS with a 64-bit Kernel:

<pre class="prettyprint shell">uname -a
Linux client1 2.6.28.5 #1 SMP PREEMPT Tue Feb 17 17:42:33 CET 2009 x86_64 GNU/Linux</pre>

So I tried to find the problem. First I needed some more output what the installer is actually doing. So I used the logging option to get all the debug output.

<pre class="prettyprint shell">./TRA.5.6.0-suite_linux24gl23_x86.bin -console -is:log output</pre>

So when you look closer to this log you can see that the command which is running the installer looks like this:

> Executing launch script command: “/tmp/isjI8lFYy/bin/java” -cp “”:”TRA.5.6.0-suite\_linux24gl23\_x86.jar”:”TRA.5.6.0-simple\_linux24gl23\_x86.jar”:”tibrv.8.1.1-simple\_linux24gl23\_x86.jar”:”jre.1.5.0-simple\_linux24gl23\_x86\_64.jar”:”Designer.5.6.0-simple\_linux24gl23\_x86\_64.jar”:”tpcl.5.6.0-simple\_linux24gl23\_x86.jar”:”hawk.4.8.1-simple\_linux24gl23\_x86\_64.jar”:”/tmp/isjA5jEsB/TRA.5.6.0-suite\_linux24gl23\_x86.jar”:”” -Dtemp.dir=”/tmp” -Dis.jvm.home=”/tmp/isjI8lFYy” -Dis.jvm.temp=”1″ -Dis.media.home=”/tmp/isjA5jEsB/TRA.5.6.0-suite\_linux24gl23\_x86.jar” -Dis.launcher.file=”/home/jens/tmp/TIB\_tra-suite\_5.6.0\_linux24gl23\_x86\_64/./TRA.5.6.0-suite\_linux24gl23\_x86.bin” -Dis.jvm.file=”/tmp/isjI8lFYy/jvm” -Dis.external.home=”/home/jens/tmp/TIB\_tra-suite\_5.6.0\_linux24gl23\_x86\_64/.” -Xms20m -Xmx128m run -home TRA.5.6.0-suite\_linux24gl23_x86.jar “-console”

Now that I had the command which is starting the installer I began to trace what this process is doing. To do a strace properly you just have to prepend ‘strace’ and than redirect the error output to a file (cause it is quiet a lot). So after doing this I found something interesting in the log.

> [pid 32651] execve(“/bin/uname”, [0xffffffffdf47dc88, “-p”], [/\* 1757 vars \*/]) = 0

As you can see it runs the command ‘uname -p’. This command returns ‘unknown’ for a default debian system. You also have this problem if you are running a self compiled kernel from kernel.org. As for the TIBCO supported systems (SUSE ans redhat) they return something different. After trying the same command on a openSUSE I found that ‘x86\_64’ should be the correct string. After I bit of trial and error I found out that the result of this command is written to a file name ‘kernelbits\_jens.txt’ in the temp directory.

So here the simple solution to the problem.

You just need to create the arch file manually and make it read-only so the installer can’t overwrite it. Here the command:

<pre class="prettyprint">echo 'x86_64' > kernelbits_`whoami`.txt</pre>

Now the installer worked absolutely fine for me.

I already notified the TIBCO support about the problem. As for now there will be no fix. But I hope they will correct this behavior for future installer.
