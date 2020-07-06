# https://cli.vuejs.org/guide/deployment.html#docker-nginx

FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ .
RUN npm run build

FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf

# https://blog.nicolas-coutin.com/dynamic-configuration-static-vue-without-ssr/

# Using `sed` to replace {{ API_URL }} with the actual API URL,
# which is given to the container at RUN TIME !
CMD sed -i -e "s@{{ API_URL }}@$API_URL@g" /app/js/app.*.js && \
    nginx -g "daemon off;"

# to add API_URL: docker run -e API_URL=https://api.example.com ui
