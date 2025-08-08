# 🚀 Deployment Guide

## Frontend Deployment (Netlify)

### Step 1: Deploy Backend First
Before deploying the frontend, you need to deploy the backend to a service like Railway, Render, or Heroku.

### Step 2: Update Backend URL
After deploying the backend, update the backend URL in `client/src/App.js`:

```javascript
// Replace this line in the getServerURL() function:
return 'https://your-backend-url.railway.app'; // Replace with your actual backend URL
```

### Step 3: Deploy to Netlify

#### Option A: Deploy via Netlify UI
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the `ServerGame1` repository
5. Set build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. Click "Deploy site"

#### Option B: Deploy via CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to client directory
cd client

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

## Backend Deployment (Railway)

### Step 1: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select the `ServerGame1` repository
5. Set the root directory to `server`
6. Railway will automatically detect it's a Node.js app and deploy

### Step 2: Get Backend URL
After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

### Step 3: Update Frontend
Update the backend URL in `client/src/App.js` with your Railway URL.

## Alternative Backend Services

### Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set root directory to `server`
5. Build command: `npm install`
6. Start command: `npm start`

### Heroku
1. Go to [heroku.com](https://heroku.com)
2. Create a new app
3. Connect your GitHub repository
4. Deploy the `server` directory

## Environment Variables

### Backend Environment Variables
Set these in your backend deployment:

```env
PORT=3001
NODE_ENV=production
```

### Frontend Environment Variables
For Netlify, you can set environment variables in the Netlify dashboard:
- Go to Site settings → Environment variables
- Add `REACT_APP_SERVER_URL` with your backend URL

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend has CORS configured for your Netlify domain
2. **Socket.IO Connection**: Ensure your backend URL is correct and accessible
3. **Build Failures**: Check that all dependencies are in package.json

### Testing Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.railway.app/health`
2. **Frontend**: Visit your Netlify URL
3. **Test Game**: Try creating and joining a game

## Quick Deploy Commands

```bash
# Deploy backend to Railway
cd server
railway login
railway init
railway up

# Deploy frontend to Netlify
cd client
npm run build
netlify deploy --prod --dir=build
``` 