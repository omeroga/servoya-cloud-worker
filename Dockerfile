FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

# התקנה "רזה" יותר
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
