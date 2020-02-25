---
layout: post
title:  "doing objects in jjs"
date:   2015-06-13 08:12:55 +0200
tags: java nashorn jjs javascript
---
Instantiating a Java Object in jjs is pretty straight forward, at least it can be.
{% highlight javascript %}
var string = new java.lang.String("hello world");
//alternative
var stringClass = Java.type("java.lang.String");
var string = new stringClass("hello world");
{% endhighlight %}
This was so easy that I instantly continued trying Arrays.
{% highlight javascript %}
//doing it javascript style
var arr=[];
arr[0]="hello";
arr[1]="world";
java.lang.String.join(" ",arr);
//doing it java style
var stringClass=java.lang.String.class;
var arr2==java.lang.reflect.Array.newInstance(StringClass,2);
{% endhighlight %}
You could argue that using the java style initialization doesn't add anything and complicates stuff overly. But in realty sometime you need complex. Whenever you cannot rely on the automatic type casting system of jjs you have to do it manually.
