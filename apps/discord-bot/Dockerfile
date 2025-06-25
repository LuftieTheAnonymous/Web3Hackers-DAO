# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-slim as base
LABEL fly_launch_runtime="NodeJS"
WORKDIR /app
ENV NODE_ENV=production

# --- Build stage ---
FROM base as build

RUN npm install -g npm@11.4.2

# Needed for native deps
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential 

# Install deps
COPY --link package*.json ./
RUN npm install

# Copy source
COPY --link . .

# Build app
RUN npm run build

# --- Final image ---
FROM base

COPY --from=build /app /app

CMD ["npm", "run", "start"]
