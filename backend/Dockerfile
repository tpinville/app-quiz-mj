FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Set npm configs for better reliability
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_TIMEOUT=60000

RUN npm install --legacy-peer-deps

COPY . .

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "--watch", "src/index.js"]
