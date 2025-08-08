# 🎮 Multiplayer Tic Tac Toe

A real-time multiplayer Tic Tac Toe game built with React frontend and Node.js backend using Socket.IO for real-time communication.

## ✨ Features

- **Real-time Multiplayer**: Play with friends online in real-time
- **Game Rooms**: Create and join games with unique IDs
- **Live Updates**: See moves instantly as they happen
- **Turn Management**: Automatic turn switching and validation
- **Win Detection**: Automatic win/draw detection with visual feedback
- **Player Management**: Handle player connections and disconnections
- **Modern UI**: Beautiful, responsive design with animations
- **Connection Status**: Real-time connection indicator

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone or download the project**
2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

### Running the Application

1. **Start both server and client:**
   ```bash
   npm run dev
   ```

2. **Or start them separately:**
   ```bash
   # Terminal 1 - Start the backend server
   npm run server
   
   # Terminal 2 - Start the React frontend
   npm run client
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Health Check: http://localhost:3001/health

## 🎮 How to Play

### Creating a Game
1. Enter your name
2. Click "Create Game"
3. Share the generated Game ID with your friend
4. Wait for your friend to join

### Joining a Game
1. Enter your name
2. Enter the Game ID shared by your friend
3. Click "Join Game"
4. Start playing!

### Game Rules
- Players take turns placing X and O on the board
- First player to get 3 in a row (horizontally, vertically, or diagonally) wins
- If all cells are filled without a winner, it's a draw
- X always goes first

## 🏗️ Project Structure

```
multiplayer-tic-tac-toe/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Component styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Main server file
│   └── package.json
├── package.json           # Root configuration
└── README.md
```

## 🔧 Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Socket.IO Client**: Real-time communication
- **CSS3**: Modern styling with animations

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Socket.IO**: Real-time bidirectional communication
- **UUID**: Unique game ID generation

## 📡 Socket.IO Events

### Client to Server
- `createGame`: Create a new game
- `joinGame`: Join an existing game
- `makeMove`: Make a move on the board
- `getGameState`: Request current game state

### Server to Client
- `gameCreated`: Notify when game is created
- `playerJoined`: Notify when a player joins
- `moveMade`: Broadcast move to all players
- `playerLeft`: Notify when a player disconnects
- `error`: Send error messages

## 🎯 Game State Management

The server manages game state including:
- **Board State**: Current board configuration
- **Player Turn**: Whose turn it is
- **Game Status**: waiting, playing, or finished
- **Winner**: Who won (or draw)
- **Winning Combination**: Which cells form the winning line

## 🔄 Real-time Features

### Live Updates
- Moves are broadcast instantly to all players
- Turn indicators update in real-time
- Game status changes are reflected immediately

### Connection Handling
- Automatic reconnection on connection loss
- Player disconnection detection
- Game state preservation during reconnections

### Error Handling
- Invalid move prevention
- Turn validation
- Connection error recovery

## 🎨 UI Features

### Visual Feedback
- **Hover Effects**: Cells highlight on hover
- **Winning Animation**: Winning cells pulse with green background
- **Status Indicators**: Color-coded status messages
- **Player Indicators**: Show current player and turn

### Responsive Design
- Works on desktop, tablet, and mobile
- Adaptive layout for different screen sizes
- Touch-friendly interface

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)
1. Push the `server` directory to GitHub
2. Connect to Railway or Heroku
3. Set environment variables if needed
4. Deploy

### Frontend Deployment (Netlify/Vercel)
1. Update `SERVER_URL` in `client/src/App.js` to your deployed backend URL
2. Push the `client` directory to GitHub
3. Connect to Netlify or Vercel
4. Deploy

### Environment Variables
```bash
# Backend
PORT=3001

# Frontend (update in App.js)
SERVER_URL=https://your-backend-url.com
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start both server and client
npm run server       # Start only the backend server
npm run client       # Start only the React frontend
npm run build        # Build the React app for production
npm run install:all  # Install dependencies for all packages
```

### Adding Features
- **Chat System**: Add real-time messaging between players
- **Game History**: Track and display previous games
- **AI Opponent**: Add single-player mode with AI
- **Tournaments**: Create tournament brackets
- **Custom Boards**: Support for different board sizes

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if the server is running on port 3001
   - Verify the SERVER_URL in App.js
   - Check firewall settings

2. **Game Not Starting**
   - Ensure both players have joined
   - Check browser console for errors
   - Verify Socket.IO connection

3. **Moves Not Syncing**
   - Check network connectivity
   - Verify Socket.IO events are firing
   - Check server logs for errors

### Debug Mode
- Open browser developer tools
- Check the Console tab for connection status
- Monitor Network tab for Socket.IO connections

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🎯 Future Enhancements

- [ ] Chat functionality
- [ ] Game history and statistics
- [ ] AI opponent
- [ ] Tournament mode
- [ ] Custom board sizes
- [ ] Sound effects
- [ ] Mobile app version

---

**Enjoy playing multiplayer Tic Tac Toe! 🎮** 