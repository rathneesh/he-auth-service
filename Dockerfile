FROM node:6.4

ADD . /usr/src/app

WORKDIR /usr/src/app

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "server"]
