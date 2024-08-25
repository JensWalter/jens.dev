---
title: "An epaper picture frame"
date: 2024-08-25T14:00:00Z
tags:
 - rust
---
I was recently on the lookout for a e-paper version of a picture frame that could be battery powered. After an inital short search, and a short excourse to aliexpress (to build my own version) I found something that resembled what I was looking for.

https://framelabs.eu/en/

This site demonstrates nice picture frames with an embedded e-paper display. It is also battery powered and has quite a long battery life.

Digging through the site, I just found one obstacle (that I also found on aliexpress DIY sets). The display only supports 16 greyscale colors. Which seems a little low, but the restriction comes from the epaper display. So I tried it out by ordering one 13inch picture frame.

Here is an example of a picture I took of a Starbucks coffee cup and then uploaded to the frame.

![before picture of the coffee mug](/assets/2024/PHOTO-2024-07-02-13-34-26.jpg)

![picture of the picture frame displaying the coffee mug picture](/assets/2024/PHOTO-2024-07-02-13-33-07.jpg)

I would say, the picture quality is suprisingly good. So the technical stats do not seem to be such an important factor here. There are however also other pictures which to not resemble such a clear presentation in black and white.

Having figured out this part, it was time to find something to feed this picture frame with online images.

By default, the frame has two mode of operation:
- offline: upload about 20 images to its storage and let the images rotate over time
- online: after a settable amount of time, the frame is connecting via WIFI and download a new image to display

So I cleary wanted to use the online functionality. But soon I hit another obstacle.
1) The frame has no support of any kind of encryption (SSL/TLS)
2) The frame has no support of any kind of authentication
3) The server need to respond with an image already prerendered into a internal image format

For the encryption I contacted the vendor if it is possible to provide a firmware update with some basic encryption support. I think this part is doable with some constraints, but for such a project it would be good enough. Yet, no update so far.

For the authentication, I decided on doing the next best thing. Since the UI presents me with the option to define an arbitrary URL, I can use some query parameters for user data. So that part is also doable, when I start working on my own API server as backend.

Then we come to the third issue, the custom format. There is a python script on github, which show how the format is implemented. For me I tried loading some image from S3 and then run the python script on it, but this regualarly lead to timeouts. So I decided to reimplement the server in Rust and do some shortcuts to prevent the timeout from happening. 

I will explain more on the software in a separate blog post. If you are interested, the full code lives over at github, https://github.com/JensWalter/framelabs-s3-server

