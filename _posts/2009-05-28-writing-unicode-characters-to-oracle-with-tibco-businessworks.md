---
title: writing Unicode characters to Oracle with TIBCO BusinessWorks
date: 2009-05-28T14:19:33+00:00
layout: post
tags:
  - BusinessWorks
  - Oracle
  - TIBCO
---
As always, I get the most puzzling mysteries from work requirements. I got the requirement of sending an email with Russian characters through TIBCO BusinessWorks. So far so good. BusinessWorks has full support of Unicode, so it should be not a problem to get this one running. Lucky me the reality looks different.

For this email system a database template system was used and of course the database was an upgraded Oracle 10g, so all the columns (for historic reasons) were Latin-1 and not Unicode.

But a simple Google query even showed a solution for this problem. Oracle introduced, exactly for this case, a new data type (NCHAR – means Unicode character). After changing the table column from CLOB to NCLOB the database should have the ability to store Unicode characters, even if it is running in Latin-1 mode.

First thing I tried, was to insert a valid Russian email template into the database and lucky me, the text which was stored in the database, was still a bunch of invalid Latin-1 characters (character code 0xbf).

After quite some googling I came to [this Oracle article](http://www.Oracle.com/technology/sample_code/tech/java/codesnippet/jdbc/nchar/readme.html). In that article Oracle explains a bit more how to force the JVM to use Unicode characters for the JDBC connection instead of the character set presented from the database. With nothing to lose I tried it in my designer via modifying the designer.tra (I just appended the following parameter).

<pre>-DOracle.jdbc.defaultNChar=true
</pre>

After that, it worked like a charm. Now it was possible to write Unicode characters to the new created NCLOB columns in the database.

After creating the template and doing a trial run I got curious what would happen if I removed that parameter and tried to read from the Unicode column. To my surprise it worked out-of-box. So you can read Unicode characters from an Oracle database without modifying anything. The indifferences just happen if you want to write via JDBC.

To round this up this bug is not limited to TIBCO BusinessWorks. I also tried it with a tool named [DbVisualizer](http://www.minq.se/products/dbvis/) (also Java based) and (what really annoys me, because it is c-based and shouldn’t have this JDBC bug) [tora](http://tora.sf.net). All showed the same result on writing to that database.
