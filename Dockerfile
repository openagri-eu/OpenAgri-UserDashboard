ARG SOURCE_REPO=https://github.com/openagri-eu/openagri-userdashboard

FROM node:22.17.1 AS builder
LABEL org.opencontainers.image.source=${SOURCE_REPO}

# set working directory
WORKDIR /app

# add node_modules/bin to path
ENV PATH /app/node_modules/.bin:$PATH

# install dependencies
COPY package*.json ./
RUN npm ci

COPY . /app

# theme build-time vars (override via docker-compose build args / --build-arg)
ARG VITE_PRIMARY_COLOR
ARG VITE_SECONDARY_COLOR
ARG VITE_BACKGROUND_DEFAULT
ARG VITE_BACKGROUND_PAPER
ARG VITE_APP_NAME
ARG VITE_APP_SHORT_NAME
ARG VITE_APP_DESCRIPTION
ENV VITE_PRIMARY_COLOR=${VITE_PRIMARY_COLOR}
ENV VITE_SECONDARY_COLOR=${VITE_SECONDARY_COLOR}
ENV VITE_BACKGROUND_DEFAULT=${VITE_BACKGROUND_DEFAULT}
ENV VITE_BACKGROUND_PAPER=${VITE_BACKGROUND_PAPER}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV VITE_APP_SHORT_NAME=${VITE_APP_SHORT_NAME}
ENV VITE_APP_DESCRIPTION=${VITE_APP_DESCRIPTION}

# optional logo override: if LOGO_URL is set, fetch and overwrite public/logo.png
ARG LOGO_URL
RUN if [ -n "$LOGO_URL" ]; then \
        curl -fsSL "$LOGO_URL" -o public/logo.png \
        && echo "Logo replaced from $LOGO_URL"; \
    else \
        echo "Using default public/logo.png"; \
    fi

# regenerate favicon + PWA icons from current public/logo.png
RUN npm run generate-pwa-assets

# build react app
RUN npm run build

# nginx
FROM nginx:alpine

RUN apk update && apk add nginx-module-image-filter

# put app on webserver
COPY nginx/nginx.conf /etc/nginx/templates/default.conf.template
COPY nginx/server.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist/ /src/www/app/
