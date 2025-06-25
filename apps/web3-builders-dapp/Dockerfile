# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /web3-builders-dapp

COPY package.json . 
RUN npm install --force

RUN mkdir -p /web3-builders-dapp/.next /web3-builders-dapp/certificates \
 && chown -R node:node /web3-builders-dapp

USER node

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]