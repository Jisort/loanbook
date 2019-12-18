FROM node:12.2.0-alpine as client

WORKDIR /usr/loanbook/
COPY package*.json ./
RUN npm install
COPY / ./
RUN npm run build