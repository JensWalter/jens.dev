---
layout: post
title:  "installing the nchan module for nginx on a gentoo based system"
date:   2016-10-16 15:49:54 +0200
tags: nginx
---
I recently encountered a requirement that could be fulfilled by the nchan module for nginx.
nchan does provide prebuilt packages for Archlinux, Debian, Ubuntu and Fedora. Sadly, there is nothing there for gentoo users. So I directly skipped ahead to the "build from source" section.
The instructions where pretty basic:

* clone the github repo
* configure nginx with ./configure --add-module=path/to/nchan
* build

For me this lead to the following result:
{% highlight bash %}
EXTRA_ECONF="--add-module==/tmp/nchan-1.0.3" emerge -avt nginx

[ebuild   R    ] www-servers/nginx-1.10.1::gentoo  USE="http http-cache http2 ipv6 luajit pcre ssl -aio -debug -libatomic (-libressl) -pcre-jit -rtmp (-selinux) -threads -vim-syntax" NGINX_MODULES_HTTP="auth_basic auth_request charset gunzip gzip gzip_static headers_more limit_conn limit_req lua proxy rewrite -access -addition -ajp -auth_ldap -auth_pam -autoindex -browser -cache_purge -dav -dav_ext -degradation -echo -empty_gif -fancyindex -fastcgi -flv -geo -geoip -image_filter -map -memc -memcached -metrics -mogilefs -mp4 -naxsi -perl -push_stream -random_index -realip -referer -scgi -secure_link -security -slice -slowfs_cache -spdy -split_clients -ssi -sticky -stub_status -sub -upload_progress -upstream_check -upstream_ip_hash -userid -uwsgi -xslt" NGINX_MODULES_MAIL="-imap -pop3 -smtp" NGINX_MODULES_STREAM="-access -limit_conn -upstream" 0 KiB

Total: 1 package (1 reinstall), Size of downloads: 0 KiB
{% endhighlight %}

At first this looks fine, but it doesn't grab the module for whatever reason.

So looking for an alternative route, I found an overlay which packages nginx with nchan.
To set up the overlay I did the following.
{% highlight bash %}
#install layman as overlay manager
emerge layman
#add mva as overlay
layman -a mva
#add overlays to the make.conf
echo "source /var/lib/layman/make.conf" >> /etc/portage/make.conf
{% endhighlight %}
After adding the overlay, I could simply emerge nginx and add the nchan module to the build settings.

{% highlight bash %}
emerge -av www-servers/nginx::mva

[ebuild  NS   ~] www-servers/nginx-1.11.5:mainline::mva [1.10.1:0::gentoo] USE="http http-cache ipv6 luajit pam pcre ssl -aio -debug -http2 -libatomic -mail -pcre-jit -perftools -rrd (-selinux) -stream -threads -vim-syntax" NGINX_MODULES_HTTP="auth_basic auth_request charset gunzip gzip gzip_static headers_more limit_conn limit_req lua nchan ndk proxy rewrite -access -addition -ajp -array_var -auth_ldap -auth_pam -autoindex -browser -cache_purge -coolkit -ctpp -dav -dav_ext -degradation -drizzle -echo -empty_gif -encrypted_session -enmemcache -ey_balancer -fancyindex -fastcgi -flv -form_input -geo -geoip -hls_audio -iconv -image_filter -lua_upstream -map -memc -memcached -metrics -mogilefs -mp4 -naxsi -njs -pagespeed -passenger -perl -postgres -push_stream -random_index -rds_csv -rds_json -realip -redis -referer -replace_filter -scgi -secure_link -security -set_misc -slice -slowfs_cache -split_clients -srcache -ssi -sticky -stub_status -sub -supervisord -tcpproxy -upload_progress -upstream_check -upstream_hash -upstream_ip_hash -upstream_keepalive -upstream_least_conn -upstream_zone -userid -uwsgi -v2 -xslt -xss" NGINX_MODULES_MAIL="-imap -pop3 -smtp" NGINX_MODULES_STREAM="-access -geo -geoip -limit_conn -lua -map -return -split_clients -upstream_hash -upstream_least_conn -upstream_zone" RUBY_TARGETS="ruby20 ruby21 (-jruby) -ruby22 -ruby23" 2141 KiB
[uninstall     ] www-servers/nginx-1.10.1::gentoo  USE="http http-cache http2 ipv6 luajit pcre ssl -aio -debug -libatomic (-libressl) -pcre-jit -rtmp (-selinux) -threads -vim-syntax" NGINX_MODULES_HTTP="auth_basic auth_request charset gunzip gzip gzip_static headers_more limit_conn limit_req lua proxy rewrite -access -addition -ajp -auth_ldap -auth_pam -autoindex -browser -cache_purge -dav -dav_ext -degradation -echo -empty_gif -fancyindex -fastcgi -flv -geo -geoip -image_filter -map -memc -memcached -metrics -mogilefs -mp4 -naxsi -perl -push_stream -random_index -realip -referer -scgi -secure_link -security -slice -slowfs_cache -spdy -split_clients -ssi -sticky -stub_status -sub -upload_progress -upstream_check -upstream_ip_hash -userid -uwsgi -xslt" NGINX_MODULES_MAIL="-imap -pop3 -smtp" NGINX_MODULES_STREAM="-access -limit_conn -upstream"
{% endhighlight %}

Now you can see, that the overlay is packed with third party modules, including the nchan module.
