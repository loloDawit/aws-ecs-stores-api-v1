# Base image
FROM node:14-alpine
# Creating a directory inside the base image and defining as the base directory
WORKDIR /app
# Copying the files of the root directory into the base directory
ADD . /app
# Installing the project dependencies
RUN npm install pm2 -g
RUN npm install
# Starting the pm2 process and keeping the docker container alive
CMD pm2 start process.yml && tail -f /dev/null
# Exposing the RestAPI port
EXPOSE 80