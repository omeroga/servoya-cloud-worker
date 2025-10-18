# Dockerfile - Servoya Cloud Worker
FROM node:18-alpine

# צור תקיית עבודה
WORKDIR /app

# העתק רק את קובצי ה־package כדי לאפשר cache נכון
COPY package*.json ./

# התקן תלותים
RUN npm install --omit=dev

# העתק את כל שאר הקבצים
COPY . .

# חשוף את הפורט שה־App מאזין לו
EXPOSE 8080

# הרץ את האפליקציה
CMD ["node", "src/index.js"]
