#!/bin/bash

# Build script for deployment environments
echo "🚀 Starting build process..."

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing client dependencies..."
npm install

# Build the project
echo "🔨 Building client..."
npm run build

echo "✅ Build completed successfully!" 