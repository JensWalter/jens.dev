---
layout: post
title:  "how web component attributes work"
date:   2017-06-14 10:08:54 +0200
tags: webcomponents javascript html
---
My [last post](https://apimeister.com/2017/06/03/writing-a-hello-world-web-component.html) described how to build a web component. Any form of data handling was intentionally left out.

So here comes part 2 in my web component series on how to handle data in form of attributes.
In HTML it would look like this.

{% highlight HTML %}
<hello-world name="jens"></hello-world>
{% endhighlight %}

Since the whole web component exists within one javascript class, the data handling has to be done within that class. The first thing that came to my mind was to extend the constructor to read all attributes on creation.

{% highlight javascript %}
class HelloWorld extends HTMLElement {
  constructor() {
    super();
    // Attach a shadow root to the element.
    let shadowRoot = this.attachShadow({mode: 'open'});
    let name = this.getAttribute("name");
    shadowRoot.innerHTML = `<p>hello ${name}</p>`;
  }
}
{% endhighlight %}

Sadly this is discouraged through the [specification](https://w3c.github.io/webcomponents/spec/custom/#custom-element-conformance).

> 2.2 Requirements for custom element constructors
>
> The element's attributes and children must not be inspected, as in the non-upgrade case none will be present, and relying on upgrades makes the element less usable.

So going forward I stumbled on the following statement:

> In general, work should be deferred to connectedCallback as much as possible—especially work involving fetching resources or rendering. However, note that connectedCallback can be called more than once, so any initialization work that is truly one-time will need a guard to prevent it from running twice.

So let's try putting the logic for reading state information into the connectedCallback.

{% highlight javascript %}
class HelloWorld extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
  }
  connectedCallback(){
    let name = this.getAttribute("name");
    this._shadowRoot.innerHTML = `<p>hello ${name}</p>`;
  }
}
{% endhighlight %}

This way, all newly constructed elements will read their values the moment they get attached to the DOM.

This is fine so far, but this solution only reads the data once. So to update this component it has to be destroyed and recreated, which is a rather wasteful operation. To make this component more useful, I needed some in-place update mechanism.

For that case, the spec introduces a separate mechanism.

First I had to define what attributes are monitored in an "observedAttributes" callback. For all defined attributes a second callback named "attributeChangedCallback" is invoked with the changed attribute given as parameter. All other attributes (not included in the array) will not trigger any action. This comes in handy since you don't want to be notified if, for example, a CSS attribute changes.

In my case, this would lead to the following addition.

{% highlight javascript %}
static get observedAttributes(){
  return ["name"];
}
attributeChangedCallback(name, oldValue, newValue) {
  this._shadowRoot.innerHTML = `<p>hello ${newValue}</p>`;
}
{% endhighlight %}

Now, every time the attribute is changed, the content gets updated.


So here the complete copy/paste sample to try it out.


{% highlight javascript %}
class HelloWorld extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
  }
  static get observedAttributes(){
    return ["name"];
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this._shadowRoot.innerHTML = `<p>hello ${newValue}</p>`;
  }
  connectedCallback(){
    let name = this.getAttribute("name");
    this._shadowRoot.innerHTML = `<p>hello ${name}</p>`;
  }
}
customElements.define('hello-world', HelloWorld);
{% endhighlight %}

Now you can use this control with the following code.

{% highlight HTML %}
<body>
  <hello-world name="jens"></hello-world>
</body>
{% endhighlight %}
