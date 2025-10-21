# Servoya Cloud Worker - Clean Stable Build
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files first (for caching)
COPY package*.json ./

# Clean install of dependencies (legacy deps fix)
RUN npm install --legacy-peer-deps --omit=dev

# Copy rest of the source code
COPY . .

# Ensure port environment variable or default to 10000
ENV PORT=10000
EXPOSE 10000

# Start the app
CMD ["node", "index.js"]
