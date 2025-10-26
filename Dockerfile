FROM node:24-slim

ENV PLAYWRIGHT_BROWSERS_PATH=/usr/bin/playwright

WORKDIR /app

RUN apt-get update -y && apt-get upgrade -y && \
    apt-get install -y ffmpeg vim

RUN npx playwright install --with-deps

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "--experimental-sqlite", "dist/main.js"]
