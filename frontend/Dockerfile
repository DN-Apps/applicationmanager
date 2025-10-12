# frontend/Dockerfile

# --- Build stage ---
FROM node:18-alpine AS build
WORKDIR /app

# Nur Manifest(e) kopieren & reproduzierbar installieren
COPY package*.json ./
RUN npm ci

# Restlichen Code kopieren
COPY . .

# API-URL als Build-Arg -> env für CRA
ARG API_PUBLIC_URL
ENV REACT_APP_API_URL=$API_PUBLIC_URL
ENV REACT_APP_API_BASE_URL=$API_PUBLIC_URL

# Build
RUN ./node_modules/.bin/react-scripts build

# --- Runtime stage ---
FROM nginx:alpine

# Eigene Nginx-Config mit SPA-Fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Statisches Build deployen
COPY --from=build /app/build /usr/share/nginx/html

HEALTHCHECK CMD wget -qO- http://localhost:80/ >/dev/null || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
