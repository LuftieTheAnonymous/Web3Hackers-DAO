# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /cron-jobs

# Use development environment so devDependencies like nodemon will be installed
ENV NODE_ENV=development

# Copy only the package files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies (including dev deps like nodemon)
RUN npm install && npm install -g npm@11.4.1

# Install ts-node, nodemon globally if you insist — optional
RUN npm install -g ts-node typescript nodemon

# Copy the rest of your source code
COPY . .

# Switch to non-root user after dependencies are installed
USER node

# Expose your app port
EXPOSE 2138

# Final run command — use direct path to nodemon, avoids npx
CMD ["nodemon", "--watch", ".", "--exec", "ts-node", "index.ts"]