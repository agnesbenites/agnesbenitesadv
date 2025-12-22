FROM node:18

WORKDIR /app

# Copia o package.json para a raiz do WORKDIR temporariamente
COPY api/package.json api/package-lock.json* ./

# Instala na raiz
RUN npm install

# Agora copia tudo e move as node_modules
COPY api ./api
RUN mv node_modules api/ || true

EXPOSE 3000

CMD ["node", "api/server.js"]
