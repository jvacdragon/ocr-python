FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update && apt-get install -y sqlite3

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
