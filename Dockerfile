# Use Node.js official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/
# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Accept build argument for backend URL
ARG VITE_BACKEND_URL=https://www.gatbackend.name.ng
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Build the app with the environment variable
RUN npm run build

# Expose port
EXPOSE 5000

# Start the app in production mode
CMD ["npm", "run", "start"]
