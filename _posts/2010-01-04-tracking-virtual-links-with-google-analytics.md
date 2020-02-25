---
title: tracking virtual links with google analytics
date: 2010-01-04T19:57:00+00:00
layout: post
tags:
  - cloudtheweb.com
  - google analytics
  - javascript
---
Tracking dynamic sites is sometimes a bit tricky. Typically tracking systems are specialized in tracking page views. More sophisticated system have there own way of tracking custom event ([like shown here](http://code.google.com/apis/analytics/docs/tracking/eventTrackerOverview.html)).

Unfortunately I needed to track clicks on a HTML canvas. To make these clicks visible to a tracking system, I wanted to transform each click to virtual URL. That way I could use Google analytics not only for tracking but also for popularity statistics of certain content.

The script for doing so is actually pretty simple.

<pre class='prettyprint'>function trace(url){
var tracker = _gat._getTracker("UA-XXXXXXX-X");
tracker._trackPageview(url);
}
</pre>

Now every time I need to track something I call this function with a custom build URL.
