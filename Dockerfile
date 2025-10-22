# Use Node 18 LTS
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps

# Copy rest of the app
COPY . .

# Expose port
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
