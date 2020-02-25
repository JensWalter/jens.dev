---
layout: post
title:  "read the content of a file in one line in jjs"
date:   2015-06-12 12:32:25 +0200
tags: java nashorn jjs javascript
---
The task is pretty simple, read the content of text file as one-liner. Here is what I came up with.
{% highlight javascript %}
var filename = "engine.log";
var content = new java.lang.String(
                    java.nio.file.Files.readAllBytes(
                      java.nio.file.Paths.get(filename)
                    )
                  );
{% endhighlight %}
