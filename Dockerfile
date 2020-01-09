FROM node:12.2.0-alpine as client

WORKDIR /usr/loanbook/
COPY package*.json ./
RUN npm install
COPY / ./
RUN npm run build

FROM nginx:alpine

COPY /usr/loanbook/build/ /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]