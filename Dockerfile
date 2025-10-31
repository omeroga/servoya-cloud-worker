# 🧠 Servoya Cloud Worker - Dockerfile (v3.0)
FROM node:22-slim

# התקנת ffmpeg ו־curl (נדרש ל־mergeAudioVideo + healthcheck)
RUN apt-get update && apt-get install -y ffmpeg curl && apt-get clean

# סביבת עבודה
WORKDIR /app

# התקנת תלויות
COPY package*.json ./
RUN npm install --production

# העתקת שאר הקבצים
COPY . .

# חשיפת פורט
EXPOSE 8080

# משתני סביבה בסיסיים
ENV NODE_ENV=production
ENV PORT=8080

# בדיקת בריאות (Healthcheck)
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s \
  CMD curl -f http://localhost:8080/health || exit 1

# הפעלת האפליקציה הראשית
CMD ["node", "index.js"]