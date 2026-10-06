# Use official Node.js runtime as the base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package configuration files first (leverages Docker cache)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy all project files from frontend directory
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Start Vite dev server binding to 0.0.0.0 so host machine can connect
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
