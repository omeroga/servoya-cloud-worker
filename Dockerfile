# Use official Node.js 18 image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source
COPY . .

# Expose the port Cloud Run uses
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
