FROM node:12.10-alpine

COPY . /app
WORKDIR /app

RUN npm install --production

EXPOSE 4000

CMD ["npm", "run", "start"]
