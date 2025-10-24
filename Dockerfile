# Use Node 18 Alpine for smaller size
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev --ignore-scripts

# Copy the rest of the code
COPY . .

# Expose port (Cloud Run listens on $PORT)
EXPOSE 8080

# ✅ Run as root to avoid permission issues (fixes exit(1))
USER root

# ✅ Start app
CMD ["npm", "start"]
