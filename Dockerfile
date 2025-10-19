# Use Node.js 20 base image
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy all source code
COPY . .

# Expose Cloud Run port
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
