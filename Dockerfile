FROM node:18-alpine

WORKDIR /app

# Copia APENAS os arquivos de dependência primeiro
COPY api/package.json api/package-lock.json* ./api/

# Instala dependências
RUN npm install --prefix ./api

# Copia o resto do código
COPY api ./api

EXPOSE 3000

WORKDIR /app/api
CMD ["node", "server.js"]
