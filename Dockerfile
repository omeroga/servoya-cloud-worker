# Dockerfile - Servoya AI Automation System
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps --omit=dev

COPY . .

EXPOSE 10000

# Start the app
CMD ["node", "index.js"]
