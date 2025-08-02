import { io } from 'socket.io-client';

// Global variables
let socket;
let currentPlayer = null;
let gameState = {
  roomId: null,
  players: [],
  currentTurn: null,
  gameStarted: false,
  gameOver: false,
  winner: null
};

// Ship configurations
const SHIPS = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 }
];

// Game boards
let playerBoard = Array(10).fill().map(() => Array(10).fill(null));
let opponentBoard = Array(10).fill().map(() => Array(10).fill(null));
let placedShips = [];
let selectedShip = null;
let currentOrientation = 'horizontal';

// Server URL - Detect if we're on localhost or deployed
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const SERVER_URL = isLocalhost ? 'http://localhost:3001' : 'http://192.168.31.164:3001';

// Connection retry mechanism
let connectionRetries = 0;
const MAX_RETRIES = 5;

// Connection options optimized for local development
const SOCKET_OPTIONS = {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
  withCredentials: false
};

// DOM elements
const connectionStatus = document.getElementById('connectionStatus');
const joinForm = document.getElementById('joinForm');
const waitingRoom = document.getElementById('waitingRoom');
const gameArea = document.getElementById('gameArea');
const playerNameInput = document.getElementById('playerName');
const waitingCount = document.getElementById('waitingCount');
const gameStatus = document.getElementById('gameStatus');
const messageArea = document.getElementById('messageArea');
const playerBoardElement = document.getElementById('playerBoard');
const opponentBoardElement = document.getElementById('opponentBoard');
const shipList = document.getElementById('shipList');
const startGameBtn = document.getElementById('startGameBtn');
const shipPlacement = document.getElementById('shipPlacement');
const gameControls = document.getElementById('gameControls');
const serverStatus = document.getElementById('serverStatus');
const activeRooms = document.getElementById('activeRooms');

// Game over overlay elements
const gameOverlay = document.getElementById('gameOverlay');
const gameResult = document.getElementById('gameResult');
const resultTitle = document.getElementById('resultTitle');
const resultMessage = document.getElementById('resultMessage');

// Initialize
function init() {
  connectSocket();
  checkServerHealth();
  setInterval(checkServerHealth, 10000);
  createShipList();
}

// Connect Socket.IO
function connectSocket() {
  console.log('🔌 Attempting to connect to:', SERVER_URL);
  
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(SERVER_URL, SOCKET_OPTIONS);

  socket.on('connect', () => {
    console.log('✅ Socket.IO connected successfully!');
    console.log('Socket ID:', socket.id);
    console.log('Connected to server:', SERVER_URL);
    connectionRetries = 0;
    updateConnectionStatus(true);
    showMessage('Connected to game server!', 'success');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.IO disconnected:', reason);
    updateConnectionStatus(false);
    
    // Auto-reconnect on disconnect
    if (reason === 'io server disconnect') {
      console.log('🔄 Server disconnected, attempting to reconnect...');
      setTimeout(() => {
        if (connectionRetries < MAX_RETRIES) {
          connectionRetries++;
          connectSocket();
        }
      }, 1000);
    }
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error);
    console.error('Error details:', {
      message: error.message,
      description: error.description,
      context: error.context,
      type: error.type
    });
    updateConnectionStatus(false);
    
    // Retry connection
    if (connectionRetries < MAX_RETRIES) {
      connectionRetries++;
      console.log(`🔄 Retrying connection (${connectionRetries}/${MAX_RETRIES})...`);
      setTimeout(() => {
        connectSocket();
      }, 2000);
    } else {
      console.error('❌ Max connection retries reached');
      showMessage(`Connection failed after ${MAX_RETRIES} attempts. Please check if the server is running.`, 'error');
    }
  });

  // Game events
  socket.on('waitingRoomUpdate', handleWaitingRoomUpdate);
  socket.on('gameMatched', handleGameMatched);
  socket.on('playerReady', handlePlayerReady);
  socket.on('gameStarted', handleGameStarted);
  socket.on('shotResult', handleShotResult);
  socket.on('opponentDisconnected', handleOpponentDisconnected);
}

// Update connection status
function updateConnectionStatus(connected) {
  if (connected) {
    connectionStatus.textContent = '✅ Connected';
    connectionStatus.className = 'connection-status connected';
  } else {
    connectionStatus.textContent = '❌ Disconnected';
    connectionStatus.className = 'connection-status disconnected';
  }
}

// Check server health
async function checkServerHealth() {
  try {
    // Try to fetch with CORS handling
    const response = await fetch(`${SERVER_URL}/health`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit' // Don't send credentials for CORS
    });
    
    if (response.ok) {
      const data = await response.json();
      serverStatus.textContent = '✅ Online';
      serverStatus.style.color = '#28a745';
      activeRooms.textContent = data.activeRooms || 0;
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.log('Health check failed (this is normal for CORS issues):', error.message);
    serverStatus.textContent = '⚠️ CORS Issue';
    serverStatus.style.color = '#ffc107';
    // Don't show this as a critical error since Socket.IO might still work
  }
}

// Join waiting room
window.joinWaitingRoom = function() {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    showMessage('Please enter your name!', 'error');
    return;
  }
  
  if (!socket.connected) {
    showMessage('Please connect to server first!', 'error');
    return;
  }
  
  socket.emit('joinWaitingRoom', playerName);
  currentPlayer = { name: playerName };
  
  joinForm.style.display = 'none';
  waitingRoom.style.display = 'block';
};

// Handle waiting room update
function handleWaitingRoomUpdate(data) {
  waitingCount.textContent = data.players.length;
}

// Handle game matched
function handleGameMatched(data) {
  gameState.roomId = data.roomId;
  gameState.players = data.players;
  
  waitingRoom.style.display = 'none';
  gameArea.style.display = 'block';
  
  createBoards();
  showMessage(`Matched with ${data.players.find(p => p.id !== socket.id).name}!`, 'success');
};

// Handle player ready
function handlePlayerReady(data) {
  if (data.playerId !== socket.id) {
    showMessage('Opponent is ready!', 'info');
  }
}

// Handle game started
function handleGameStarted(data) {
  gameState.gameStarted = true;
  gameState.currentTurn = data.currentTurn;
  
  shipPlacement.style.display = 'none';
  gameControls.style.display = 'block';
  
  updateGameStatus();
  showMessage('Game started!', 'success');
}

// Handle shot result
function handleShotResult(data) {
  const { coordinates, result, gameOver, winner, nextTurn } = data;
  const { x, y } = coordinates;
  
  if (data.shooter === socket.id) {
    // Update opponent's board with shot result
    opponentBoard[y][x] = result.hit ? 'H' : 'M';
    updateOpponentBoard();
    
    // Only show messages for hits and ship sinks
    if (result.hit) {
      if (result.sunk) {
        showMessage(`Ship sunk!`, 'success');
      } else {
        showMessage(`Hit!`, 'success');
      }
    }
    // Don't show miss messages to reduce clutter
  } else {
    // Update player's board with opponent's shot
    playerBoard[y][x] = result.hit ? 'H' : 'M';
    updatePlayerBoard();
    
    // Only show messages for hits and ship sinks
    if (result.hit) {
      if (result.sunk) {
        showMessage(`Your ship was sunk!`, 'error');
      } else {
        showMessage(`You were hit!`, 'error');
      }
    }
    // Don't show miss messages to reduce clutter
  }
  
  if (gameOver) {
    gameState.gameOver = true;
    gameState.winner = winner;
    
    if (winner === socket.id) {
      showMessage('You won!', 'success');
      showGameOverOverlay(true); // Show big win overlay
    } else {
      showMessage('You lost!', 'error');
      showGameOverOverlay(false); // Show big lose overlay
    }
  } else {
    gameState.currentTurn = nextTurn;
    updateGameStatus();
  }
}

// Handle opponent disconnected
function handleOpponentDisconnected() {
  showMessage('Opponent disconnected!', 'error');
  gameState.gameOver = true;
  
  // Show special overlay for opponent disconnect
  resultTitle.textContent = '🏴‍☠️ OPPONENT DISCONNECTED 🏴‍☠️';
  resultMessage.textContent = 'Your opponent has left the game. You win by default!';
  gameResult.className = 'game-result win';
  gameOverlay.classList.add('show');
}

// Create ship list
function createShipList() {
  shipList.innerHTML = '';
  SHIPS.forEach(ship => {
    const shipItem = document.createElement('div');
    shipItem.className = 'ship-item';
    shipItem.textContent = `${ship.name} (${ship.size})`;
    shipItem.onclick = () => selectShip(ship);
    shipList.appendChild(shipItem);
  });
}

// Select ship for placement
function selectShip(ship) {
  if (placedShips.includes(ship.name)) return;
  
  selectedShip = ship;
  
  // Update ship list UI
  document.querySelectorAll('.ship-item').forEach(item => {
    item.classList.remove('selected');
    if (item.textContent.includes(ship.name)) {
      item.classList.add('selected');
    }
  });
}

// Set ship orientation
window.setOrientation = function(orientation) {
  currentOrientation = orientation;
  
  document.getElementById('horizontalBtn').classList.toggle('active', orientation === 'horizontal');
  document.getElementById('verticalBtn').classList.toggle('active', orientation === 'vertical');
}

// Create boards
function createBoards() {
  createBoard(playerBoardElement, playerBoard, true);
  createBoard(opponentBoardElement, opponentBoard, false);
}

// Create a single board
function createBoard(container, board, isPlayerBoard) {
  container.innerHTML = '';
  
  // Add column headers
  const headerRow = document.createElement('div');
  headerRow.className = 'board-row';
  headerRow.appendChild(createCell(''));
  for (let i = 0; i < 10; i++) {
    headerRow.appendChild(createCell(String.fromCharCode(65 + i)));
  }
  container.appendChild(headerRow);
  
  // Add board rows
  for (let y = 0; y < 10; y++) {
    const row = document.createElement('div');
    row.className = 'board-row';
    
    // Add row header
    row.appendChild(createCell(y + 1));
    
    // Add board cells
    for (let x = 0; x < 10; x++) {
      const cell = createCell('');
      cell.dataset.x = x;
      cell.dataset.y = y;
      
      if (isPlayerBoard) {
        cell.onclick = () => handlePlayerBoardClick(x, y);
        cell.onmouseover = () => handlePlayerBoardHover(x, y);
        cell.onmouseout = () => handlePlayerBoardHoverOut();
      } else {
        cell.onclick = () => handleOpponentBoardClick(x, y);
      }
      
      row.appendChild(cell);
    }
    
    container.appendChild(row);
  }
}

// Create a single cell
function createCell(content) {
  const cell = document.createElement('div');
  cell.className = 'board-cell';
  cell.textContent = content;
  return cell;
}

// Handle player board click
function handlePlayerBoardClick(x, y) {
  if (!selectedShip || placedShips.includes(selectedShip.name)) return;
  
  if (canPlaceShip(x, y, selectedShip, currentOrientation)) {
    placeShip(x, y, selectedShip, currentOrientation);
    placedShips.push(selectedShip.name);
    selectedShip = null;
    
    // Update ship list UI
    document.querySelectorAll('.ship-item').forEach(item => {
      if (placedShips.includes(selectedShip?.name)) {
        item.classList.add('placed');
      }
    });
    
    // Check if all ships are placed
    if (placedShips.length === SHIPS.length) {
      startGameBtn.disabled = false;
    }
  } else {
    showMessage('Invalid ship placement!', 'error');
  }
}

// Handle player board hover
function handlePlayerBoardHover(x, y) {
  if (!selectedShip || placedShips.includes(selectedShip.name)) return;
  
  clearPlacementPreview();
  
  if (canPlaceShip(x, y, selectedShip, currentOrientation)) {
    showPlacementPreview(x, y, selectedShip, currentOrientation);
  }
}

// Handle player board hover out
function handlePlayerBoardHoverOut() {
  clearPlacementPreview();
}

// Handle opponent board click
function handleOpponentBoardClick(x, y) {
  if (!gameState.gameStarted || gameState.gameOver) return;
  if (gameState.currentTurn !== socket.id) {
    showMessage('Not your turn!', 'error');
    return;
  }
  if (opponentBoard[y][x] !== null) {
    showMessage('Already shot at this location!', 'error');
    return;
  }
  
  socket.emit('makeShot', { x, y });
}

// Check if ship can be placed
function canPlaceShip(x, y, ship, orientation) {
  for (let i = 0; i < ship.size; i++) {
    const checkX = orientation === 'horizontal' ? x + i : x;
    const checkY = orientation === 'horizontal' ? y : y + i;
    
    if (checkX >= 10 || checkY >= 10) return false;
    if (playerBoard[checkY][checkX] !== null) return false;
  }
  
  return true;
}

// Place ship on board
function placeShip(x, y, ship, orientation) {
  for (let i = 0; i < ship.size; i++) {
    const boardX = orientation === 'horizontal' ? x + i : x;
    const boardY = orientation === 'horizontal' ? y : y + i;
    
    playerBoard[boardY][boardX] = ship.name;
  }
  
  updatePlayerBoard();
}

// Show placement preview
function showPlacementPreview(x, y, ship, orientation) {
  for (let i = 0; i < ship.size; i++) {
    const checkX = orientation === 'horizontal' ? x + i : x;
    const checkY = orientation === 'horizontal' ? y : y + i;
    
    const cell = playerBoardElement.querySelector(`[data-x="${checkX}"][data-y="${checkY}"]`);
    if (cell) {
      cell.classList.add('placement');
    }
  }
}

// Clear placement preview
function clearPlacementPreview() {
  document.querySelectorAll('.board-cell.placement').forEach(cell => {
    cell.classList.remove('placement');
  });
}

// Update player board display
function updatePlayerBoard() {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = playerBoardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (cell) {
        cell.className = 'board-cell';
        if (playerBoard[y][x]) {
          cell.classList.add('ship');
          if (playerBoard[y][x] === 'H') {
            cell.classList.add('hit');
          }
        }
      }
    }
  }
}

// Update opponent board display
function updateOpponentBoard() {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const cell = opponentBoardElement.querySelector(`[data-x="${x}"][data-y="${y}"]`);
      if (cell) {
        cell.className = 'board-cell';
        if (opponentBoard[y][x] === 'H') {
          cell.classList.add('hit');
        } else if (opponentBoard[y][x] === 'M') {
          cell.classList.add('miss');
        }
      }
    }
  }
}

// Start game
window.startGame = function() {
  if (placedShips.length !== SHIPS.length) {
    showMessage('Please place all ships first!', 'error');
    return;
  }
  
  const ships = [];
  for (const shipName of placedShips) {
    const ship = SHIPS.find(s => s.name === shipName);
    // Find ship position on board
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (playerBoard[y][x] === shipName) {
          // Determine orientation
          let orientation = 'horizontal';
          if (x + ship.size <= 10) {
            let isHorizontal = true;
            for (let i = 1; i < ship.size; i++) {
              if (playerBoard[y][x + i] !== shipName) {
                isHorizontal = false;
                break;
              }
            }
            if (!isHorizontal) orientation = 'vertical';
          } else {
            orientation = 'vertical';
          }
          
          ships.push({
            name: shipName,
            size: ship.size,
            x: x,
            y: y,
            orientation: orientation
          });
          break;
        }
      }
    }
  }
  
  socket.emit('placeShips', ships);
};

// Reset ships
window.resetShips = function() {
  playerBoard = Array(10).fill().map(() => Array(10).fill(null));
  placedShips = [];
  selectedShip = null;
  
  updatePlayerBoard();
  createShipList();
  startGameBtn.disabled = true;
  clearPlacementPreview();
};

// New game
window.newGame = function() {
  // Reset game state
  gameState = {
    roomId: null,
    players: [],
    currentTurn: null,
    gameStarted: false,
    gameOver: false,
    winner: null
  };
  
  playerBoard = Array(10).fill().map(() => Array(10).fill(null));
  opponentBoard = Array(10).fill().map(() => Array(10).fill(null));
  placedShips = [];
  selectedShip = null;
  
  // Reset UI
  gameArea.style.display = 'none';
  joinForm.style.display = 'block';
  playerNameInput.value = '';
  
  // Rejoin waiting room
  if (currentPlayer) {
    socket.emit('joinWaitingRoom', currentPlayer.name);
    joinForm.style.display = 'none';
    waitingRoom.style.display = 'block';
  }
};

// Update game status
function updateGameStatus() {
  if (gameState.gameOver) {
    if (gameState.winner === socket.id) {
      gameStatus.textContent = '🎉 You won! Congratulations!';
      gameStatus.style.color = '#28a745';
    } else {
      gameStatus.textContent = '😔 You lost! Better luck next time!';
      gameStatus.style.color = '#dc3545';
    }
  } else if (gameState.gameStarted) {
    if (gameState.currentTurn === socket.id) {
      gameStatus.textContent = '🎯 Your turn - Click on opponent\'s board to shoot!';
      gameStatus.style.color = '#007bff';
    } else {
      gameStatus.textContent = '⏳ Opponent\'s turn - Please wait...';
      gameStatus.style.color = '#6c757d';
    }
  } else {
    gameStatus.textContent = '🚢 Setting up ships... Place all your ships to start!';
    gameStatus.style.color = '#1e3c72';
  }
}

// Show message
function showMessage(text, type = 'info') {
  // Show message area if it's hidden
  if (messageArea.style.display === 'none') {
    messageArea.style.display = 'block';
  }
  
  // Clear existing messages first to prevent stacking
  const existingMessages = messageArea.querySelectorAll('.message');
  if (existingMessages.length >= 3) {
    existingMessages[0].remove(); // Remove oldest message
  }
  
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  
  messageArea.appendChild(message);
  
  // Auto-remove after 3 seconds (shorter duration)
  setTimeout(() => {
    if (message.parentNode) {
      message.remove();
      
      // Hide message area if no messages left
      if (messageArea.children.length === 0) {
        messageArea.style.display = 'none';
      }
    }
  }, 3000);
}

// Show big win/lose overlay
function showGameOverOverlay(isWin) {
  if (isWin) {
    resultTitle.textContent = '🎉 VICTORY! 🎉';
    resultMessage.textContent = 'Congratulations! You have sunk all enemy ships and won the battle!';
    gameResult.className = 'game-result win';
  } else {
    resultTitle.textContent = '😔 DEFEAT 😔';
    resultMessage.textContent = 'All your ships have been sunk. Better luck next time!';
    gameResult.className = 'game-result lose';
  }
  
  gameOverlay.classList.add('show');
}

// Close game over overlay
window.closeGameOverlay = function() {
  gameOverlay.classList.remove('show');
};

// Start new game from overlay
window.startNewGame = function() {
  closeGameOverlay();
  newGame();
};

// Test connection manually
window.testConnection = function() {
  console.log('🔧 Manual connection test initiated');
  showMessage('Testing Socket.IO connection...', 'info');
  
  // Reset retry counter
  connectionRetries = 0;
  
  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
  }
  
  // Try to connect
  connectSocket();
  
  // Also test HTTP health (but don't rely on it)
  checkServerHealth();
  
  // Add a timeout to show connection status
  setTimeout(() => {
    if (socket && socket.connected) {
      showMessage('✅ Socket.IO connection successful!', 'success');
    } else {
      showMessage('❌ Socket.IO connection failed', 'error');
    }
  }, 5000);
};

// Page load initialization
document.addEventListener('DOMContentLoaded', init); 