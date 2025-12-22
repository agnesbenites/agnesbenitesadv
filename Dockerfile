FROM node:18-alpine

# Instala fontes básicas para PDFKit funcionar corretamente
RUN apk add --no-cache \
    ttf-freefont \
    fontconfig \
    freetype \
    && rm -rf /var/cache/apk/*

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Evita problemas com puppeteer/chromium (se algum módulo tentar instalar)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/false

# Diretório de trabalho
WORKDIR /app

# Copia arquivos de dependência primeiro (para cache eficiente)
COPY api/package*.json ./

# Instala dependências de produção
RUN npm ci --only=production

# Copia o código da aplicação
COPY api/ ./

# Cria diretório para documentos com permissões adequadas
RUN mkdir -p /data/documents && chown -R node:node /data

# Muda para usuário não-root (mais seguro)
USER node

# Porta da aplicação
EXPOSE 3000

# Comando de inicialização
CMD ["node", "server.js"]