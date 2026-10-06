# Uses node version 22 as our base image
FROM node:22

#Goes to the app directory (cd)
WORKDIR /app

# Copy package and package-lock
COPY package*.json ./

# Install app dependencies
RUN npm install 

#Copy the rest of our app into the container
COPY . .
