# --- Build stage ---
FROM node:18-alpine AS build
WORKDIR /app

# Nur Manifest(e) kopieren & reproduzierbar installieren
COPY package*.json ./
RUN npm ci

# Restlichen Code kopieren
COPY . .

# Build (API-URL wird NICHT mehr eingebrannt)
RUN ./node_modules/.bin/react-scripts build

# --- Runtime stage ---
FROM nginx:alpine

# Tools für Healthcheck & Templating
RUN apk add --no-cache curl sed

# Eigene Nginx-Config mit SPA-Fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Statisches Build deployen
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html

# Runtime-Config Templating
COPY nginx-entrypoint.sh /docker-entrypoint.d/50-config.sh
RUN chmod +x /docker-entrypoint.d/50-config.sh

# Healthcheck über curl statt wget
HEALTHCHECK CMD curl -fsS http://localhost:80/ >/dev/null || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
