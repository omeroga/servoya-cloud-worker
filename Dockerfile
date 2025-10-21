# Servoya Cloud Worker - Stable Clean Build
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Clean install dependencies (avoid cache + postinstall hangs)
RUN npm ci --omit=dev && npm install tslib@2.6.2 --force

# Copy the rest of the project files
COPY . .

# Define environment variable for Render's port
ENV PORT=10000
EXPOSE 10000

# Start the app directly with Node (avoids npm exit traps)
CMD ["node", "index.js"]
