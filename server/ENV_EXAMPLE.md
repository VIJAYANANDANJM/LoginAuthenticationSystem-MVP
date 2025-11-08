# Environment Variables Example

Copy this to `server/.env` and fill in your values:

```env
# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/loginMVP
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/loginMVP?retryWrites=true&w=majority

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Frontend URL (for redirects and email links)
FRONTEND_URL=http://localhost:5173
# For production:
# FRONTEND_URL=https://login-authentication-system-mvp.vercel.app

# Backend URL (for email verification links - should point to your Render backend)
BACKEND_URL=http://localhost:5000
# For production:
# BACKEND_URL=https://loginauthenticationsystem-mvp.onrender.com

# ====== Email Configuration ======
# Choose ONE option below:

# Option 1: Brevo API (Recommended - No SMTP connection needed!)
BREVO_API_KEY=your_brevo_api_key_here
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Login Authentication System

# Option 2: Brevo SMTP
# EMAIL_HOST=smtp-relay.brevo.com
# EMAIL_PORT=587
# EMAIL_USER=your_brevo_email@example.com
# EMAIL_PASS=your_brevo_smtp_key
# EMAIL_FROM=noreply@yourdomain.com

# Alternative: SendGrid
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASS=your_sendgrid_api_key
# EMAIL_FROM=noreply@yourdomain.com

# Alternative: Mailgun
# EMAIL_HOST=smtp.mailgun.org
# EMAIL_PORT=587
# EMAIL_USER=your_mailgun_username
# EMAIL_PASS=your_mailgun_password
# EMAIL_FROM=noreply@yourdomain.com

# Google OAuth (optional - for social login)
# Get credentials from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Node Environment
NODE_ENV=development
# For production:
# NODE_ENV=production
```

## Email Service Setup

### Brevo (Recommended)
1. Sign up at https://www.brevo.com
2. Go to SMTP & API → SMTP
3. Copy your SMTP credentials:
   - Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Login: Your Brevo email
   - Password: Your SMTP key

### SendGrid
1. Sign up at https://sendgrid.com
2. Create API Key: Settings → API Keys
3. Use:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - User: `apikey`
   - Pass: Your API key

### Mailgun
1. Sign up at https://mailgun.com
2. Get SMTP credentials from dashboard
3. Use provided host, port, username, and password

