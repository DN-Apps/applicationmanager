# --- Build-Stage ---
FROM node:18-alpine AS build

# Systempakete für bcrypt kompilieren
RUN apk add --no-cache python3 make g++

# Arbeitsverzeichnis
WORKDIR /app

# Package.json kopieren und Dependencies installieren
COPY package*.json ./
RUN npm install --production

# Quellcode ins Image kopieren
COPY . .

# --- Runtime-Stage ---
FROM node:18-alpine

# Arbeitsverzeichnis
WORKDIR /app

# Nur die Production-Dependencies und App übernehmen
COPY --from=build /app /app

# Port öffnen (wie in .env.qa definiert)
EXPOSE 5000

# Startkommando
CMD ["npm", "start"]

