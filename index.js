// Root entry point for Railway deployment
// This file redirects to the actual server in the server/ directory

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Battleship Game Server...');
console.log('📁 Current directory:', process.cwd());

// Change to server directory and start the server
const serverPath = path.join(__dirname, 'server');
process.chdir(serverPath);

console.log('📁 Changed to server directory:', process.cwd());

// Start the server using npm start
const server = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
}); 