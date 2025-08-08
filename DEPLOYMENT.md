# 🚀 Deployment Guide - Updated

## Backend Deployment (Railway) - FIXED

### Step 1: Prepare for Railway Deployment
The project has been reorganized for better deployment:
- ✅ Main server file: `server/index.js`
- ✅ Package.json updated with correct scripts
- ✅ Railway configuration added (`railway.json`)
- ✅ Procfile updated
- ✅ Duplicate server file removed

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository
5. **Important**: Set the root directory to the **root of your repository** (not `server`)
6. Railway will automatically detect it's a Node.js app and use the updated configuration

### Step 3: Verify Deployment
After deployment, Railway will provide a URL like:
`https://your-app-name.railway.app`

Test the deployment:
- Health check: `https://your-app-name.railway.app/health`
- Should return: `{"status":"OK","timestamp":"...","activeGames":0,"totalConnections":0}`

### Step 4: Update Frontend Configuration
Update the backend URL in `client/src/App.js`:

```javascript
// Replace this line in the getServerURL() function:
if (hostname.includes('netlify.app')) {
  return 'https://your-app-name.railway.app'; // Replace with your actual Railway URL
}
```

## Frontend Deployment (Netlify)

### Step 1: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub account
4. Select your repository
5. Set build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. Click "Deploy site"

### Step 2: Configure Environment Variables (Optional)
In Netlify dashboard:
- Go to Site settings → Environment variables
- Add `REACT_APP_SERVER_URL` with your Railway backend URL

## Troubleshooting Railway Deployment

### Common Issues and Solutions

1. **Deployment Canceled/Failed**
   - ✅ **FIXED**: Removed duplicate server files
   - ✅ **FIXED**: Updated package.json main entry point
   - ✅ **FIXED**: Added proper Railway configuration

2. **Port Issues**
   - Railway automatically sets `PORT` environment variable
   - Server code uses `process.env.PORT || 3001`

3. **Build Failures**
   - Ensure all dependencies are in package.json
   - Check that Node.js version is compatible (18.x)

4. **Health Check Failures**
   - Verify `/health` endpoint is working
   - Check server logs in Railway dashboard

### Testing Your Deployment

1. **Backend Test**:
   ```bash
   curl https://your-app-name.railway.app/health
   ```

2. **Frontend Test**:
   - Visit your Netlify URL
   - Try creating a game
   - Check browser console for connection status

## Quick Deploy Commands

```bash
# Test locally first
npm run install:all
npm run dev

# Deploy backend to Railway (via Railway dashboard)
# 1. Connect GitHub repo
# 2. Set root directory to repository root
# 3. Deploy

# Deploy frontend to Netlify
cd client
npm run build
# Then deploy via Netlify dashboard or CLI
```

## Environment Variables

### Backend (Railway)
Railway automatically sets:
- `PORT` - Automatically assigned
- `NODE_ENV` - Set to 'production'

### Frontend (Netlify)
Optional environment variables:
- `REACT_APP_SERVER_URL` - Your Railway backend URL

## File Structure After Fixes

```
Server_Game/
├── server/
│   ├── index.js          # Main server file
│   └── package.json      # Server dependencies
├── client/
│   ├── src/
│   │   └── App.js        # Frontend with server URL config
│   └── package.json      # Client dependencies
├── package.json          # Root package.json (updated)
├── Procfile             # Updated for Railway
├── railway.json         # Railway configuration
├── netlify.toml         # Netlify configuration
└── .gitignore           # Clean deployment
```

## Next Steps

1. **Deploy Backend**: Use Railway dashboard with updated configuration
2. **Update Frontend**: Change server URL in `client/src/App.js`
3. **Deploy Frontend**: Use Netlify dashboard
4. **Test**: Verify both deployments work together

The deployment should now work successfully! 🎉 