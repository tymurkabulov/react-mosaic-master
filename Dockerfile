# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (если нужно собрать проект, например, с помощью Webpack)
RUN npm run build

# Expose the port on which the application will run
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
