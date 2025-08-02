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

# Expose port (Railway will use PORT environment variable)
EXPOSE $PORT

# Start the server with debugging
CMD ["sh", "-c", "echo 'Starting server on port $PORT' && cd server && npm start"] 