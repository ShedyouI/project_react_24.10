FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm install --omit=dev

COPY --chown=node:node src ./src

USER node

EXPOSE 5000

CMD ["node", "src/index.js"]