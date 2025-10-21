# Servoya Cloud Worker - Stable Build (tslib fix)
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies including tslib explicitly
RUN npm install --omit=dev && npm install tslib

# Copy the rest of the source code
COPY . .

# Set environment variable for port
ENV PORT=10000
EXPOSE 10000

# Start the app
CMD ["npm", "start"]
