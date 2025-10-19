# Dockerfile
FROM node:18-alpine

# צור תיקיית עבודה
WORKDIR /app

# העתק קובצי package
COPY package*.json ./

# התקנת תלויות
RUN npm install

# העתק את שאר הקבצים
COPY . .

# הגדר את הפורט הנכון עבור Cloud Run
ENV PORT=8080
EXPOSE 8080

# הפעל את היישום
CMD ["node", "index.js"]
