# Servoya Cloud Worker - Stable Build
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies (clean and consistent)
RUN npm install --legacy-peer-deps --omit=dev

# Copy the rest of the project files
COPY . .

# Define port environment variable (Render expects $PORT)
ENV PORT=10000
EXPOSE 10000

# Start the app using Node directly
CMD ["node", "index.js"]
