# Email Setup for Render Deployment

## 🔧 Fixing Email Issues on Render

### Problem
- Connection timeout when sending emails
- Emails defaulting to `localhost:5173` instead of production URL

### Solution

#### Step 1: Set Environment Variables in Render

Go to your Render dashboard → Your Service → Environment → Add the following:

```env
FRONTEND_URL=https://your-frontend-url.vercel.app
# OR wherever your frontend is deployed

# ====== Email Service Configuration ======
# Choose ONE option below:

# Option 1: Brevo (Recommended - Works on Render)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your_brevo_email@example.com
EMAIL_PASS=your_brevo_smtp_key
EMAIL_FROM=noreply@yourdomain.com

# Option 2: SendGrid
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASS=your_sendgrid_api_key
# EMAIL_FROM=noreply@yourdomain.com

# Option 3: Mailgun
# EMAIL_HOST=smtp.mailgun.org
# EMAIL_PORT=587
# EMAIL_USER=your_mailgun_username
# EMAIL_PASS=your_mailgun_password
# EMAIL_FROM=noreply@yourdomain.com

# Optional but recommended
NODE_ENV=production
```

**Important:** 
- `FRONTEND_URL` must be your actual frontend deployment URL
- Get Gmail App Password from: https://myaccount.google.com/apppasswords

#### Step 2: Verify Email Configuration

After deploying, check Render logs. You should see:
- `✅ Email service configured and verified` - Email is working
- `⚠️  Email not configured` - Need to add EMAIL_USER and EMAIL_PASS
- `❌ Email service verification failed` - Check credentials

#### Step 3: Test Email Sending

1. Register a new account
2. Check Render logs for email output
3. If email fails, it will log to console with the verification link

### Common Issues

#### Connection Timeout
- **Cause:** Render's network restrictions or Gmail blocking
- **Fix:** 
  - Verify Gmail App Password is correct
  - Check if "Less secure app access" is enabled (if using regular password)
  - Try using a different email service (SendGrid, Mailgun)

#### Wrong Frontend URL in Emails
- **Cause:** `FRONTEND_URL` not set in Render
- **Fix:** Add `FRONTEND_URL` environment variable with your frontend URL

#### Emails Not Sending
- **Check Render logs** - emails are logged there if sending fails
- **Copy the verification link** from the logs
- **Verify email credentials** are correct

### Alternative: Use Email Service Providers

If Gmail doesn't work on Render, consider:

#### SendGrid (Free tier available)
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun (Free tier available)
```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
```

### Current Behavior

The system is designed to:
1. **Try to send email** if credentials are configured
2. **Log to console** if email fails or not configured
3. **Always provide the link** in server logs for manual use

### Quick Fix for Now

Since emails are being logged, you can:
1. Check Render logs after registration
2. Copy the verification link from the logs
3. Use it manually to verify the account

The link format is:
```
https://your-frontend-url.com/verify-email?token=TOKEN_HERE
```

---

**Next Steps:**
1. Add `FRONTEND_URL` to Render environment variables
2. Verify `EMAIL_USER` and `EMAIL_PASS` are correct
3. Redeploy if needed
4. Check logs to confirm email service is verified

