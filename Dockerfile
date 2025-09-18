FROM node:18-alpine
WORKDIR /app

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm ci --omit=dev

# Source Code kopieren
COPY . .

# Umgebung setzen
ENV NODE_ENV=production

# Port freigeben
EXPOSE 3000

# Healthcheck (setzt voraus, dass du /health implementierst)
HEALTHCHECK CMD wget -qO- http://localhost:3000/health >/dev/null || exit 1

# Start
CMD ["node", "server.js"]

