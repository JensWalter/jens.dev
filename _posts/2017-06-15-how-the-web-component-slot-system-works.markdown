---
layout: post
title:  "how the web component slot system works"
date:   2017-06-15 10:08:54 +0200
tags: webcomponents javascript html
---
In my [previous post](https://apimeister.com/2017/06/14/how-web-component-attributes-work.html) I described how to send data in form of attributes to a web component. Since this mechanism is only applicable for simple values, there also is a separate mechanism for inserting complex values.

Let me explain the goal first.
If I have a web component which consists of the following internal structure.
{% highlight HTML %}
<hello-card>
    #shadow-root
    <div id="header">
      <p></p>
    </div>
    <div id="content">
      <p></p>
    </div>
</hello-card>
{% endhighlight %}

To use this component, you have to insert it into the DOM and it will render a visual representation.
If I now want to fill those empty placeholders with content I have to use HTML elements within the component.

{% highlight HTML %}
<hello-card>
  <span>header line 1</span>
  <span>content line 1</span>
</hello-card>
{% endhighlight %}

With this definition, the browser no longer knows where to place the header line or the content line within my control.

To tackle that issue, the spec proposes the use of "slot" elements, which will represent placeholders which can later be filled by content.

Slot elements can be placed anywhere within the component. It is preferred that those slots are named (if only one slot exists, the name can be omitted).

This is what a web component with slots would look like.
{% highlight HTML %}
class HelloWorld extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.innerHTML = `
        <div id="header">
          <slot name="headerLine"></slot>
        </div>
        <div id="body">
          <slot name="contentLine"></slot>
        </div>`;
  }
}
{% endhighlight %}

To use those predefined slots, the attached element has to name the slot it wants to be placed in.

{% highlight HTML %}
<hello-card>
  <h1 slot="headerLine">Hello World</h1>
  <p slot="contentLine">Isn't it a fine day.</p>
</hello-card>
{% endhighlight %}

Now the control gets rendered with the header and content part at the right places.
