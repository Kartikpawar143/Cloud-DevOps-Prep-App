FROM node:20-slim

RUN npm install -g bun expo-cli

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

EXPOSE 8081 19000 19001 19002

ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

CMD ["bunx", "expo", "start", "--web", "--host", "lan"]
