FROM node:6.5.0

ADD . /usr/src/app

WORKDIR /usr/src/app

RUN npm install

CMD ["npm", "run", "server"]
