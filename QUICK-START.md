# 🚀 Quick Start Guide

## 🎮 Your Battleship Game is Ready!

### ✅ What's Already Done
- ✅ Complete battleship game with Socket.IO
- ✅ Repository pushed to GitHub: `AlanGlitching/ServerGame1`
- ✅ All dependencies installed
- ✅ Local development servers running
- ✅ Backend health check working
- ✅ Frontend accessible at http://localhost:3000

### 🎯 Play Right Now (Local)
1. **Open your browser** and go to: http://localhost:3000
2. **Enter your name** and click "Join Waiting Room"
3. **Open another browser tab** and do the same
4. **Place your ships** by clicking on the ship list, then clicking on your board
5. **Start the game** when both players are ready
6. **Take turns** firing at your opponent's board!

### 🌐 Deploy to Production

#### Step 1: Deploy Backend (Railway)
1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select: `AlanGlitching/ServerGame1`
5. Railway will auto-detect the server folder
6. Copy your Railway URL (e.g., `https://your-app.railway.app`)

#### Step 2: Deploy Frontend (Netlify)
1. Go to [Netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click "New site from Git"
4. Select: `AlanGlitching/ServerGame1`
5. Set build settings:
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/dist`
6. Deploy!

#### Step 3: Connect Frontend to Backend
1. Edit `client/main.js`
2. Replace the Railway URL:
```javascript
const SERVER_URL = import.meta.env.PROD 
  ? 'https://your-app.railway.app'  // Your Railway URL here
  : 'http://localhost:3001';
```
3. Push changes to GitHub
4. Netlify will auto-redeploy

### 🎮 Game Features
- **Real-time multiplayer** with automatic matchmaking
- **Interactive ship placement** with validation
- **Turn-based combat** with hit/miss feedback
- **Win detection** when all ships are sunk
- **Modern UI** with responsive design

### 🛠️ Development Commands
```bash
# Start both servers
npm run dev

# Start only backend
npm run dev:server

# Start only frontend
npm run dev:client

# Install dependencies
npm run install:all
```

### 📁 Project Structure
```
ServerGame1/
├── client/          # Frontend (Netlify)
├── server/          # Backend (Railway)
├── DEPLOYMENT.md    # Detailed deployment guide
├── README.md        # Complete documentation
└── test-game.html   # System test page
```

### 🎉 You're All Set!
Your battleship game is ready for both local development and production deployment. Players can connect through the server and enjoy real-time battleship battles!

**Local URLs:**
- 🎮 Game: http://localhost:3000
- 🔧 Backend: http://localhost:3001/health
- 🧪 Test Page: test-game.html

**Next Steps:**
1. Test locally with multiple browser tabs
2. Deploy to Railway and Netlify
3. Share your game URL with friends!

Happy gaming! 🚢⚔️ 