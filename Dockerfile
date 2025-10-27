# ---- Base image ----
FROM node:20-alpine

# ---- Working directory ----
WORKDIR /usr/src/app

# ---- Copy dependency files ----
COPY package*.json ./

# ---- Install dependencies inside the container ----
RUN npm install --omit=dev

# ---- Copy the rest of the project ----
COPY . .

# ---- Expose correct Cloud Run port ----
EXPOSE 8080

# ---- Health check ----
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

# ---- Start app ----
CMD ["node", "index.js"]
