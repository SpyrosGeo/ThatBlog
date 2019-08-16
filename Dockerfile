FROM node:10-alpine

RUN mkdir -p /home/node/thatblog/node_modules && chown -R node:node /home/node/thatblog

WORKDIR /home/node/thatblog

COPY package*.json ./

USER node

RUN npm install

EXPOSE 9080

COPY --chown=node:node . .

CMD [ "node", "app.js" ]
