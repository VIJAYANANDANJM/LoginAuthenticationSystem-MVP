# Vercel Frontend Routing Fix

## Problem
Frontend routes like `/reset-password`, `/verify-email`, etc. are showing 404 errors on Vercel.

## Solution

### Option 1: Verify vercel.json is in the correct location

The `vercel.json` file should be in the **root of your client directory** (where `package.json` is).

If Vercel is deploying from the **project root** (not the client folder), you need to:

1. **Check Vercel Project Settings**:
   - Go to Vercel Dashboard → Your Project → Settings
   - Check **Root Directory** - should be `client` or leave empty if deploying from root

2. **If Root Directory is empty** (deploying from project root):
   - Move `vercel.json` to project root
   - OR set Root Directory to `client` in Vercel settings

### Option 2: Update Vercel Build Settings

In Vercel Dashboard → Your Project → Settings → Build & Development Settings:

**Build Command:**
```bash
cd client && npm run build
```

**Output Directory:**
```
client/dist
```

**Install Command:**
```bash
cd client && npm install
```

### Option 3: Create vercel.json in project root (if needed)

If Vercel is deploying from project root, create `vercel.json` in the root:

```json
{
  "buildCommand": "cd client && npm run build",
  "outputDirectory": "client/dist",
  "devCommand": "cd client && npm run dev",
  "installCommand": "cd client && npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 4: Use Vercel CLI to test locally

```bash
# Install Vercel CLI
npm i -g vercel

# In your project root
vercel dev
```

This will test the routing locally before deploying.

## Current Setup

Your `client/vercel.json` looks correct:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Troubleshooting Steps

1. **Check Vercel Deployment Logs**:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Check if `vercel.json` is being detected
   - Look for any routing errors

2. **Verify Build Output**:
   - Check if `client/dist/index.html` exists after build
   - Vercel should serve this file for all routes

3. **Test Routes**:
   - After redeploying, test:
     - `https://your-app.vercel.app/` ✅
     - `https://your-app.vercel.app/reset-password?token=test` ✅
     - `https://your-app.vercel.app/verify-email?token=test` ✅

4. **Clear Cache**:
   - Try in incognito/private window
   - Or hard refresh (Ctrl+Shift+R)

## Quick Fix

1. **Make sure `vercel.json` is in the client folder** (already done ✅)

2. **In Vercel Dashboard → Settings → General**:
   - Set **Root Directory** to `client` (if not already set)

3. **Redeploy**:
   - Push to GitHub (if connected)
   - OR manually redeploy in Vercel dashboard

4. **Test**:
   - Visit `https://your-app.vercel.app/reset-password`
   - Should show the ResetPassword component, not 404

## If Still Not Working

Check Vercel's **Functions** tab to see if there are any serverless functions interfering with routing.

Also verify that your React Router is using `BrowserRouter` (not `HashRouter`) - which you're already using ✅

---

**The `vercel.json` rewrite rule should make all routes serve `index.html`, allowing React Router to handle client-side routing.**

