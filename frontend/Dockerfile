FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Set npm configs for better reliability
ENV NPM_CONFIG_FETCH_RETRIES=5
ENV NPM_CONFIG_FETCH_TIMEOUT=60000

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["./node_modules/.bin/vite", "--host", "0.0.0.0"]
