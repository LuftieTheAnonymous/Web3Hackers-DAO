# Use a specific Node.js image

ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine

# Set working directory
WORKDIR /backend

# Set to development mode to ensure devDependencies are installed
ENV NODE_ENV=development

# Copy package.json and lock file first to leverage Docker cache
COPY package*.json ./

# Install ALL dependencies, including devDependencies
RUN npm install

RUN npm install -g ts-node typescript && \
    npm install -g nodemon && \
    npm install express && \
    npm install --save-dev @types/express

# Copy rest of the application code
COPY . .

# Expose the app port
EXPOSE 2137

CMD ["npx","tsx", "index.ts"]


