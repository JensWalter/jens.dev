---
title: extracting information from websites through xslt
date: 2009-06-05T19:05:40Z
tags:
  - HTML
  - XSLT
---
Today, most websites feature some kind of feed, so every user who wants to stay in touch, can follow new publications very easily. Some sites support RSS-feeds or mail notification. Although this is pretty common, there are still sites out there who doesn’t. For that purpose I tried to find some easy solution.

First problem here is, how to get the information into some format usable. HTML is not meant for complex data mining operations. So the first thing to look at would be to ignore the HTML part and do string analysis of the content. This can be really difficult, because you lose the structure of the site completely.

Another approach would be, to somehow utilize the DOM tree which the browser uses to obtain the data. One side Effect would be, that data mining could easily be done via DOM operations. But even for that solution I found no engine which provides DOM support for HTML pages which can be build into an application.

Keeping the DOM approach in mind I started to look around for XML solutions which can also parse HTML data (cause they are not so different from one another). So I came to the [libXML](http://xmlsoft.org/) project. They implemented a open-source XML-parser which has also the ability to parse HTML. Although the HTML part is still a bit shaky, it looked quite promising. Now there was still the problem of how to retrieve the information. LibXML provides no DOM interface at all. One thing it does provide is XSLT support. Being an EAI developer this was a good compromise.

So here a little tutorial how to make this work in the shell.

**First choose your site.**

I choosed [this one](http://www.deraktionaer.de/xist4c/web/Online---Musterdepot_id_1261_.htm) (from a german stocks magazine I subscribed) just out of curiousity and I also have to mention, this site already has e-mail notification (so there is no need to actually use this on that site).

**Second, get the XPath** you want to extract. If you have knowledge of XPath this should be easy, if not use something like firebug to get there.

<img class="aligncenter size-full wp-image-305" title="depot_xpath" src="/assets/depot_xpath.png" alt="depot_xpath" width="80%" />

**After that you can start on creating your XSL** script for the transformation. The complete xslt should look something like this:

```xml
<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="text"/>

<xsl:template match="/">
	<xsl:apply-templates select="*"/>
</xsl:template>

<xsl:template match="*">
	<xsl:apply-templates select="*"/>
</xsl:template>

<xsl:template match='//tr[@class="odd" and string-length(td[@class="date"])>0]'>
	<xsl:text>date: </xsl:text>
	<xsl:value-of select='td[@class="date"]'/>
	<xsl:text>,action: </xsl:text>
	<xsl:value-of select='td[@class="action"]'/>
	<xsl:text>,wkn: </xsl:text>
	<xsl:value-of select='td[@class="wkn"]'/>
	<xsl:text>,name: </xsl:text>
	<xsl:value-of select='td[@class="name"]/a'/>
	<xsl:text>,amount: </xsl:text>
	<xsl:value-of select='td[@class="amount"]'/>
	<xsl:text>,value: </xsl:text>
	<xsl:value-of select='td[@class="value"]'/>
	<xsl:text>
</xsl:text>
	<xsl:apply-templates/>
</xsl:template>

</xsl:stylesheet>
```

If you need more detail one XSLT you should check out [w3schools](http://www.w3schools.com/xsl/default.asp). They have some good tutorials for starters.

The important part of this XSLT is the last template section. This is actually the part you have to use to get to your information. First comes the template match. Here you have to insert the XPath you have obtained before. After that you have to select (via XPath) what information you want and formulate how you want this to be written out.

**Now you just have to put one and one together** and you have your data mining solution.

I inserted the following bash script into my cron table and now have a subscription to this site.

```bash
curl -s http://www.deraktionaer.de/xist4c/web/Online---Musterdepot_id_1261_.htm | sed -e 's/&/&/g' - | xsltproc -html online.xslt -
```

Now that you have the raw information it should be no problem to get this into some mailinglist oder database for future use.

PS: In case you wonder about the sed in the statement. As I already mentioned the libXML is not really the most flexible solution for parsing HTML. Especially when it comes to HTML codes like ©, libXML resigns with an error. To avoid this I transformed all ampersands to escaped ampersands.
