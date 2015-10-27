FROM ubuntu:latest
MAINTAINER nealhardesty@yahoo.com

RUN apt-get update
RUN apt-get install -y nginx
RUN rm /usr/share/nginx/html/*

COPY . /usr/share/nginx/html/

RUN echo "daemon off;" >> /etc/nginx/nginx.conf

EXPOSE 80

CMD nginx 
