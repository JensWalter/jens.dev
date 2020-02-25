---
layout: post
title:  "embed a github commit log into markdown"
date:   2016-03-10 20:52:54 +0200
tags: api javascript github
---
I started to write some documentation for a project of mine and I wanted to embed a change log on certain elements in the documentation.
Since my documentation format is mkDocs, all documents are written in markdown.

So here is what I came up with:
{% highlight html %}
**last commits**

<div id='commits' data-path='src/io/trivium/extension/'></div>
<script src='https://code.jquery.com/jquery-2.2.1.min.js'></script>
<script>
var path = $('#commits').data('path');
var url = 'https://api.github.com/repos/trivium-io/trivium/commits?path='+path;
$.ajax({type:'GET',
        url:url,
        success: function(data){
    var str="<table class='docutils'><thead><tr><th>message</th><th>date</th><th>author</th><th>link</th></tr></thead><tbody>";
    for(var idx=0;idx<data.length && idx<10;idx++){
      var one = data[idx];
      var d = one.commit.author.date.substr(0,10);
      var t = one.commit.author.date.substr(11,10);
      str+="<tr><td>"+one.commit.message+"</td><td>"
          +d+" "+t+"</td><td>"
          +one.commit.author.name+"</td><td>"
          +"<a href='"+one.html_url+"'>"+one.sha.substr(0,7)+"</a></td></tr>";
    }
    str+="</tbody></table>";
    $('#commits').html(str);
}});
</script>
{% endhighlight %}

So the script queries the github api for the commit log of a certain resource. With that response, the script build a HTML table with all the relevant content.

In real life this snippet evaluated looks like this:

<div id='commits' data-path='src/io/trivium/extension/'></div>
<script src='https://code.jquery.com/jquery-2.2.1.min.js'></script>
<script>
var path = $('#commits').data('path');
var url = 'https://api.github.com/repos/trivium-io/trivium/commits?path='+path;
$.ajax({type:'GET',
        url:url,
        success: function(data){
    var str="<table class='docutils'><thead><tr><th>message</th><th>date</th><th>author</th><th>link</th></tr></thead><tbody>";
    for(var idx=0;idx<data.length && idx<10;idx++){
      var one = data[idx];
      var d = one.commit.author.date.substr(0,10);
      var t = one.commit.author.date.substr(11,10);
      str+="<tr><td>"+one.commit.message+"</td><td>"
          +d+" "+t+"</td><td>"
          +one.commit.author.name+"</td><td>"
          +"<a href='"+one.html_url+"'>"+one.sha.substr(0,7)+"</a></td></tr>";
    }
    str+="</tbody></table>";
    $('#commits').html(str);
}});
</script>
