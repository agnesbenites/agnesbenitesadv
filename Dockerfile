FROM node:18-alpine

# 1. Instala Chromium e dependências MÍNIMAS
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# 2. Variáveis Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTable_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production
ENV PORT=3000

# 3. Configuração da aplicação
WORKDIR /app
COPY api/package*.json ./
RUN npm ci --only=production
COPY api/ ./
RUN mkdir -p /data/documents

EXPOSE 3000
CMD ["node", "server.js"]