# שלב 1 - בסיס Node
FROM node:18-alpine

# שלב 2 - תיקיית עבודה
WORKDIR /usr/src/app

# שלב 3 - העתקת תלויות
COPY package*.json ./

# שלב 4 - התקנת תלויות בלבד
RUN npm install --omit=dev --ignore-scripts

# שלב 5 - העתקת כל הקבצים
COPY . .

# שלב 6 - פתיחת פורט 8080
EXPOSE 8080

# שלב 7 - הרצת האפליקציה
CMD ["node", "index.js"]
