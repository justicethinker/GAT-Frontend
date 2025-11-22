# Use Node.js official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build
RUN npm run preview

# Expose port
EXPOSE 5173

# Start the app
CMD ["npm", "run", "preview"]
