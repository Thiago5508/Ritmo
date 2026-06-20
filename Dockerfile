FROM node:20-slim

WORKDIR /usr/src/app

COPY package-lock.json package.json ./

RUN npm ci && npm install -g @expo/ngrok@^4.1.0

COPY . .

EXPOSE 8081
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

CMD ["npx", "expo", "start", "--tunnel", "--host", "0.0.0.0"]