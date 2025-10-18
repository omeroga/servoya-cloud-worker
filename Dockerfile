# Dockerfile
FROM node:18-alpine

# צור תקיית עבודה
WORKDIR /app

# העתק רק קבצי package.json כדי להתקין חבילות
COPY package*.json ./

# התקן תלויות
RUN npm install

# העתק את כל שאר הקבצים
COPY . .

# פתח את הפורט שהאפליקציה מאזינה לו
EXPOSE 8080

# הפעל את השרת
CMD ["node", "src/index.js"]
