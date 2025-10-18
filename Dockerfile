# Dockerfile
FROM node:18-alpine

# Create working directory
WORKDIR /app

# Copy package.json files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Expose the app port
EXPOSE 8080

# Start the application
CMD ["node", "src/index.js"]
