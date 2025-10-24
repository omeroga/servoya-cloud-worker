# ---- Base image ----
FROM node:18-alpine

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

# ---- Start app directly ----
CMD ["node", "index.js"]
