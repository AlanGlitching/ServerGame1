# 🚀 Deployment Guide

This guide will help you deploy the Battleship Game to Netlify (frontend) and Railway (backend).

## 📋 Prerequisites

- GitHub account
- Netlify account (free)
- Railway account (free tier available)

## 🎯 Step 1: Backend Deployment (Railway)

### 1.1 Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository: `AlanGlitching/ServerGame1`
6. Railway will auto-detect the Node.js app in the `server` folder
7. Click "Deploy"

### 1.2 Get Your Railway URL
1. Once deployed, click on your project
2. Go to the "Settings" tab
3. Copy the "Domain" URL (e.g., `https://your-app-name.railway.app`)

## 🎨 Step 2: Frontend Deployment (Netlify)

### 2.1 Update Server URL
1. Edit `client/main.js`
2. Replace the `SERVER_URL` with your Railway URL:
```javascript
const SERVER_URL = import.meta.env.PROD 
  ? 'https://your-app-name.railway.app'  // Your Railway URL here
  : 'http://localhost:3001';
```

### 2.2 Deploy to Netlify
1. Go to [Netlify.com](https://netlify.com)
2. Sign in with your GitHub account
3. Click "New site from Git"
4. Choose GitHub and select your repository
5. Configure build settings:
   - **Base directory**: Leave empty
   - **Build command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/dist`
6. Click "Deploy site"

## 🔧 Step 3: Environment Variables (Optional)

### Railway Environment Variables
If needed, you can set these in Railway:
- `PORT`: Railway sets this automatically
- `NODE_ENV`: `production`

### Netlify Environment Variables
If needed, you can set these in Netlify:
- `VITE_SERVER_URL`: Your Railway URL

## 🎮 Step 4: Test Your Deployment

1. **Test Backend**: Visit your Railway URL + `/health`
   - Should return: `{"status":"OK","timestamp":"...","activeRooms":0,"waitingPlayers":0}`

2. **Test Frontend**: Visit your Netlify URL
   - Should show the Battleship Game interface
   - Try connecting with two browser tabs to test multiplayer

## 🐛 Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**
   - Check that the `SERVER_URL` in `client/main.js` is correct
   - Ensure Railway app is running (check Railway dashboard)

2. **Build fails on Netlify**
   - Check build logs in Netlify dashboard
   - Ensure all dependencies are in `package.json`
   - Use the correct build command: `cd client && npm install && npm run build`

3. **Railway deployment fails**
   - Check Railway logs
   - Ensure `server/package.json` has correct start script

### Debug Commands

```bash
# Test backend locally
curl http://localhost:3001/health

# Test frontend locally
npm run dev:client

# Build frontend locally
npm run build

# Check if servers are running
netstat -an | findstr :300
```

## 🔄 Updating Your Deployment

### Backend Updates
1. Push changes to GitHub
2. Railway will automatically redeploy

### Frontend Updates
1. Push changes to GitHub
2. Netlify will automatically redeploy

## 📞 Support

If you encounter issues:
1. Check the logs in Railway/Netlify dashboards
2. Verify all URLs are correct
3. Test locally first with `npm run dev`

## 🎉 Success!

Once deployed, players can:
1. Visit your Netlify URL
2. Enter their name
3. Wait for an opponent
4. Play battleship in real-time!

Your game is now live and ready for multiplayer battles! 🚢⚔️ 