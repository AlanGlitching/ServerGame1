FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install --prefix server

# Copy server code
COPY server/ ./server/

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start", "--prefix", "server"] 