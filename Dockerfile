FROM node:18-slim

# Instala bibliotecas necessárias para processamento de imagem/pdf
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install --production

# Copia o restante do código
COPY . .

# Garante que a pasta de uploads existe
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "server.js"]