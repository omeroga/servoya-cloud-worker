# Servoya Cloud Worker - Optimized Stable Build
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Faster dependency installation (tries npm ci first, then fallback)
RUN npm ci --omit=dev || npm install --legacy-peer-deps --omit=dev

# Copy the rest of the source code
COPY . .

# Define port environment variable (Render expects $PORT)
ENV PORT=10000
EXPOSE 10000

# Start the app directly with Node
CMD ["node", "index.js"]
