# Use Node 18 LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy only package files first (better layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

# Copy app source
COPY . .

# Cloud Run listens on PORT (default 8080)
EXPOSE 8080

# Start
CMD ["node", "index.js"]
