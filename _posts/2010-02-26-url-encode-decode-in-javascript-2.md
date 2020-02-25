---
title: URL encode / decode in JavaScript
date: 2010-02-26T21:57:13+00:00
layout: post
tags:
  - javascript
---
Decoding and Encoding URLs in JavaScript should be a pretty easy thing to do especially since all browsers still have the functionality built-in. Interestingly no browser allows the JavaScript runtime to use this feature. So I had to write it for myself.

The code I came up with is far from perfect but it worked for me. To decode an URL use url_decode(url) and to reverse it just call the utf16to8 function. The rest does your browser for you.

{% highlight javascript %}function url_decode(str){
var hex = /^[0-9a-fA-F]{2}/;
var out='';
var arr = str.split('%');
if(arr.length&lt;2) return str;
for(var i=0;i&lt;arr.length;i++)
{
  /*look for hex values */
  if(hex.exec(arr[i])) {
    out += String.fromCharCode(parseInt(arr[i].substring(0,2),16))+arr[i].substring(2,arr[i].length);
  } else { if(i==0) out+=arr[i]; else out+='%'+arr[i];
  }
}
return utf8to16(out);
}

function utf16to8(str) {
    var out, i, len, c;

    out = "";
    len = str.length;
    for(i = 0; i &lt; len; i++) {
	c = str.charCodeAt(i);
	if ((c >= 0x0001) && (c &lt;= 0x007F)) {
	    out += str.charAt(i);
	} else if (c > 0x07FF) {
	    out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
	    out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
	    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
	} else {
	    out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
	    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
	}
    }
    return out;
}

function utf8to16(str) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = str.length;
    i = 0;
    while(i &lt; len) {
	c = str.charCodeAt(i++);
	switch(c >> 4)
	{
	  case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
	    // 0xxxxxxx
	    out += str.charAt(i-1);
	    break;
	  case 12: case 13:
	    // 110x xxxx   10xx xxxx
	    char2 = str.charCodeAt(i++);
	    out += String.fromCharCode(((c & 0x1F) &lt;&lt; 6) | (char2 & 0x3F));
	    break;
	  case 14:
	    // 1110 xxxx  10xx xxxx  10xx xxxx
	    char2 = str.charCodeAt(i++);
	    char3 = str.charCodeAt(i++);
	    out += String.fromCharCode(((c & 0x0F) &lt;&lt; 12) |
					   ((char2 & 0x3F) &lt;&lt; 6) |
					   ((char3 & 0x3F) &lt;&lt; 0));
	    break;
	}
    }
    return out;
}
{% endhighlight %}
