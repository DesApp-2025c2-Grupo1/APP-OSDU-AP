# Multi-stage build para Frontend React con Vite
FROM node:24-alpine AS builder

ARG VITE_API_URL
ARG VITE_USER_MOCK=false

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_USER_MOCK=$VITE_USER_MOCK

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/America/Argentina/Buenos_Aires /etc/localtime \
    && echo "America/Argentina/Buenos_Aires" > /etc/timezone \
    && apk del tzdata

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
