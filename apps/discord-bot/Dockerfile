# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /web3-builders-dapp

COPY package*.json ./
RUN npm install --force

COPY . .

RUN mkdir -p .next certificates && chown -R node:node ./

USER node

EXPOSE 3000
CMD ["npm", "run", "dev"]
