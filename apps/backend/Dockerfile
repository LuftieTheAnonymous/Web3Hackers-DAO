# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"
WORKDIR /app
ENV NODE_ENV=production

FROM base as build

RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential

# Copy and install packages (including dev deps for build)
COPY --link package*.json ./
RUN npm install

# Copy all code
COPY --link . .

# Compile the TypeScript code
RUN npm run build

FROM base

# Install only production deps in final image
COPY --link package*.json ./
RUN npm install --omit=dev

# Copy built app
COPY --from=build /app /app

CMD ["npm", "run", "start"]
