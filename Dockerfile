ARG SOURCE_REPO=https://github.com/openagri-eu/openagri-userdashboard

FROM node:22.17.1 AS builder
LABEL org.opencontainers.image.source=${SOURCE_REPO}

# set working directory
WORKDIR /app

# add node_modules/bin to path
ENV PATH /app/node_modules/.bin:$PATH

# install dependencies
COPY package.json /app/package.json
RUN npm install

COPY . /app

# theme build-time vars (override via docker-compose build args / --build-arg)
ARG VITE_PRIMARY_COLOR
ARG VITE_SECONDARY_COLOR
ARG VITE_BACKGROUND_DEFAULT
ARG VITE_BACKGROUND_PAPER
ENV VITE_PRIMARY_COLOR=${VITE_PRIMARY_COLOR}
ENV VITE_SECONDARY_COLOR=${VITE_SECONDARY_COLOR}
ENV VITE_BACKGROUND_DEFAULT=${VITE_BACKGROUND_DEFAULT}
ENV VITE_BACKGROUND_PAPER=${VITE_BACKGROUND_PAPER}

# build react app
RUN npm run build

# nginx
FROM nginx:alpine

RUN apk update && apk add nginx-module-image-filter

# put app on webserver
COPY nginx/nginx.conf /etc/nginx/templates/default.conf.template
COPY nginx/server.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/ /src/www/app/
