# ---- Base image ----
FROM node:20-alpine

# ✅ Install FFmpeg for audio-video merge
RUN apk add --no-cache ffmpeg

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

# ---- Start app ----
CMD ["node", "index.js"]
