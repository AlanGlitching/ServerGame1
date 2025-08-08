const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Generate shorter game ID (6 characters)
function generateShortGameId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Game state storage
const games = new Map();

// Game class to manage game state
class Game {
  constructor(id, creator) {
    this.id = id;
    this.players = [creator];
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 0; // Index of current player
    this.gameStatus = 'waiting'; // waiting, playing, finished
    this.winner = null;
    this.winningCombination = null;
    this.createdAt = new Date();
  }

  addPlayer(player) {
    if (this.players.length < 2) {
      this.players.push(player);
      if (this.players.length === 2) {
        this.gameStatus = 'playing';
      }
      return true;
    }
    return false;
  }

  makeMove(playerIndex, position) {
    if (this.gameStatus !== 'playing') return false;
    if (this.currentPlayer !== playerIndex) return false;
    if (this.board[position] !== '') return false;

    const symbol = playerIndex === 0 ? 'X' : 'O';
    this.board[position] = symbol;

    // Check for win
    if (this.checkWin(symbol)) {
      this.gameStatus = 'finished';
      this.winner = playerIndex;
      return { success: true, gameOver: true, winner: playerIndex };
    }

    // Check for draw
    if (this.checkDraw()) {
      this.gameStatus = 'finished';
      this.winner = 'draw';
      return { success: true, gameOver: true, winner: 'draw' };
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
    return { success: true, gameOver: false };
  }

  checkWin(symbol) {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (this.board[a] === symbol && 
          this.board[b] === symbol && 
          this.board[c] === symbol) {
        this.winningCombination = combination;
        return true;
      }
    }
    return false;
  }

  checkDraw() {
    return this.board.every(cell => cell !== '');
  }

  getGameState() {
    return {
      id: this.id,
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameStatus: this.gameStatus,
      winner: this.winner,
      winningCombination: this.winningCombination,
      players: this.players.map(player => ({ id: player.id, name: player.name }))
    };
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create a new game
  socket.on('createGame', (playerName) => {
    const gameId = generateShortGameId();
    const player = { id: socket.id, name: playerName };
    const game = new Game(gameId, player);
    
    games.set(gameId, game);
    socket.join(gameId);
    
    socket.emit('gameCreated', {
      gameId,
      gameState: game.getGameState()
    });
    
    console.log(`Game created: ${gameId} by ${playerName}`);
  });

  // Join an existing game
  socket.on('joinGame', ({ gameId, playerName }) => {
    console.log(`Player ${playerName} attempting to join game ${gameId}`);
    const game = games.get(gameId);
    
    if (!game) {
      console.log(`Game ${gameId} not found`);
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    if (game.gameStatus !== 'waiting') {
      console.log(`Game ${gameId} is not waiting (status: ${game.gameStatus})`);
      socket.emit('error', { message: 'Game is full or already started' });
      return;
    }
    
    const player = { id: socket.id, name: playerName };
    const success = game.addPlayer(player);
    
    if (success) {
      socket.join(gameId);
      
      // Notify both players
      io.to(gameId).emit('playerJoined', {
        gameState: game.getGameState(),
        newPlayer: { id: socket.id, name: playerName }
      });
      
      console.log(`Player ${playerName} joined game ${gameId}`);
    } else {
      console.log(`Game ${gameId} is full`);
      socket.emit('error', { message: 'Game is full' });
    }
  });

  // Make a move
  socket.on('makeMove', ({ gameId, position }) => {
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    // Find player index
    const playerIndex = game.players.findIndex(p => p.id === socket.id);
    
    if (playerIndex === -1) {
      socket.emit('error', { message: 'You are not a player in this game' });
      return;
    }
    
    const result = game.makeMove(playerIndex, position);
    
    if (result.success) {
      // Notify all players in the game
      io.to(gameId).emit('moveMade', {
        position,
        symbol: playerIndex === 0 ? 'X' : 'O',
        gameState: game.getGameState()
      });
      
      console.log(`Move made in game ${gameId}: ${position} by player ${playerIndex}`);
    } else {
      socket.emit('error', { message: 'Invalid move' });
    }
  });

  // Get game state
  socket.on('getGameState', (gameId) => {
    const game = games.get(gameId);
    
    if (game) {
      socket.emit('gameState', game.getGameState());
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  // Request rematch
  socket.on('requestRematch', (gameId) => {
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    const playerIndex = game.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) {
      socket.emit('error', { message: 'You are not a player in this game' });
      return;
    }
    
    // Mark this player as requesting rematch
    if (!game.rematchRequests) {
      game.rematchRequests = new Set();
    }
    game.rematchRequests.add(socket.id);
    
    // Notify other players about rematch request
    socket.to(gameId).emit('rematchRequested', {
      playerName: game.players[playerIndex].name
    });
    
    // If both players requested rematch, start new game
    if (game.rematchRequests.size === game.players.length) {
      // Create new game with same players
      const newGameId = generateShortGameId();
      const newGame = new Game(newGameId, game.players[0]);
      
      // Add second player
      if (game.players.length > 1) {
        newGame.addPlayer(game.players[1]);
      }
      
      // Replace old game with new game
      games.delete(gameId);
      games.set(newGameId, newGame);
      
      // Move all players to new game room
      io.in(gameId).socketsJoin(newGameId);
      io.in(gameId).socketsLeave(gameId);
      
      // Notify all players about new game
      io.to(newGameId).emit('rematchStarted', {
        gameId: newGameId,
        gameState: newGame.getGameState()
      });
      
      console.log(`Rematch started for game ${gameId} -> ${newGameId}`);
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove player from games
    for (let [gameId, game] of games) {
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        
        // Notify remaining players
        io.to(gameId).emit('playerLeft', {
          gameState: game.getGameState(),
          leftPlayer: socket.id
        });
        
        // If no players left, remove the game
        if (game.players.length === 0) {
          games.delete(gameId);
          console.log(`Game ${gameId} removed (no players left)`);
        }
        
        break;
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    activeGames: games.size,
    totalConnections: io.engine.clientsCount
  });
});

// Test endpoint to generate short game ID
app.get('/test-id', (req, res) => {
  const testId = generateShortGameId();
  res.json({
    shortGameId: testId,
    length: testId.length,
    timestamp: new Date().toISOString()
  });
});

// Get active games (for debugging)
app.get('/games', (req, res) => {
  const gameList = Array.from(games.values()).map(game => ({
    id: game.id,
    players: game.players.length,
    status: game.gameStatus,
    createdAt: game.createdAt
  }));
  
  res.json(gameList);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Tic Tac Toe server running on port ${PORT}`);
  console.log(`📡 Socket.IO endpoint: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
}); 