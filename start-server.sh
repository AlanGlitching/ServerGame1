#!/bin/bash

echo "Starting Tic Tac Toe server..."

# Navigate to server directory
cd server

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
echo "Starting server on port $PORT..."
npm start 