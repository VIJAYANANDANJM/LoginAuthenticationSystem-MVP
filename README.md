# Login Authentication System (MVP) - PHASE 3

Full-stack authentication system with advanced security features including email verification, password reset, 2FA, and OAuth integration. Built with Vite + React frontend and Express + MongoDB backend.

---

## ✨ Features

### Core Authentication
- ✅ Email + password authentication with bcrypt hashing
- ✅ JWT-based session management
- ✅ Protected routes and API endpoints
- ✅ Responsive, modern UI with glassmorphism design

### Advanced Security Features
- ✅ **Email Verification** - Verify accounts before login
- ✅ **Forgot/Reset Password** - Secure password reset via email links
- ✅ **Two-Factor Authentication (2FA)** - Email-based OTP verification
- ✅ **OAuth Integration** - Google Sign-In support
- ✅ **Enhanced Dashboard** - Security settings and account management

---

## 🛠 Tech Stack

- **Frontend:** React 19, React Router 7, Axios, Tailwind CSS
- **Backend:** Node.js, Express 5, MongoDB (Mongoose 8)
- **Security:** JWT, bcryptjs, speakeasy (2FA), Passport.js (OAuth)
- **Email:** Nodemailer
- **Tooling:** Vite 7, ESLint 9, dotenv

---

## 📁 Project Structure

```
LoginAuthenticationSystem-MVP/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── VerifyEmail.jsx
│   │   └── App.jsx
│   └── package.json
└── server/                    # Express backend
    ├── utils/
    │   └── emailService.js   # Email sending utilities
    ├── server.js             # Main server file
    ├── .env.example          # Environment variables template
    └── package.json
```

---

## 🚀 Setup

### Prerequisites

- Node.js 20+ and npm
- MongoDB (local or cloud)
- Gmail account (for email features - optional in dev mode)

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env.example`):

```env
MONGO_URI=mongodb://127.0.0.1:27017/loginMVP
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
FRONTEND_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

NODE_ENV=development
```

**Email Setup (Gmail):**
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the App Password in `EMAIL_PASS`

**Google OAuth Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
4. Copy Client ID and Secret to `.env`

Start the server:

```bash
npm start
# or for development with auto-reload
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📖 Usage Guide

### Registration Flow

1. Visit `/register` and create an account
2. Check your email for verification link
3. Click the link or visit `/verify-email?token=...`
4. Once verified, you can log in

### Login Flow

1. Visit `/` (login page)
2. Enter email and password
3. If 2FA is enabled, enter the code sent to your email
4. Access the dashboard

### Password Reset Flow

1. Click "Forgot password?" on login page
2. Enter your email address
3. Check email for reset link
4. Click link or visit `/reset-password?token=...`
5. Enter new password

### OAuth Login

1. Click "Google" button on login/register page
2. Authorize the application
3. Automatically redirected to dashboard

### Enable 2FA

1. Log in to dashboard
2. Go to Security Settings
3. Click "Enable 2FA"
4. Scan QR code with authenticator app (or use email OTP)
5. Future logins will require 2FA code

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (sends verification email) |
| POST | `/api/auth/login` | Login (supports 2FA) |
| GET | `/api/auth/verify-email?token=...` | Verify email address |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### OAuth

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback (redirects to frontend) |

### 2FA

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/enable-2fa` | Enable 2FA (requires auth token) |
| POST | `/api/auth/disable-2fa` | Disable 2FA (requires auth token) |

### Protected

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/profile` | Get user profile (requires `Authorization: Bearer <token>`) |

---

## 🎨 Frontend Routes

- `/` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard
- `/forgot-password` - Request password reset
- `/reset-password?token=...` - Reset password form
- `/verify-email?token=...` - Email verification page

---

## 🔒 Security Features

### Email Verification
- Users must verify email before first login
- Verification tokens expire after 24 hours
- Resend verification email available

### Password Reset
- Secure token-based reset flow
- Tokens expire after 1 hour
- No user enumeration (same response for existing/non-existing users)

### Two-Factor Authentication
- Email-based OTP codes
- 10-minute expiration window
- Can be enabled/disabled from dashboard

### OAuth Integration
- Google Sign-In support
- Automatic account linking
- Verified emails for OAuth users

---

## 🐛 Troubleshooting

### Email Not Sending

**Development Mode:** In development without email config, emails are logged to console instead of being sent.

**Production:** Ensure:
- `EMAIL_USER` and `EMAIL_PASS` are set correctly
- Using App Password (not regular password) for Gmail
- SMTP settings are correct for your email provider

### OAuth Not Working

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Check redirect URI matches: `http://localhost:5000/api/auth/google/callback`
- Ensure OAuth consent screen is configured in Google Cloud Console

### 2FA Issues

- Codes expire after 10 minutes
- Check spam folder for OTP emails
- Ensure email service is configured

### MongoDB Connection

- Ensure MongoDB is running: `mongod` or MongoDB service
- Check `MONGO_URI` in `.env`
- For cloud MongoDB, use full connection string

---

## 📝 Environment Variables

See `server/.env.example` for all available environment variables.

**Required:**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing

**Optional:**
- `EMAIL_*` - Email service configuration
- `GOOGLE_*` - OAuth credentials
- `FRONTEND_URL` - Frontend URL for redirects
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode

---

## 🚧 Development Notes

### Email in Development

Without email configuration, the system runs in "development mode" and logs emails to the console instead of sending them. This allows testing without setting up email services.

### Testing Features

1. **Email Verification:** Check console for verification links in dev mode
2. **Password Reset:** Check console for reset links in dev mode
3. **2FA:** OTP codes are sent via email (or logged in dev mode)

---

## 📚 Next Steps / Roadmap

- [ ] SMS-based 2FA option
- [ ] GitHub OAuth integration
- [ ] Refresh token implementation
- [ ] Rate limiting for API endpoints
- [ ] Account deletion
- [ ] Password strength meter
- [ ] Session management (active sessions list)
- [ ] Email templates customization
- [ ] Admin dashboard
- [ ] API documentation (Swagger/OpenAPI)

---

## 📄 License

This project is open source and available for educational purposes.

---

**Happy building! 🎉**
