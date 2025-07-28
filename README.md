# Battleship Game with Socket.IO

A multiplayer battleship game built with Socket.IO, featuring real-time gameplay, ship placement, and turn-based combat. The game includes a frontend (deployable to Netlify) and backend (deployable to Railway).

## Features

- 🚢 **Classic Battleship Gameplay**: Place ships and take turns firing at your opponent
- 👥 **Multiplayer Support**: Real-time 1v1 battles with automatic matchmaking
- 📡 **Socket.IO Integration**: Real-time communication and state synchronization
- 🎯 **Interactive Ship Placement**: Drag-and-drop style ship placement with validation
- 🎨 **Modern UI**: Clean, responsive design with visual feedback
- ⚡ **Turn-based Combat**: Real-time turn management and shot validation
- 🏆 **Win/Loss Detection**: Automatic game end detection and winner announcement

## Game Rules

1. **Ship Placement**: Each player places 5 ships on their 10x10 grid:
   - Carrier (5 cells)
   - Battleship (4 cells)
   - Cruiser (3 cells)
   - Submarine (3 cells)
   - Destroyer (2 cells)

2. **Gameplay**: Players take turns firing at their opponent's board
3. **Victory**: First player to sink all opponent's ships wins

## Local Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run dev:server  # Backend (port 3001)
npm run dev:client  # Frontend (port 3000)
```

### Access the Application

- Frontend: http://localhost:3000
- Backend Health Check: http://localhost:3001/health

## Deployment Guide

### Frontend Deployment (Netlify)

1. Push the `client` directory to GitHub
2. Connect your GitHub repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. After deployment, update the `SERVER_URL` in `client/main.js` with your Railway backend URL

### Backend Deployment (Railway)

1. Push the `server` directory to GitHub
2. Connect your GitHub repository to Railway
3. Railway will automatically detect and deploy the Node.js application
4. Copy the Railway-provided URL

### Update Frontend Server URL

After deployment, update the frontend to connect to your Railway backend:

1. Edit `client/main.js`
2. Replace `'https://your-railway-app.railway.app'` with your actual Railway URL
3. Redeploy the frontend

## Project Structure

```
Server_Game/
├── client/              # Frontend (Netlify deployment)
│   ├── index.html      # Main game interface
│   ├── main.js         # Game logic and Socket.IO client
│   ├── package.json    # Frontend dependencies
│   ├── vite.config.js  # Vite configuration
│   └── netlify.toml    # Netlify configuration
├── server/              # Backend (Railway deployment)
│   ├── index.js        # Socket.IO server and game logic
│   ├── package.json    # Backend dependencies
│   └── railway.json    # Railway configuration
├── package.json         # Root configuration
└── README.md           # Documentation
```

## Technology Stack

### Frontend
- HTML5 + CSS3
- Socket.IO Client
- Vite (Build tool)
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- Socket.IO
- CORS

## Socket.IO Events

### Client to Server
- `joinWaitingRoom`: Join the matchmaking queue
- `placeShips`: Submit ship placement configuration
- `makeShot`: Fire at opponent's board

### Server to Client
- `waitingRoomUpdate`: Update waiting room status
- `gameMatched`: Notify when players are matched
- `playerReady`: Notify when opponent is ready
- `gameStarted`: Start the game
- `shotResult`: Return shot results
- `opponentDisconnected`: Handle opponent disconnection

## Game Flow

1. **Waiting Room**: Players join and wait for matchmaking
2. **Ship Placement**: Matched players place their ships
3. **Game Start**: Both players ready → game begins
4. **Combat**: Turn-based shooting until victory
5. **Game End**: Winner announced, option to play again

## Customization

You can easily extend this game with:

- **Chat System**: Add real-time messaging between players
- **Room System**: Create private rooms with codes
- **AI Opponent**: Add single-player mode with AI
- **Statistics**: Track wins, losses, and accuracy
- **Custom Ships**: Allow different ship configurations
- **Power-ups**: Add special abilities or weapons

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check if the server is running and ports are correct
2. **Deployment Issues**: Verify the frontend server URL is updated after deployment
3. **CORS Errors**: Ensure backend CORS configuration is correct
4. **Ship Placement Issues**: Check browser console for validation errors

### Debugging

- **Frontend**: Check browser developer tools console
- **Backend**: Check Railway logs or local terminal output
- **Socket.IO**: Use browser network tab to monitor WebSocket connections

## License

MIT License 