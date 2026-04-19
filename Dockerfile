# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle your app's source code
COPY . .

# Make your app available on port 8080
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "server.js" ]