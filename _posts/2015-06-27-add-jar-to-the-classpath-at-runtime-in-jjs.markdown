---
layout: post
title:  "add jar to the classpath at runtime in jjs (the hacky way)"
date:   2015-06-27 14:22:54 +0200
tags: java nashorn jjs javascript
---
Normally, the JVM does not allow extending the classpath during runtime. But due to the demand, people found ways around that restriction.
To bring one of the work-around to jjs I wrote the following javascript function.
{% highlight javascript %}
function addUrlToClasspath(pathName){
	var/*java.net.URLClassLoader*/ sysloader = /*(java.net.URLClassLoader) */ java.lang.ClassLoader.getSystemClassLoader();
  var/*java.lang.Class*/ sysclass = java.net.URLClassLoader.class;
     var ClassArray = Java.type("java.lang.Class[]");
     var parameters = new ClassArray(1);
     parameters[0]= java.net.URL.class;
     var/*java.lang.reflect.Method*/ method = sysclass.getDeclaredMethod("addURL", parameters);
     method.setAccessible(true);
     var ObjectArray = Java.type("java.lang.Object[]");
     var array = new ObjectArray(1);
  var/*java.io.File*/ f = new java.io.File(pathName);
  if(f.isFile()){
	var/*java.net.URL*/ u = f.toURL();
    array[0]=u;
    //if(u.toString().endsWith(".jar"))
      method.invoke(sysloader, array);
  }else{
  	var/*File[]*/ listOfFiles = f.listFiles();
  	if(listOfFiles !=null)
  	for (var i = 0; i < listOfFiles.length; i++) {
      if (listOfFiles[i].isFile()) {
        var/*java.net.URL*/ u = listOfFiles[i].toURL();
    	array[0]=u;
      	method.invoke(sysloader, array);
      }
    }
  }
}
{% endhighlight %}
So now, every time you need to add a jar file to the class path you can just do the following.
{% highlight javascript %}
addUrlToClasspath("/Users/jens/tmp/trivium-core.jar");
var mainType =  Java.type("io.trivium.Start");
var args =[];
mainType.main(args);
{% endhighlight %}
