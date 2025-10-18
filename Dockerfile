# Use Node.js
FROM node:18

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose the port
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
