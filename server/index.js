const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow all origins for Socket.IO
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins for now to bypass Railway's CORS restrictions
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add preflight handler
app.options('*', cors());

app.use(express.json());

// Game state
const gameState = {
  rooms: {},
  players: {},
  waitingPlayers: []
};

// Ship configurations
const SHIPS = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 }
];

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested from:', req.headers.origin);
  
  // Force CORS headers to override Railway's restrictions
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  const healthData = { 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeRooms: Object.keys(gameState.rooms).length,
    waitingPlayers: gameState.waitingPlayers.length,
    origin: req.headers.origin || 'unknown'
  };
  
  res.setHeader('Content-Type', 'application/json');
  res.json(healthData);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player joins waiting room
  socket.on('joinWaitingRoom', (playerName) => {
    const player = {
      id: socket.id,
      name: playerName,
      ready: false
    };

    gameState.players[socket.id] = player;
    gameState.waitingPlayers.push(socket.id);

    // Try to match players
    matchPlayers();

    // Notify all waiting players
    io.emit('waitingRoomUpdate', {
      players: gameState.waitingPlayers.map(id => gameState.players[id])
    });

    console.log(`${playerName} joined waiting room`);
  });

  // Player places ships
  socket.on('placeShips', (ships) => {
    const player = gameState.players[socket.id];
    if (!player || !player.roomId) return;

    const room = gameState.rooms[player.roomId];
    if (!room) return;

    // Validate ship placement
    if (validateShipPlacement(ships)) {
      player.ships = ships;
      player.board = createBoard(ships);
      player.ready = true;

      // Check if both players are ready
      if (room.players.every(pId => gameState.players[pId].ready)) {
        room.gameStarted = true;
        room.currentTurn = room.players[0]; // First player starts

        io.to(player.roomId).emit('gameStarted', {
          currentTurn: room.currentTurn,
          players: room.players.map(pId => ({
            id: pId,
            name: gameState.players[pId].name
          }))
        });
      } else {
        io.to(player.roomId).emit('playerReady', {
          playerId: socket.id,
          ready: true
        });
      }
    } else {
      socket.emit('invalidShipPlacement', 'Invalid ship placement');
    }
  });

  // Player makes a shot
  socket.on('makeShot', (coordinates) => {
    const player = gameState.players[socket.id];
    if (!player || !player.roomId) return;

    const room = gameState.rooms[player.roomId];
    if (!room || !room.gameStarted || room.currentTurn !== socket.id) return;

    const opponentId = room.players.find(pId => pId !== socket.id);
    const opponent = gameState.players[opponentId];

    if (!opponent || !opponent.board) return;

    const { x, y } = coordinates;
    
    // Validate coordinates
    if (x < 0 || x >= 10 || y < 0 || y >= 10) {
      socket.emit('invalidShot', 'Invalid coordinates');
      return;
    }
    
    // Check if already shot at this location
    if (opponent.board[y][x] === 'H' || opponent.board[y][x] === 'M') {
      socket.emit('invalidShot', 'Already shot at this location');
      return;
    }
    
    const result = processShot(opponent.board, x, y);

    // Update opponent's board with hit/miss marker
    opponent.board[y][x] = result.hit ? 'H' : 'M';

    // Check if ship is sunk AFTER marking the hit
    if (result.hit) {
      result.sunk = checkShipSunk(opponent.board, result.shipName);
      if (result.sunk) {
        result.sunkShip = findSunkShip(opponent.ships, x, y);
      }
    }

    // Check if game is over
    const gameOver = checkGameOver(opponent.board);
    if (gameOver) {
      room.gameOver = true;
      room.winner = socket.id;
    }

    // Switch turns (Battleship rule: miss = switch turn, hit = same player continues)
    if (!result.hit) {
      room.currentTurn = opponentId;
    }
    // If it's a hit, the same player continues (turn doesn't change)

    // Send results to both players
    io.to(player.roomId).emit('shotResult', {
      shooter: socket.id,
      coordinates,
      result,
      gameOver,
      winner: room.winner,
      nextTurn: room.currentTurn
    });

    console.log(`Player ${player.name} shot at (${x}, ${y}) - ${result.hit ? 'Hit' : 'Miss'}${result.sunk ? ' - Ship Sunk!' : ''}`);
  });

  // Player disconnects
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    const player = gameState.players[socket.id];
    if (player) {
      // Remove from waiting room
      const waitingIndex = gameState.waitingPlayers.indexOf(socket.id);
      if (waitingIndex > -1) {
        gameState.waitingPlayers.splice(waitingIndex, 1);
      }

      // Handle room disconnection
      if (player.roomId) {
        const room = gameState.rooms[player.roomId];
        if (room) {
          const opponentId = room.players.find(pId => pId !== socket.id);
          if (opponentId) {
            io.to(opponentId).emit('opponentDisconnected');
          }
          delete gameState.rooms[player.roomId];
        }
      }

      delete gameState.players[socket.id];
      
      // Update waiting room
      io.emit('waitingRoomUpdate', {
        players: gameState.waitingPlayers.map(id => gameState.players[id])
      });
      
      console.log(`${player.name} disconnected`);
    }
  });
});

// Match players into rooms
function matchPlayers() {
  while (gameState.waitingPlayers.length >= 2) {
    const player1Id = gameState.waitingPlayers.shift();
    const player2Id = gameState.waitingPlayers.shift();

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const room = {
      id: roomId,
      players: [player1Id, player2Id],
      gameStarted: false,
      currentTurn: null,
      gameOver: false,
      winner: null
    };

    gameState.rooms[roomId] = room;

    // Assign room to players
    gameState.players[player1Id].roomId = roomId;
    gameState.players[player2Id].roomId = roomId;

    // Join players to room
    io.sockets.sockets.get(player1Id).join(roomId);
    io.sockets.sockets.get(player2Id).join(roomId);

    // Notify players they are matched
    io.to(roomId).emit('gameMatched', {
      roomId,
      players: [
        { id: player1Id, name: gameState.players[player1Id].name },
        { id: player2Id, name: gameState.players[player2Id].name }
      ]
    });

    console.log(`Game matched: ${gameState.players[player1Id].name} vs ${gameState.players[player2Id].name}`);
  }
}

// Validate ship placement
function validateShipPlacement(ships) {
  const board = Array(10).fill().map(() => Array(10).fill(null));
  
  for (const ship of ships) {
    const { x, y, size, orientation } = ship;
    
    // Check boundaries
    if (orientation === 'horizontal') {
      if (x + size > 10 || y >= 10) return false;
    } else {
      if (x >= 10 || y + size > 10) return false;
    }
    
    // Check overlap
    for (let i = 0; i < size; i++) {
      const checkX = orientation === 'horizontal' ? x + i : x;
      const checkY = orientation === 'horizontal' ? y : y + i;
      
      if (board[checkY][checkX] !== null) return false;
      board[checkY][checkX] = ship.name;
    }
  }
  
  return true;
}

// Create board with ships
function createBoard(ships) {
  const board = Array(10).fill().map(() => Array(10).fill(null));
  
  for (const ship of ships) {
    const { x, y, size, orientation } = ship;
    
    for (let i = 0; i < size; i++) {
      const boardX = orientation === 'horizontal' ? x + i : x;
      const boardY = orientation === 'horizontal' ? y : y + i;
      board[boardY][boardX] = ship.name;
    }
  }
  
  return board;
}

// Process a shot
function processShot(board, x, y) {
  const cell = board[y][x];
  
  // Check if already shot at this location
  if (cell === 'H' || cell === 'M') {
    return { hit: false, sunk: false, alreadyShot: true };
  }
  
  // Check if it's a miss (no ship at this location)
  if (cell === null) {
    return { hit: false, sunk: false };
  }
  
  // It's a hit! Check if this ship is now sunk
  const sunk = checkShipSunk(board, cell);
  
  return { hit: true, sunk, shipName: cell };
}

// Check if ship is sunk
function checkShipSunk(board, shipName) {
  // Check if any part of this ship is still not hit
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      if (board[y][x] === shipName) {
        return false; // Ship still has unhit parts
      }
    }
  }
  return true; // All parts of this ship are hit
}

// Find sunk ship details
function findSunkShip(ships, x, y) {
  return ships.find(ship => {
    const { x: shipX, y: shipY, size, orientation } = ship;
    
    for (let i = 0; i < size; i++) {
      const checkX = orientation === 'horizontal' ? shipX + i : shipX;
      const checkY = orientation === 'horizontal' ? shipY : shipY + i;
      
      if (checkX === x && checkY === y) {
        return true;
      }
    }
    return false;
  });
}

// Check if game is over
function checkGameOver(board) {
  // Check if any ship parts are still not hit
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = board[y][x];
      // If there's a ship part that's not hit (not 'H' or 'M'), game is not over
      if (cell !== null && cell !== 'H' && cell !== 'M') {
        return false;
      }
    }
  }
  return true; // All ship parts are hit
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Battleship server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Socket.IO endpoint: http://localhost:${PORT}/socket.io/`);
}); 