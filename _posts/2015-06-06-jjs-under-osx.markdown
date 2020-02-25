---
layout: post
title:  "using jjs under osx"
date:   2015-06-06 18:22:03 +0200
tags: java nashorn jjs javascript
---
Recently I wanted to try the new java8 integration javascipt shell. So I installed the Oracle JDK on my mac, opened a terminal and got the following result:
{% highlight bash %}
localhost:~ jens$ jjs
-bash: jjs: command not found
{% endhighlight %}
After some googling around I found that the jjs execution is part of the packaged jdk but not really there. After some time I found that it is installed under the name **jrunscript**. So now I only had to alias jjs to jrunscript and I could start.
{% highlight bash %}
mbp:~ jens$ alias jjs=jrunscript
{% endhighlight %}
{% highlight bash %}
mbp:~ jens$ jjs
nashorn>
{% endhighlight %}

To make this alias permanent I added the alias to the .profile config file.
{% highlight bash %}
mbp:~ jens$ echo "alias jjs=jrunscript" >> ~/.profile
{% endhighlight %}
That it is, now jjs is part of my system.
