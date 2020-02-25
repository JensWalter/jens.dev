---
layout: post
title:  "authenticate with the bondora API manually"
date:   2016-03-08 13:38:54 +0200
tags: oauth bondoraAPI
---
Bondora uses OAuth for its API authentication, while this is great for external service providers owning their own domain/app, it is also relatively cumbersome for stand alone applications/scripts.

So here are the steps I did to acquire a refresh token for using the API with curl.

First follow the link of the documentation to the ["google OAuth playground"](https://developers.google.com/oauthplayground/#step1&scopes=BidsRead%20BidsEdit%20Investments%20SmBuy%20SmSell&url=https%3A//&content_type=application/json&http_method=GET&useDefaultOauthCred=unchecked&oauthEndpointSelect=Custom&oauthAuthEndpointValue=https%3a%2f%2fwww.bondora.com/oauth/authorize&oauthTokenEndpointValue=https%3a%2f%2fapi.bondora.com/oauth/access_token&includeCredentials=unchecked&accessTokenType=bearer&autoRefreshToken=unchecked&accessType=offline&forceAprovalPrompt=checked&response_type=code).

![playground](/assets/playground-before-anything.png)

Most of the configuration should be preset by the link used.
If you need it, you can add additional rights to the request (in my case reports where not part of the url):
"BidsRead BidsEdit Investments SmBuy SmSell ReportRead ReportCreate"

On the other side, you need to register an app with bondora. You can set most of the values as you like, but you must set the callback URL back to google "https://developers.google.com/oauthplayground".

![bondora registration](/assets/bondora registration.png)

After completing the registration, take the client id and secret and paste it into the google playground.

Clicking the authorize API button will initiate the process.

![playground authorize](/assets/playground-authorize.png)

You get redirected to bondora to authorize the application with the requested permissions.

![bondora authorize](/assets/bondora authorize.png)

After accepting you will be redirected back to google.

![google before token request](/assets/playground with token.png)

Now you only have to request a token by clicking the exchange authorization code for tokens.

![playground with token](/assets/playground with token2.png)

Now you got you token. Please keep in mind that the access token invalidates relatively quick and you should also keep the refresh token for background jobs.
