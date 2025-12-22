FROM node:18

# Atualiza e instala dependências do sistema para PDF
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# MUDEI AQUI: Trabalhar DENTRO da pasta api desde o início
WORKDIR /app/api

# Copia os arquivos de dependência para /app/api/
COPY api/package.json api/package-lock.json* ./

# Instala dependências SEM as devDependencies (agora dentro de /app/api/)
RUN npm ci --omit=dev

# Copia TODO o resto da pasta api
COPY api/ ./

EXPOSE 3000

# MUDEI AQUI: Agora server.js está no diretório atual (/app/api/)
CMD ["node", "server.js"]
