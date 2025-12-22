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

# Copia arquivos de dependência
COPY api/package*.json ./

# Instala dependências (ignora engines check)
RUN npm install --production --ignore-engines

# Copia código da aplicação
COPY api/ ./

# Cria diretório para documentos
RUN mkdir -p /data/documents

# Porta
EXPOSE 3000

# Comando
CMD ["node", "server.js"]