FROM nodesource/node:4.0

RUN npm install -g tsd
RUN npm install -g grunt-cli
ADD package.json package.json
ADD tsd.json tsd.json
RUN npm install
RUN tsd install

ADD . .
RUN grunt ts

EXPOSE 3000 

CMD ["node", "bin/www"]
