# Server Build Commands

## 📦 Server Setup

The server is a **Node.js/Express application** that runs directly from source - **no build step required**.

## Available Commands

### Development Mode (with auto-reload)
```bash
cd server
npm install        # Install dependencies (first time only)
npm run dev        # Start server with auto-reload on file changes
```

### Production Mode
```bash
cd server
npm install        # Install dependencies (first time only)
npm start          # Start server
```

## Installation

### First Time Setup
```bash
cd server
npm install
```

This installs all dependencies listed in `package.json`:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- nodemailer
- passport
- passport-google-oauth20
- speakeasy
- cors
- dotenv

## Environment Setup

Create a `.env` file in the `server/` directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/loginMVP
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:5173
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_CLIENT_ID=your-client-id (optional)
GOOGLE_CLIENT_SECRET=your-client-secret (optional)
NODE_ENV=development
```

## Quick Start

```bash
# Terminal 1 - Start Server
cd server
npm install
npm run dev

# Terminal 2 - Start Client (if needed)
cd client
npm install
npm run dev
```

## Production Deployment

For production deployment (Railway, Render, Heroku, etc.):

### Build Command (if required by platform)
```bash
npm install
```

### Start Command
```bash
npm start
```

**Note:** Some platforms may require:
- `npm ci` instead of `npm install` (for production)
- Setting `NODE_ENV=production` in environment variables

## No Build Step Needed

Unlike frontend applications (React, Vue, etc.), Node.js servers:
- ✅ Run directly from source code
- ✅ No compilation needed
- ✅ No bundling required
- ✅ Just install dependencies and run!

## Troubleshooting

### "Cannot find module" errors
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
Change `PORT` in `.env` or kill the process using port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

---

**Summary:** Just `npm install` once, then `npm start` or `npm run dev` - that's it! 🚀

