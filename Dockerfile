# Servoya Cloud Worker - Final Stable Build
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Fast and safe install (no audit, no funding, no dev deps)
RUN npm install --no-audit --no-fund --omit=dev

# Copy the rest of the source code
COPY . .

# Define port environment variable (Render expects $PORT)
ENV PORT=10000
EXPOSE 10000

# Start the app directly with Node
CMD ["node", "index.js"]
