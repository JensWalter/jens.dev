---
title: Tibco EMS with database backend (postgresql)
date: 2008-11-16T20:48:11+00:00
layout: post
tags:
  - EMS
  - postgres
  - TIBCO
---
I recently tried to build a JMS Server with database backend. The chosen product was the TIBCO EMS Server. The Server brings its own database support over hibernate.

Unfortunately TIBCO supports only Oracle,Mysql and DB2 by default. Lucky me, I needed an installation for Postgres but this shouldn’t be a big deal, because hibernate supports postgres as well. You just have to modify the hibernate config.

First you should install the EMS server and hibernate (version provided by Tibco). After that let’s start configuring.

To have everything in the database you need 3 databases (3 separate EMS stores). For me I used the following 3 stores:

  1. emsmeta -> for metadata content
  2. emsnf -> for nonfailsafe data
  3. emsf -> for failsafe data

I used the same account for all 3 databases (just easier for testing purposes).

Setup the stores in the stores.conf in the EMS folder:

{% highlight bash %}
[$sys.meta]
type=dbstore
dbstore_driver_url=jdbc:postgresql://localhost/emsmeta
dbstore_driver_username=ems
dbstore_driver_password=ems

[$sys.nonfailsafe]
type=dbstore
dbstore_driver_url=jdbc:postgresql://localhost/emsnf
dbstore_driver_username=ems
dbstore_driver_password=ems

[$sys.failsafe]
type=dbstore
dbstore_driver_url=jdbc:postgresql://localhost/emsf
dbstore_driver_username=ems
dbstore_driver_password=ems
{% endhighlight %}

After that you have to change you tibemsd.conf file.The following line is a sample what you should add. Additionally you should add the path to your jdbc driver (in this sample the last parameter – change it to your config). You also have to add the path to your JVM (here it is the debian lenny default).

{% highlight bash %}
dbstore_classpath       = ../../../components/eclipse/plugins/com.tibco.tpcl.org.hibernate_3.2.5.001/hibernate3.jar:../../../components/eclipse/plugins/com.tibco.tpcl.org.com.mchange.c3p0_0.9.1.001/c3p0-0.9.1.jar:antlr-2.7.6.jar:asm-attrs.jar:asm.jar:cglib-2.1.3.jar:commons-collections-2.1.1.jar:commons-logging-1.0.4.jar:dom4j-1.6.1.jar:ehcache-1.2.3.jar:jta.jar:/usr/local/bin/oracledrivers/lib/ojdbc5.jar:/home/jens/tibco/tpcl/5.6/jdbc/postgresql-8.3-603.jdbc3.jar

## db section
#dbstore_driver_name     = oracle.jdbc.driver.OracleDriver
#dbstore_driver_dialect  = org.hibernate.dialect.Oracle10gDialect
dbstore_driver_name     = org.postgresql.Driver
dbstore_driver_dialect  = org.hibernate.dialect.PostgreSQLDialect
jre_library             = /usr/lib/jvm/java-6-sun/jre/lib/i386/server/libjvm.so
{% endhighlight %}

As you can see changing databases is easy. You just have to change the driver\_name and driver\_dialect of hibernate.

After that you have the basic configuration ready. Next thing to do is to initialize the database. For that task Tibco provides a tool which generates the proper sql-statements.

You can run the following command in your shell and get the sql as output.

{% highlight bash %}
java -jar tibemsd_util.jar -tibemsdconf tibemsd.conf -createall
{% endhighlight %}

For some reason the create sql-statements had no ‘;’ at the end of every command. So you can’t just pipe the output to pgsql. You have to do it old school.

After that you can start the EMS Server and it stores all data to the selected database.
