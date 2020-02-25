---
layout: post
title:  "Java SPI - a simple hello world service"
date:   2016-07-14 15:13:54 +0200
tags: java
---
I recently needed a simple example of an SPI implementation I could send around as  copy and paste template. After some looking around I found some tutorials, but most of them were rather heavy in the implementation and are thereby loosing the point of being a simple extension system within the JDK.
If you're looking for a more complete introduction into SPI, just go for the [oracle tutorial](https://docs.oracle.com/javase/tutorial/ext/basics/spi.html).

So what I wanted to build was a simple service (HelloService), which defines an interface but looks for its implementation in the classpath at runtime (something SPI was built for).

So i needed two projects to start with.

**Project 1 HelloService**

![hello service project structure](/assets/serviceLoader.png)

HelloService.java is the interface that has to be implemented.
{% highlight java %}
package com.apimeister.spi;

public interface HelloService {
	public void sayHello();
}
{% endhighlight %}

Start.java is the starting point for running this jar.
{% highlight java %}
package com.apimeister.spi;

import java.util.Iterator;
import java.util.ServiceLoader;

public class Start {

	public static void main(String[] args) {
		ServiceLoader<HelloService> loader =ServiceLoader.load(HelloService.class);
		Iterator<HelloService> iter = loader.iterator();
		while(iter.hasNext()){
			iter.next().sayHello();
		}
		System.out.println("done");
	}
}
{% endhighlight %}

Running this project (after exporting it as jar file) leads to the following output.
{% highlight bash %}
C:\Temp>java -cp helloService.jar com.apimeister.spi.Start

done
{% endhighlight %}

Now lets add some implementation.

**Project 2 HelloGermany**

![hello service implementation project structure](/assets/serviceImpl.png)

The project consists of 2 files.
HelloService.java implements the service.
{% highlight java %}
package com.apimeister.spi.germany;

public class HelloService implements com.apimeister.spi.HelloService{

	@Override
	public void sayHello() {
		System.out.println("hello Germany");
	}
}
{% endhighlight %}

Second file (**com.apimeister.spi.HelloService**) is the service definition manifest.
{% highlight java %}
com.apimeister.spi.germany.HelloService
{% endhighlight %}

The name of the file defines the service that has to be hooked into. The content of the file is the classpath of the implementation.

After exporting this project as separate JAR-file, I can re-run my project with both jar in the classpath in the command prompt.
{% highlight bash %}
C:\Temp>java -cp helloGermany.jar;helloService.jar com.apimeister.spi.Start
hello Germany
done
{% endhighlight %}
Now the external implementation is called without changing any of the original code.
