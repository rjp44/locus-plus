# Really simple Dockerfile to build a react production container which listens on port $PORT

FROM node:12-alpine

EXPOSE $PORT

WORKDIR /usr/src/app

COPY package*.json ./
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN yarn install
COPY . .
RUN yarn run test --watchAll=false
RUN yarn build

# TODO: use a proper webserver but this is quick and simple for now.
RUN yarn global add serve

CMD [ "sh", "-c", "serve -s -l $PORT build" ]
