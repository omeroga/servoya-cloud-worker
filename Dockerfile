# Servoya Cloud Worker - Clean Stable Build
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies cleanly
RUN npm install --omit=dev && npm install tslib

# Copy the rest of the source code
COPY . .

# Set environment variable for port (Render expects $PORT)
ENV PORT=10000
EXPOSE 10000

# Start the app directly with Node (avoids npm exit)
CMD ["node", "index.js"]
