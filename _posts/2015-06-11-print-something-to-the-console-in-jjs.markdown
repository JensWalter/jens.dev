---
layout: post
title:  "print something to the console in jjs"
date:   2015-06-11 11:12:45 +0200
tags: java nashorn jjs javascript
---
Once I got jjs running I started with some pretty simple stuff.
To print something to the console I found the following ways.
{% highlight javascript %}
//javascript style
print("hello world"); // don't forget the parentheses here, otherwise jjs wont like you
//java style
var System = Java.type('java.lang.System');
System.out.println("hello world");
//of course there is an error out too
System.err.println("hello world");
{% endhighlight %}

Don't forget to declare System as Variable, otherwise it will fail.
{% highlight javascript %}
nashorn> System.out.println("hello world");
script error: ReferenceError: "System" is not defined in <STDIN> at line number 1
{% endhighlight %}
