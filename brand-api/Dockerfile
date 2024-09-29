#imagem do nodeJS como base
FROM node:18-alpine

#diretório de trabalho
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install sqlite3 --save

RUN npm install

RUN apk add --no-cache sqlite sqlite-dev

#copiar o resto dos arquivos
COPY . .

EXPOSE 3000

#comandos para rodar aplicação
CMD ["npm", "run", "start:prod"]