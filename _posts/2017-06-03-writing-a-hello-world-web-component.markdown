---
layout: post
title:  "writing a hello world web component"
date:   2017-06-03 10:08:54 +0200
tags: webcomponents javascript html
---
Web components are the shiny new thing on the horizon for web development. Sadly browser support is not just there, but it seems to be growing pretty quickly.

For an up-to-date overview, you can head over to [caniuse.com](https://caniuse.com/#search=web%20components) for a summary.

Starting small.

A web component is Javascript class, which defines an HTML element with its own layout, structure and behavior.

So the most basic web component would look like this.

{% highlight javascript %}
class HelloWorld extends HTMLElement {
}
{% endhighlight %}

To use this element, this class has to be registered within the browser with a given alias.

{% highlight javascript %}
customElements.define('hello-world', HelloWorld);
{% endhighlight %}

Important here is, that all custom element aliases must contain a '-'. Otherwise, it could lead to conflicts with existing HTML elements.

Now I can use this element by just adding a corresponding element to the DOM.

{% highlight HTML %}
<body>
  <hello-world></hello-world>
</body>
{% endhighlight %}

This concludes the basic structure of what has to be defined. Expanding on that, I wanted to add some actual content to my web component, to make it somewhat more useful.

Since this control is called hello-world, it should say "hello world" whenever it is injected into the DOM. To achieve this, I have to add a constructor to my class.

{% highlight javascript %}
class HelloWorld extends HTMLElement {
  constructor() {
    super();
    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = `<p>hello world</p>`;
  }
}
{% endhighlight %}

All this together in one HTML file would look like this.
{% highlight HTML %}
<html>
<head>
  <script>
  class HelloWorld extends HTMLElement {
    constructor() {
      super();
      // Attach a shadow root to the element.
      let shadowRoot = this.attachShadow({mode: 'open'});
      shadowRoot.innerHTML = `<p>hello world</p>`;
    }
  }
  customElements.define('hello-world', HelloWorld);
  </script>
</head>
<body>
  <hello-world></hello-world>
</body>
</html>
{% endhighlight %}

If your browser supports it, the following iframe gets filled with the hello world control.

<iframe style="border:1px solid black;width:90px;height:30px;margin-left:20px;" src="/assets/wc-hello-world.html"></iframe>


[complete hello world sample html][1]

[1]:{{ site.url }}/assets/wc-hello-world.html
