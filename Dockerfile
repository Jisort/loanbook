FROM node:12.2.0-alpine as client

WORKDIR /usr/loanbook/
COPY package*.json ./
RUN npm install
COPY / ./
RUN npm run build

FROM nginx:1.17
COPY build/ /usr/share/nginx/html

EXPOSE 5000