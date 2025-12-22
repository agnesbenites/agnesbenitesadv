FROM node:18-alpine

# Instala fontes básicas para PDFKit
RUN apk add --no-cache \
    ttf-freefont \
    fontconfig \
    freetype

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Ignora verificação de versão do Node
ENV npm_config_ignore_engines=true

# Diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência primeiro (melhor cache)
COPY package*.json ./

# Instala dependências
RUN npm ci --only=production --ignore-scripts || npm install --production --ignore-engines

# Copia todo o código da aplicação
COPY . .

# Cria diretório para documentos
RUN mkdir -p /data/documents

# Porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando
CMD ["node", "server.js"]