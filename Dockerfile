FROM alpine as runner
RUN apk add --update --no-cache lighttpd && rm -rf /var/cache/apk/*
COPY public /var/www/localhost/htdocs
CMD ["/usr/sbin/lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf"]
