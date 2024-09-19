FROM node:18-alpine

WORKDIR /app

RUN yarn global add serve

COPY ./dist /app/

EXPOSE 3000

CMD sh -c "serve . -l ${PORT:-3000}"
