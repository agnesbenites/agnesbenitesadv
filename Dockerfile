FROM node:18

WORKDIR /app

COPY api/package*.json ./api/

RUN npm install --prefix ./api

COPY api ./api

EXPOSE 3000

CMD ["node", "api/server.js"]
