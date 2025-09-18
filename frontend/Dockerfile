# --- Build-Stage ---
FROM node:18-alpine AS build
WORKDIR /app

# 1. Nur package.json / lockfiles kopieren
COPY package*.json ./

# 2. Abhängigkeiten installieren (inkl. devDependencies für Build)
RUN npm install

# 3. Restlichen Code kopieren
COPY . .

# 4. API-URL als Build-Argument (eine Quelle)
ARG API_PUBLIC_URL
# Beide gängige CRA-Variablen setzen – egal welche dein Code nutzt:
ENV REACT_APP_API_BASE_URL=$API_PUBLIC_URL
ENV REACT_APP_API_URL=$API_PUBLIC_URL

# 5. Rechte für react-scripts setzen
RUN chmod +x node_modules/.bin/react-scripts

# 6. Build mit direktem Aufruf (um PATH-Probleme zu vermeiden)
RUN ./node_modules/.bin/react-scripts build

# --- Runtime-Stage ---
FROM nginx:alpine

# Standard-Inhalt entfernen
RUN rm -rf /usr/share/nginx/html/*

# Build-Ergebnis aus erster Stage übernehmen
COPY --from=build /app/build /usr/share/nginx/html

# Healthcheck (prüft, ob App läuft)
HEALTHCHECK CMD wget -qO- http://localhost:80/ >/dev/null || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

