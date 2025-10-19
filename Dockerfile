# Dockerfile
FROM node:18-alpine
WORKDIR /app

# העתק package.json והתקן תלויות
COPY package*.json ./
RUN npm install --omit=dev

# העתק שאר הקבצים
COPY . .

# Cloud Run יזריק PORT=8080; נשמור אותו כחשוף (לא חובה, אבל ברור)
EXPOSE 8080

# התחל את האפליקציה
CMD ["node", "index.js"]
