FROM node:18.18.2

WORKDIR /app

COPY . .

RUN npm i
ENV TERM=xterm

CMD [ "npm", "run", "start" ]