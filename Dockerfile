FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app/api

# Copiar package files
COPY api/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da API
COPY api/ ./

# Criar diretórios necessários
RUN mkdir -p documents uploads fonts

# Expor porta
EXPOSE 3000

# Variável de ambiente
ENV NODE_ENV=production

# Comando de inicialização (SEM cd!)
CMD ["node", "server.js"]