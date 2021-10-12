FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm install && npm run build-all

EXPOSE 3000

CMD ["npm", "run", "start-server"]
