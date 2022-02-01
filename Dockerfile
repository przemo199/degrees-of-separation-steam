FROM node:16-alpine
WORKDIR /app
COPY . .
RUN yarn set version berry && yarn install && yarn run build
EXPOSE 3000
CMD ["yarn", "run", "start"]
