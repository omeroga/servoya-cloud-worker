# Use Node 18 (LTS)
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies (lightweight)
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Expose the Cloud Run default port
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
