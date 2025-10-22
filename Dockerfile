# Use Node 18 LTS
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev --legacy-peer-deps

# Copy rest of the app
COPY . .

# Expose port
EXPOSE 8080

# Start command
CMD ["npm", "start"]
