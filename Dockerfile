# Dockerfile - Servoya AI Automation System
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
