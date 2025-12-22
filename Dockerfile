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
ENV npm_config_ignore_engines=true

# Diretório de trabalho
WORKDIR /app

# IMPORTANTE: Copia os arquivos da pasta api/
COPY api/package*.json ./

# Instala dependências
RUN npm ci --omit=dev --ignore-scripts 2>/dev/null || npm install --production --ignore-engines

# Copia o código da pasta api/
COPY api/ ./

# Cria diretório para documentos
RUN mkdir -p /data/documents

# Porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando
CMD ["node", "server.js"]
