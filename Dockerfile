# ---- Base image ----
FROM node:18-alpine

# ---- Working directory ----
WORKDIR /usr/src/app

# ---- Copy dependency files ----
COPY package*.json ./

# ---- Install dependencies ----
RUN npm install --omit=dev --ignore-scripts

# ---- Copy project files ----
COPY . .

# ---- Expose correct Cloud Run port ----
EXPOSE 8080

# ---- Start app ----
CMD ["npm", "start"]
