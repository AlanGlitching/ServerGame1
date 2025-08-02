# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci
RUN cd server && npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the server
CMD ["sh", "-c", "cd server && npm start"] 