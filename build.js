const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting build process...');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('client')) {
    throw new Error('Client directory not found');
  }

  // Change to client directory
  process.chdir('client');
  console.log('📁 Changed to client directory');

  // Clean install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Build the project
  console.log('🔨 Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 