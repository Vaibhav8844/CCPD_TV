FROM node:22-bullseye

RUN apt-get update && apt-get install -y poppler-utils

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --omit=dev

COPY backend/ .

EXPOSE 5000
CMD ["node", "index.js"]
