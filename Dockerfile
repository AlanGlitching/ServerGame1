FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./server/

# Install dependencies
WORKDIR /app/server
RUN npm install

# Copy server code
COPY server/ ./

# Expose port (Railway will use PORT environment variable)
EXPOSE $PORT

# Start the server
CMD ["npm", "start"] 