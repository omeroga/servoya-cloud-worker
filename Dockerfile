# Use Node.js 18
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source
COPY . .

# Expose the default port
EXPOSE 8080

# Start the server
CMD ["node", "contentGenerator.js"]
