# Servoya Cloud Worker - Stable Build
FROM node:18

WORKDIR /usr/src/app

# Copy only package files first
COPY package*.json ./

# Clean install (fully reliable on Render/Railway)
RUN npm install --force

# Copy rest of the project
COPY . .

# Define environment variable for port
ENV PORT=10000
EXPOSE 10000

# Start app
CMD ["node", "index.js"]
