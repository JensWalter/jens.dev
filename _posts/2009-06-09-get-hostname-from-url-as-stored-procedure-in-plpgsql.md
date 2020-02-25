---
title: get hostname from url as stored procedure in plpgsql
date: 2009-06-09T00:38:35+00:00
layout: post
tags:
  - postgres
---
I just needed a simple stored procedure to extract the hostname from any given URL. So here is what I came up with.

{% highlight sql %}
CREATE OR REPLACE FUNCTION getHostFromUrl(p_url character varying)
  RETURNS character varying AS
$BODY$
declare
begin
  return substring(p_url from  'http.?://(.*?)/(.*)');
end;
$BODY$
  LANGUAGE 'plpgsql' VOLATILE
  COST 100;
{% endhighlight %}
