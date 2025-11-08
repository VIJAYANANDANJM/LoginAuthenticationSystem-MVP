# Login Authentication System

Full-stack authentication system with advanced security features including email verification, password reset, 2FA, and OAuth integration. Built with Vite + React frontend and Express + MongoDB backend.

**Deployed on:**
- 🌐 **Frontend:** Vercel - `https://login-authentication-system-mvp.vercel.app`
- 🚀 **Backend:** Render - `https://loginauthenticationsystem-mvp.onrender.com`
- 💾 **Database:** MongoDB Atlas

---

## ✨ Features

### Core Authentication
- ✅ Email + password authentication with bcrypt hashing
- ✅ JWT-based session management
- ✅ Protected routes and API endpoints
- ✅ Responsive, modern UI with glassmorphism design

### Advanced Security Features
- ✅ **Email Verification** - Verify accounts before login with secure token-based links
- ✅ **Forgot/Reset Password** - Secure password reset via email links with 1-hour expiration
- ✅ **Two-Factor Authentication (2FA)** - Email-based OTP verification
- ✅ **OAuth Integration** - Google Sign-In support with automatic account linking
- ✅ **Enhanced Dashboard** - Security settings and account management

### Email Service
- ✅ **Brevo API Integration** - Cloud-based email service (no SMTP ports required)
- ✅ **Secure Redirect Handling** - Proper URL validation and redirect parameter handling
- ✅ **Malformed URL Protection** - Middleware to catch and fix malformed email links
- ✅ **Development Mode** - Console logging for email links when email service is not configured

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19, React Router 7
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Build Tool:** Vite 7
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB Atlas (Mongoose 8)
- **Security:** JWT, bcryptjs, speakeasy (2FA), Passport.js (OAuth)
- **Email:** Brevo API (HTTPS-based, no SMTP)
- **Deployment:** Render

### Tooling
- **Linting:** ESLint 9
- **Environment:** dotenv

---

## 📁 Project Structure

```
LoginAuthenticationSystem-MVP/
├── client/                    # React frontend (Vercel)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── VerifyEmail.jsx
│   │   ├── config.js          # API configuration
│   │   └── App.jsx
│   ├── vercel.json            # Vercel deployment config
│   └── package.json
└── server/                    # Express backend (Render)
    ├── utils/
    │   └── emailService.js    # Brevo API email service
    ├── server.js               # Main server file
    └── package.json
```

---

## 🚀 Deployment Setup

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster

2. **Configure Database**
   - Create a database user
   - Whitelist IP addresses (or use `0.0.0.0/0` for all IPs)
   - Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

3. **Connection String Format**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/loginMVP?retryWrites=true&w=majority
   ```

### Backend Deployment (Render)

1. **Create Render Web Service**
   - Connect your GitHub repository
   - Select `server` as the root directory
   - Build command: `npm install`
   - Start command: `node server.js`

2. **Environment Variables (Render)**
   ```env
   # Database
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/loginMVP?retryWrites=true&w=majority
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   
   # Frontend URL (Vercel)
   FRONTEND_URL=https://login-authentication-system-mvp.vercel.app
   
   # Backend URL (Render)
   BACKEND_URL=https://loginauthenticationsystem-mvp.onrender.com
   # OR use RENDER_EXTERNAL_URL (auto-set by Render)
   
   # Email Service (Brevo API)
   BREVO_API_KEY=your_brevo_api_key_here
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=Login Authentication System
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Environment
   NODE_ENV=production
   PORT=5000
   ```

3. **Brevo Email Setup**
   - Sign up at [Brevo](https://www.brevo.com)
   - Get API key from: SMTP & API → API Keys
   - Add `BREVO_API_KEY` and `EMAIL_FROM` to Render environment variables

### Frontend Deployment (Vercel)

1. **Connect Repository to Vercel**
   - Import your GitHub repository
   - Set root directory to `client`
   - Framework preset: Vite

2. **Environment Variables (Vercel)**
   ```env
   VITE_API_URL=https://loginauthenticationsystem-mvp.onrender.com
   ```

3. **Vercel Configuration**
   - The `vercel.json` file handles routing for SPA
   - All routes redirect to `index.html` for client-side routing

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 20+ and npm
- MongoDB Atlas account (or local MongoDB)
- Brevo account (for email features)

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/loginMVP?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Email Configuration (Brevo)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Login Authentication System

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

NODE_ENV=development
```

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
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📖 Usage Guide

### Registration Flow

1. Visit `/register` and create an account
2. Check your email for verification link (or check console in dev mode)
3. Click the link - it redirects to backend, then to frontend with verification status
4. Once verified, you can log in

### Login Flow

1. Visit `/` (login page)
2. Enter email and password
3. If 2FA is enabled, enter the code sent to your email
4. Access the dashboard

### Password Reset Flow

1. Click "Forgot password?" on login page
2. Enter your email address
3. Check email for reset link (or check console in dev mode)
4. Click link - it redirects to backend, then to frontend reset password page
5. Enter new password

### OAuth Login

1. Click "Google" button on login/register page
2. Authorize the application
3. Automatically redirected to dashboard

### Enable 2FA

1. Log in to dashboard
2. Go to Security Settings
3. Click "Enable 2FA"
4. Future logins will require 2FA code sent via email

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (sends verification email) |
| POST | `/api/auth/login` | Login (supports 2FA) |
| GET | `/api/auth/verify-email?token=...&redirect=...` | Verify email address (redirects to frontend) |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Request password reset |
| GET | `/api/auth/reset-password?token=...&redirect=...` | Redirect to frontend reset page |
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
- Secure redirect handling with URL validation
- Resend verification email available

### Password Reset
- Secure token-based reset flow
- Tokens expire after 1 hour
- No user enumeration (same response for existing/non-existing users)
- Proper redirect handling to frontend

### Two-Factor Authentication
- Email-based OTP codes
- 10-minute expiration window
- Can be enabled/disabled from dashboard

### OAuth Integration
- Google Sign-In support
- Automatic account linking
- Verified emails for OAuth users

### URL Security
- Middleware to catch malformed URLs
- Automatic `FRONTEND_URL=` prefix removal
- URL validation before redirects
- Proper encoding/decoding of redirect parameters

---

## 🐛 Troubleshooting

### Email Not Sending

**Development Mode:** In development without email config, emails are logged to console instead of being sent.

**Production:** Ensure:
- `BREVO_API_KEY` and `EMAIL_FROM` are set correctly in Render
- Brevo API key is valid and active
- Check Render logs for email sending errors

### Redirect Issues

**Malformed URLs:** The system now automatically handles:
- URLs with `FRONTEND_URL=` prefix in path
- Invalid redirect parameters
- Missing environment variables

**Check Environment Variables:**
- `FRONTEND_URL` should be: `https://login-authentication-system-mvp.vercel.app` (no `FRONTEND_URL=` prefix)
- `BACKEND_URL` should be: `https://loginauthenticationsystem-mvp.onrender.com`

### OAuth Not Working

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Render environment variables
- Check redirect URI matches: `https://loginauthenticationsystem-mvp.onrender.com/api/auth/google/callback`
- Ensure OAuth consent screen is configured in Google Cloud Console

### 2FA Issues

- Codes expire after 10 minutes
- Check spam folder for OTP emails
- Ensure Brevo email service is configured

### MongoDB Connection

- Verify `MONGO_URI` in Render environment variables
- Check MongoDB Atlas IP whitelist includes Render IPs
- Ensure connection string format is correct

---

## 📝 Environment Variables

### Backend (Render)

**Required:**
- `MONGO_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret key for JWT signing
- `FRONTEND_URL` - Frontend deployment URL (Vercel)

**Email (Required for production):**
- `BREVO_API_KEY` - Brevo API key
- `EMAIL_FROM` - Sender email address

**Optional:**
- `BACKEND_URL` - Backend URL (or use `RENDER_EXTERNAL_URL`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (production/development)

### Frontend (Vercel)

**Required:**
- `VITE_API_URL` - Backend API URL (Render)

---

## 🔧 Recent Fixes & Improvements

### Email Redirect Fixes (Latest)

1. **Malformed URL Handling**
   - Added middleware to catch URLs with `FRONTEND_URL=` in path
   - Automatic prefix removal from environment variables
   - Proper error handling and redirects

2. **URL Validation**
   - Validates all URLs before use
   - Proper encoding/decoding of redirect parameters
   - Fallback to environment variables if redirect parameter is invalid

3. **Email Service Improvements**
   - Brevo API integration (HTTPS-based, no SMTP)
   - Better error handling and logging
   - Development mode console logging

4. **Redirect Flow**
   - Email links → Backend endpoint → Frontend with status
   - Proper query parameter handling
   - Secure token validation before redirect

---

## 🚧 Development Notes

### Email in Development

Without Brevo configuration, the system runs in "development mode" and logs emails to the console instead of sending them. This allows testing without setting up email services.

### Testing Features

1. **Email Verification:** Check console for verification links in dev mode
2. **Password Reset:** Check console for reset links in dev mode
3. **2FA:** OTP codes are sent via email (or logged in dev mode)

### Deployment Checklist

**Before deploying:**
- [ ] Set all environment variables in Render
- [ ] Set all environment variables in Vercel
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Set up Brevo API account and get API key
- [ ] Configure Google OAuth (if using)
- [ ] Test email sending in production
- [ ] Verify redirect URLs work correctly

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

## 🙏 Acknowledgments

- **MongoDB Atlas** - Cloud database hosting
- **Vercel** - Frontend deployment platform
- **Render** - Backend deployment platform
- **Brevo** - Email service provider

---

**Happy building! 🎉**
