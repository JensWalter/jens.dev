---
title: Streaming editor improved
date: 2009-01-14T15:51:03+00:00
layout: post
tags:
  - yahoo finance
---
I recently ran into the situation that I needed a streaming editor which does not work line-wise. I was receiving an html stream and wanted to remove all the html tags.

Although I tried different existing editors like sed or replace, non of it got it right for me. All implementations waited for a newline to work with the data. I also tried disabling every possible buffer but the problem still persists.

So after quite some trial and error I started writing my own little program which could do the job. So here is the code:

{% highlight c %}
#include &lt;stdio.h>
#include &lt;string.h>

int main (int argc, char* argv[])
{
  setbuf(stdin,NULL);
  char c;
  int tag =0;
  do {
    c = getchar();
    if (c == '&lt;' && tag==0) ++tag;
    if (c == '>' && tag>0) {--tag; c='\n';}
    if (tag ==0 ){
      putchar(c);
      fflush(stdout);
    }
  } while (c != EOF);
  return 0;
}
{% endhighlight %}

Just compile it with the following statement and it will filter everything which comes from stdin.

{% highlight bash %}
gcc -fPIC -Wall -otransform transform.c
{% endhighlight %}

Here is a sample statement of how to use it:

{% highlight bash %}
curl -N -s google.com | ./transform
{% endhighlight %}
