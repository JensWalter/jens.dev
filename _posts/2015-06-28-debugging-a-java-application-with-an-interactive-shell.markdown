---
layout: post
title:  "debugging a java application with an interactive shell"
date:   2015-06-28 15:48:54 +0200
tags: java nashorn jjs
---
Since a while ago, the JVM has an embedded Javascript engine within. Since Java 8 (I think) this engine got extended through an interactive shell. So now you can start an interactive Javascript shell within your JVM.
Knowing that, I wondered why nobody tried to use this feature, to do some debugging.
So I tried.

First I had to find the coresponding class of the jjs tool. I'm not sure I found the right one, but I did find a Shell class within the nashorn.jar file.
Starting that class within intelliJ provided me a shell which was called jjs (so it cannot be that wrong).
Sadly, not all the command line parameters that jjs has, worked on this class. Especially the "-e" was missing. That parameter is used to evaluate whatever inline script given through this parameter.
Instead I had to fallback to files, to provide the launcher code for my actual application.
This is what the launch configuration in intelliJ looks like.

![intelliJ launch configuration](/assets/shell-launch-config.png)

After that, the debugger starts an empty shell. What I needed from that point onwards, was to start the real application. For that, I wrote the following Javascript and put it into the project directory.
{% highlight Javascript %}
var args =["-cq","-cs","-ll","debug","-p","/Users/jens/tmp/store","-t","1m"];
Java.type("io.trivium.Start").main(args);
{% endhighlight %}
Including this script, the launch configuration had to be adjusted with the correct script filename.

![intelliJ launch configuration](/assets/shell-launch-configuration-with-script.png)

So now I could start my application through the launch configuration and in effect have a shell to interact with my code base at run-time.
