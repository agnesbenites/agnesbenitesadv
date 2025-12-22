FROM node:18-alpine

# Instala dependências do sistema para PDF (Puppeteer/Headless Chrome)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-ime \
    font-noto-emoji \
    && apk add --no-cache --virtual .build-deps \
    g++ \
    make \
    python3 \
    && rm -rf /var/cache/apk/*

# Define variáveis de ambiente para Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

# Cria diretório da aplicação
WORKDIR /app/api

# Copia package.json e package-lock.json
COPY api/package*.json ./

# Instala dependências
RUN npm ci --only=production

# Copia o restante da aplicação
COPY api/ ./

# Verifica se o server.js existe (debug)
RUN ls -la && echo "=== Arquivos no diretório ==="

# Exponha a porta que sua aplicação usa (3000 no seu caso)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]