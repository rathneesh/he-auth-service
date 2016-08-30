FROM node:4

ADD . /usr/src/app

WORKDIR /usr/src/app

RUN npm install

CMD ["npm", "run", "server"]
