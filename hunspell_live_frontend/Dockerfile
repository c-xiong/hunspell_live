# Use the official Node.js image as the base image
FROM node:18.19.1

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install TypeScript globally with specific version
RUN npm install -g typescript@4.4.2

# Use development build for now
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

EXPOSE 3000
