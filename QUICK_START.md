# Quick Start Guide - Email Features

## 🚀 Easiest Way (Development Mode - No Email Setup)

**This works immediately without any email configuration!**

### Step 1: Start the Server
```bash
cd server
npm install
npm start
```

### Step 2: Start the Client (in a new terminal)
```bash
cd client
npm install
npm run dev
```

### Step 3: Test It!

1. **Register a new account:**
   - Go to http://localhost:5173/register
   - Enter email and password
   - Click "Create account"
   - **Look at the server console** - you'll see a verification link printed
   - **Also check the UI** - the link appears there too!

2. **Click the verification link:**
   - Either click it from the UI or copy from console
   - Your email will be verified!

3. **Test Password Reset:**
   - Go to login page
   - Click "Forgot password?"
   - Enter your email
   - **Check server console and UI** for the reset link
   - Click the link and reset your password

---

## 📧 Want Real Emails? (Optional Setup)

### For Gmail:

1. **Get App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate a password for "Mail"
   - Copy the 16-character code

2. **Create `server/.env` file:**
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/loginMVP
   JWT_SECRET=your-secret-key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

3. **Restart server** - emails will now be sent!

---

## ✅ What You Should See

### In Development Mode (No Email Config):

**Server Console:**
```
============================================================
📧 EMAIL (Development Mode - Not Sent)
============================================================
To: test@example.com
Subject: Verify Your Email Address

--- HTML Content ---
[Email content with link]

🔗 Verification Link (Copy this):
http://localhost:5173/verify-email?token=abc123...
============================================================
```

**In Browser UI:**
- After registration, you'll see a green box with the verification link
- Click it to verify!

### In Production Mode (With Email Config):

**Server Console:**
```
✅ Email service configured
✅ Email sent successfully: <message-id>
```

**In Browser:**
- Check your email inbox (and spam folder)
- Click the link from the email

---

## 🐛 Common Issues

**"Email not showing in console"**
- Make sure `EMAIL_USER` is NOT in `.env` file
- Restart the server

**"Links not working"**
- Make sure both server (port 5000) and client (port 5173) are running
- Check that `FRONTEND_URL` matches your frontend URL

**"Invalid token"**
- Token expired (24 hours for verification, 1 hour for reset)
- Request a new one

---

## 📝 Summary

- **Development Mode:** Just start server and client - links appear in console and UI
- **Production Mode:** Add email config to `.env` - emails sent to inbox

That's it! 🎉

