---
layout: post
title:  "FormDataHandler implements com.sun.net.httpserver.HttpHandler"
date:   2015-10-10 21:04:54 +0200
tags: java
---
I just needed a dependency free version of a FormData Parser. Since all libraries I found were rather heavy weight I decided to start on my own implementation and share this one.

To use this one, you can just extends the class below.

{% highlight java %}
public class FileUpload extends FormDataHandler{
  @Override
  public void handle(HttpExchange httpExchange, List<MultiPart> parts){}
}
{% endhighlight %}

<script src="https://gist.github.com/0f19780d131d903879a2.js"> </script>
