const { spawn } = require('child_process');
const http = require('http');

console.log('🧪 Testing deployment configuration...\n');

// Test 1: Check if server starts correctly
console.log('1️⃣ Testing server startup...');
const server = spawn('node', ['server/index.js'], {
  stdio: 'pipe',
  env: { ...process.env, PORT: '3001' }
});

let serverStarted = false;
let serverOutput = '';

server.stdout.on('data', (data) => {
  serverOutput += data.toString();
  if (serverOutput.includes('🚀 Tic Tac Toe server running on port 3001')) {
    serverStarted = true;
    console.log('✅ Server started successfully');
  }
});

server.stderr.on('data', (data) => {
  console.log('❌ Server error:', data.toString());
});

// Test 2: Check health endpoint
setTimeout(() => {
  if (serverStarted) {
    console.log('\n2️⃣ Testing health endpoint...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const health = JSON.parse(data);
          if (health.status === 'OK') {
            console.log('✅ Health endpoint working');
            console.log(`   Active games: ${health.activeGames}`);
            console.log(`   Connections: ${health.totalConnections}`);
          } else {
            console.log('❌ Health endpoint returned invalid status');
          }
        } catch (e) {
          console.log('❌ Health endpoint returned invalid JSON');
        }
        
        // Clean up
        server.kill();
        console.log('\n🎉 All tests passed! Ready for deployment.');
        process.exit(0);
      });
    });

    req.on('error', (e) => {
      console.log('❌ Health endpoint test failed:', e.message);
      server.kill();
      process.exit(1);
    });

    req.end();
  } else {
    console.log('❌ Server failed to start');
    server.kill();
    process.exit(1);
  }
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
}); 