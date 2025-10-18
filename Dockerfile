# Use Node.js 18
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Expose port 8080 (Cloud Run default)
EXPOSE 8080

# Start the app
CMD [ "npm", "start" ]
