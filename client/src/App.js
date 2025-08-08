import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Smart server URL detection
function getServerURL() {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Netlify deployment - replace with your actual backend URL
  if (hostname.includes('netlify.app')) {
    // Replace this with your actual Railway URL
    return 'https://testform1-production.up.railway.app';
  }
  
  // Default fallback
  return 'http://localhost:3001';
}

const SERVER_URL = getServerURL();

function App() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [joinGameId, setJoinGameId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [rematchRequestedBy, setRematchRequestedBy] = useState('');

  // Initialize socket connection
  useEffect(() => {
    if (!SERVER_URL) {
      console.log('❌ No server URL configured for this environment');
      setError('Backend server not configured. Please deploy the backend server first.');
      return;
    }
    
    console.log('🔌 Initializing Socket.IO connection to:', SERVER_URL);
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to server with ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      setError(`Connection error: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    });

    newSocket.on('gameCreated', (data) => {
      console.log('🎮 Game created:', data);
      setGameState(data.gameState);
      setGameId(data.gameId);
      setSuccess(`Game created! Share this ID with your friend: ${data.gameId}`);
      setTimeout(() => setSuccess(''), 10000);
    });

    newSocket.on('playerJoined', (data) => {
      console.log('👥 Player joined:', data);
      setGameState(data.gameState);
      setSuccess(`${data.newPlayer.name} joined the game!`);
      setTimeout(() => setSuccess(''), 5000);
    });

    newSocket.on('moveMade', (data) => {
      console.log('🎯 Move made:', data);
      setGameState(data.gameState);
    });

    newSocket.on('playerLeft', (data) => {
      console.log('👋 Player left:', data);
      setGameState(data.gameState);
      setError('A player left the game');
      setTimeout(() => setError(''), 5000);
    });

    newSocket.on('error', (data) => {
      console.error('❌ Server error:', data);
      setError(data.message);
      setTimeout(() => setError(''), 5000);
    });

    newSocket.on('rematchRequested', (data) => {
      console.log('🔄 Rematch requested by:', data.playerName);
      setRematchRequestedBy(data.playerName);
      setSuccess(`${data.playerName} wants a rematch! Click "Rematch" to accept.`);
    });

    newSocket.on('rematchStarted', (data) => {
      console.log('🔄 Rematch started:', data);
      setGameState(data.gameState);
      setGameId(data.gameId);
      setRematchRequested(false);
      setRematchRequestedBy('');
      setSuccess('Rematch started! New game begins.');
      setTimeout(() => setSuccess(''), 5000);
    });

    return () => {
      console.log('🔌 Closing Socket.IO connection');
      newSocket.close();
    };
  }, []);

  // Create a new game
  const createGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    console.log('🎮 Creating game for player:', playerName);
    socket.emit('createGame', playerName);
  };

  // Join an existing game
  const joinGame = () => {
    if (!playerName.trim() || !joinGameId.trim()) {
      setError('Please enter your name and game ID');
      return;
    }
    console.log('🎮 Joining game:', joinGameId, 'as player:', playerName);
    socket.emit('joinGame', { gameId: joinGameId, playerName });
  };

  // Make a move
  const makeMove = (position) => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    
    // Check if it's the current player's turn
    const currentPlayerIndex = gameState.players.findIndex(p => p.id === socket.id);
    if (currentPlayerIndex !== gameState.currentPlayer) {
      setError("It's not your turn!");
      setTimeout(() => setError(''), 3000);
      return;
    }

    console.log('🎯 Making move at position:', position);
    socket.emit('makeMove', { gameId: gameState.id, position });
  };

  // Reset game
  const resetGame = () => {
    setGameState(null);
    setGameId('');
    setJoinGameId('');
    setError('');
    setSuccess('');
    setRematchRequested(false);
    setRematchRequestedBy('');
  };

  // Request rematch
  const requestRematch = () => {
    if (!gameState || !socket) return;
    
    console.log('🔄 Requesting rematch for game:', gameState.id);
    socket.emit('requestRematch', gameState.id);
    setRematchRequested(true);
    setSuccess('Rematch requested! Waiting for opponent...');
  };

  // Copy game ID to clipboard
  const copyGameId = async () => {
    if (!gameId) return;
    
    try {
      await navigator.clipboard.writeText(gameId);
      setSuccess('Game ID copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to copy game ID:', err);
      setError('Failed to copy game ID');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Get current player symbol
  const getPlayerSymbol = () => {
    if (!gameState || !socket) return null;
    const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
    return playerIndex === 0 ? 'X' : 'O';
  };

  // Get status message
  const getStatusMessage = () => {
    if (!gameState) return 'Create or join a game to start playing!';
    
    if (gameState.gameStatus === 'waiting') {
      return 'Waiting for another player to join...';
    }
    
    if (gameState.gameStatus === 'finished') {
      if (gameState.winner === 'draw') {
        return "It's a draw!";
      }
      const winner = gameState.players[gameState.winner];
      return `${winner.name} wins!`;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    return `${currentPlayer.name}'s turn`;
  };

  // Get status class
  const getStatusClass = () => {
    if (!gameState) return '';
    
    if (gameState.gameStatus === 'finished') {
      if (gameState.winner === 'draw') return 'draw';
      return 'winner';
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const playerSymbol = currentPlayer.id === socket.id ? getPlayerSymbol() : (getPlayerSymbol() === 'X' ? 'O' : 'X');
    return `player-${playerSymbol.toLowerCase()}`;
  };

  // Render game board
  const renderBoard = () => {
    if (!gameState) return null;

    return (
      <div className="board">
        {gameState.board.map((cell, index) => (
          <div
            key={index}
            className={`cell ${cell.toLowerCase()} ${
              gameState.winningCombination && gameState.winningCombination.includes(index) ? 'winning' : ''
            }`}
            onClick={() => makeMove(index)}
          >
            {cell}
          </div>
        ))}
      </div>
    );
  };

  // Render player list
  const renderPlayerList = () => {
    if (!gameState) return null;

    return (
      <div className="player-list">
        {gameState.players.map((player, index) => (
          <div
            key={player.id}
            className={`player-item ${gameState.currentPlayer === index && gameState.gameStatus === 'playing' ? 'current' : ''}`}
          >
            <div>{player.name}</div>
            <div>{index === 0 ? 'X' : 'O'}</div>
            {player.id === socket.id && <div>(You)</div>}
          </div>
        ))}
      </div>
    );
  };

  // Render game info
  const renderGameInfo = () => {
    if (!gameState) return null;

    return (
      <div className="game-info">
        <h3>Game Information</h3>
        <div className="game-id-container">
          <span>Game ID: </span>
          <button 
            className="game-id-button" 
            onClick={copyGameId}
            title="Click to copy game ID"
          >
            {gameState.id}
          </button>
        </div>
        <div>Status: {gameState.gameStatus}</div>
        <div>Socket ID: {socket?.id}</div>
        {renderPlayerList()}
      </div>
    );
  };

  // Render connection status
  const renderConnectionStatus = () => (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      padding: '10px', 
      borderRadius: '5px',
      backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
      color: isConnected ? '#155724' : '#721c24',
      fontSize: '12px'
    }}>
      {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
    </div>
  );

  // Render backend setup message
  const renderBackendSetupMessage = () => {
    return null; // No longer needed since we have a real backend URL
  };

  return (
    <div className="container">
      {renderConnectionStatus()}
      {renderBackendSetupMessage()}
      
      <div className="game-container">
        <div className="header">
          <h1>🎮 Multiplayer Tic Tac Toe</h1>
          <p>Play with friends online!</p>
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {!gameState ? (
          // Game setup screen
          <div>
            <div className="form-group">
              <label htmlFor="playerName">Your Name:</label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength="20"
              />
            </div>

            <div style={{ marginTop: '30px' }}>
              <h3>Create a New Game</h3>
              <button className="btn btn-primary" onClick={createGame}>
                Create Game
              </button>
            </div>

            <div style={{ marginTop: '30px' }}>
              <h3>Join an Existing Game</h3>
              <div className="form-group">
                <label htmlFor="joinGameId">Game ID:</label>
                <input
                  type="text"
                  id="joinGameId"
                  value={joinGameId}
                  onChange={(e) => setJoinGameId(e.target.value)}
                  placeholder="Enter game ID"
                />
              </div>
              <button className="btn btn-secondary" onClick={joinGame}>
                Join Game
              </button>
            </div>
          </div>
        ) : (
          // Game screen
          <div>
            <div className={`status ${getStatusClass()}`}>
              {getStatusMessage()}
            </div>

            {renderGameInfo()}
            {renderBoard()}

            <div className="controls">
              {gameState.gameStatus === 'finished' && (
                <button 
                  className={`btn ${rematchRequested ? 'btn-secondary' : 'btn-primary'}`} 
                  onClick={requestRematch}
                  disabled={rematchRequested}
                >
                  {rematchRequested ? 'Rematch Requested' : '🔄 Rematch'}
                </button>
              )}
              <button className="btn btn-secondary" onClick={resetGame}>
                New Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 