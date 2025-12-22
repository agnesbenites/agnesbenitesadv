FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY api/package*.json ./api/

# Instalar dependências
WORKDIR /app/api
RUN npm install --production

# Copiar resto do código
WORKDIR /app
COPY . .

# Expor porta
EXPOSE 3000

# Comando de start
CMD ["node", "api/server.js"]