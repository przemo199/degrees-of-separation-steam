FROM node:16-alpine
WORKDIR /app
COPY . .
RUN yarn set version berry && yarn install && yarn run build
CMD ["yarn", "run", "start"]
