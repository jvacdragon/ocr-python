# Usando node:18 como base (Debian-based)
FROM node:18

# Diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Atualizar pacotes e instalar sqlite3 usando apt-get
RUN apt-get update && apt-get install -y sqlite3

# Instalar dependências do Node.js
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Expor a porta
EXPOSE 3000

# Rodar a aplicação
CMD ["npm", "run", "start"]
