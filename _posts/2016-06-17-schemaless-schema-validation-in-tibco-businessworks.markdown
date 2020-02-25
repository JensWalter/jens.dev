---
layout: post
title:  "schemaless schema validation in TIBCO BusinessWorks"
date:   2016-06-17 17:06:54 +0200
tags: tibco businessworks
---
Usually, schema validation in BusinessWorks is done pretty straight forward. You get an xml, known the schema and just run a ParseXml activity. The problem becomes more complicated if you have to validate a xml which you have no knowledge of which schema it derived from. In my case, I had a folder full of schemas which I had to validate the incoming xml against.

To achieve this,I came up with the following solution. This way, the java activity validates against any in the project registered schema.
![xsd validation process](/assets/validateXsd.png)

content of the java code activity:
{% highlight java %}
//get the default tibco parser
com.tibco.xml.datamodel.parse.DefaultXiParser parser =
    new com.tibco.xml.datamodel.parse.DefaultXiParser();
//transform string into a xml inputsource
org.xml.sax.InputSource inputsource =
    new org.xml.sax.InputSource(new StringReader(xml));
//parse the xml with the Tibco RepoAgent as schema provider
//valide against any matching schema that exists within the project
parser.parse( inputsource,
  com.tibco.pe.core.Engine.getRepoAgent().getSmNamespaceProvider());
{% endhighlight %}
