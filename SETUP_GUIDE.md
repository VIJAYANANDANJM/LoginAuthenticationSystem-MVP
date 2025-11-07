# Email Verification & Password Reset Setup Guide

This guide will help you set up email verification and password reset features.

## Option 1: Development Mode (No Email Setup Required) ✅ EASIEST

This is the **recommended way** for development and testing. The system will log emails to the console instead of sending them.

### Steps:

1. **Make sure you DON'T have email credentials in `.env`**
   - Your `server/.env` file should NOT have `EMAIL_USER` and `EMAIL_PASS`
   - Or simply don't create a `.env` file at all

2. **Start the server:**
   ```bash
   cd server
   npm install  # if you haven't already
   npm start
   ```

3. **Start the client:**
   ```bash
   cd client
   npm install  # if you haven't already
   npm run dev
   ```

4. **How it works:**
   - When you register, check the **server console** - you'll see the verification link printed there
   - The verification link will also appear **in the UI** after registration
   - Click the link from the UI or copy it from the console
   - Same for password reset - links appear in both places

### Example Console Output:
```
============================================================
📧 EMAIL (Development Mode - Not Sent)
============================================================
To: user@example.com
Subject: Verify Your Email Address

--- HTML Content ---
[Email HTML content with link]

🔗 Verification Link (Copy this):
http://localhost:5173/verify-email?token=abc123...
============================================================
```

---

## Option 2: Production Mode (Real Email Setup) 📧

For production or if you want to actually send emails.

### Using Gmail (Recommended for Testing)

1. **Enable 2-Step Verification on your Google Account:**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate an App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Login Auth System" as the name
   - Click "Generate"
   - **Copy the 16-character password** (no spaces)

3. **Create/Update `server/.env` file:**
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/loginMVP
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   
   NODE_ENV=production
   ```

4. **Restart the server:**
   ```bash
   cd server
   npm start
   ```

5. **Test it:**
   - Register a new account
   - Check your email inbox (and spam folder)
   - Click the verification link
   - Try forgot password - check email for reset link

---

## Option 3: Using Other Email Services

### Using Outlook/Hotmail:

```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
```

### Using Custom SMTP:

```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
```

Then update `server/utils/emailService.js` to use custom SMTP:
```javascript
transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

---

## Troubleshooting

### Emails not showing in console (Development Mode)

**Check:**
1. Make sure `EMAIL_USER` is NOT set in `.env`
2. Restart the server after removing email config
3. Check server console for any errors

### Emails not sending (Production Mode)

**Check:**
1. Verify `EMAIL_USER` and `EMAIL_PASS` are correct in `.env`
2. For Gmail, make sure you're using an **App Password**, not your regular password
3. Check server console for error messages
4. Check spam/junk folder
5. Make sure 2-Step Verification is enabled (for Gmail)

### Verification/Reset links not working

**Check:**
1. Make sure `FRONTEND_URL` in `.env` matches your frontend URL
2. Default is `http://localhost:5173` - change if using different port
3. Links expire after 24 hours (verification) or 1 hour (reset)
4. Check server console for token validation errors

### "Invalid or expired token" error

**Solutions:**
1. Token expired - request a new one
2. Token already used - tokens are single-use
3. Check server console for detailed error messages

---

## Quick Test Checklist

- [ ] Server starts without errors
- [ ] Register a new account
- [ ] See verification link (console or email)
- [ ] Click verification link - should verify successfully
- [ ] Try to login - should work after verification
- [ ] Click "Forgot password"
- [ ] See reset link (console or email)
- [ ] Click reset link - should allow password reset
- [ ] Login with new password - should work

---

## Development vs Production Summary

| Feature | Development Mode | Production Mode |
|---------|------------------|----------------|
| Email Config | Not required | Required |
| Emails Sent | No (logged to console) | Yes (real emails) |
| Links in UI | Yes | No (check email) |
| Links in Console | Yes | No |
| Setup Time | 0 minutes | 5-10 minutes |

**Recommendation:** Use Development Mode for testing, Production Mode for deployment.

---

## Need Help?

1. Check server console for detailed error messages
2. Verify `.env` file configuration
3. Make sure MongoDB is running
4. Check that frontend and backend are both running
5. Verify ports match (5000 for server, 5173 for client)

Happy coding! 🚀

