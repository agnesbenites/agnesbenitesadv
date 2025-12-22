FROM node:18

WORKDIR /app

COPY api/package*.json ./api/

RUN cd api && npm install

COPY api ./api

EXPOSE 3000

CMD ["node", "api/server.js"]
