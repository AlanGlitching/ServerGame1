@echo off
echo ========================================
echo Battleship Game - Deployment Helper
echo ========================================
echo.

echo 🚀 DEPLOYMENT STEPS:
echo.
echo 1. BACKEND (Railway):
echo    - Go to: https://railway.app
echo    - Sign in with GitHub
echo    - Click "New Project"
echo    - Select "Deploy from GitHub repo"
echo    - Choose: AlanGlitching/ServerGame1
echo    - Wait for deployment
echo    - Copy your Railway URL
echo.
echo 2. FRONTEND (Netlify):
echo    - Go to: https://netlify.com
echo    - Sign in with GitHub
echo    - Click "New site from Git"
echo    - Choose: AlanGlitching/ServerGame1
echo    - Build command: cd client ^&^& npm install ^&^& npm run build
echo    - Publish directory: client/dist
echo    - Deploy!
echo.
echo 3. CONNECT THEM:
echo    - Edit client/main.js
echo    - Replace Railway URL
echo    - Push changes to GitHub
echo.

echo 📋 Current Status:
echo - Repository: https://github.com/AlanGlitching/ServerGame1
echo - Local servers: Running on ports 3000 and 3001
echo.

echo 🎮 Test locally:
echo - Game: http://localhost:3000
echo - Backend: http://localhost:3001/health
echo.

pause 