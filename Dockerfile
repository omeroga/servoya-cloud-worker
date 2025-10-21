# Servoya Cloud Worker - Final Stable Build
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies (safe mode for Render)
RUN npm install --omit=dev --legacy-peer-deps && npm install tslib@2.6.2 --force

# Copy the rest of the project files
COPY . .

# Define environment variable for Render's port
ENV PORT=10000
EXPOSE 10000

# Start the app directly with Node
CMD ["node", "index.js"]
