# Login Authentication System (MVP)

Full-stack starter for email/password authentication using a Vite + React frontend and an Express + MongoDB backend. Users can register, sign in, and access a protected dashboard once authenticated.

---

## Features

- Responsive, glassmorphism-inspired login and registration screens
- Email + password authentication with hashed credentials (`bcryptjs`)
- JWT-based session handling with protected profile endpoint
- Auto-redirects based on authentication state and stored token
- Centralized error messaging and loading states in the UI
- MongoDB persistence with unique email enforcement
- Environment-aware configuration for local development

---

## Tech Stack

- **Frontend:** React 19, React Router, Axios, Tailwind utility classes (via handcrafted classnames)
- **Backend:** Node.js, Express 5, MongoDB (Mongoose 8), JWT, bcryptjs
- **Tooling:** Vite 7, ESLint 9, PostCSS, dotenv

---

## Project Structure

```
LoginAuthenticationSystem-MVP/
├── client/              # React application (Vite)
│   ├── src/
│   │   ├── components/  # Login, Register, Dashboard views
│   │   └── main.jsx     # App bootstrap
│   └── README.md        # You are here
└── server/              # Express API
    ├── server.js        # Routes + Mongo connection
    └── package.json
```

---

## Prerequisites

- Node.js 20+ (recommended) and npm
- Local MongoDB instance or cloud MongoDB connection string

---

## Setup

### 1. Backend (`server/`)

```bash
cd server
npm install
```

Create a `.env` file with:

```
MONGO_URI=mongodb://127.0.0.1:27017/loginMVP
JWT_SECRET=super-secret-key
PORT=5000 # optional, defaults to 5000
```

Start the API:

```bash
npm start   # if you add a script
# or
node server.js
```

The server logs when the database connection succeeds and when requests fail (duplicates, validation, etc.).

### 2. Frontend (`client/`)

```bash
cd client
npm install
npm run dev
```

Vite defaults to `http://localhost:5173`. The frontend proxies requests directly to `http://localhost:5000`.

---

## Usage Flow

1. Visit the app in the browser (`http://localhost:5173`).
2. Register with a new email address and password.
3. After the success toast, sign in from the login screen.
4. The JWT token is stored in `localStorage` and used to fetch the profile on the dashboard.
5. Use “Logout” to clear the token and return to the login page.

---

## Available Scripts (Frontend)

```bash
npm run dev       # start Vite dev server
npm run build     # build for production
npm run preview   # preview production build
npm run lint      # run ESLint
```

For the backend, add scripts such as `"start": "node server.js"` or use `nodemon` for development.

---

## API Endpoints

| Method | Endpoint                | Description                    |
| ------ | ----------------------- | ------------------------------ |
| POST   | `/api/auth/register`    | Create a new user account      |
| POST   | `/api/auth/login`       | Sign in and receive a JWT      |
| GET    | `/api/auth/profile`     | Fetch the authenticated profile (requires `Authorization: Bearer <token>`) |

---

## Troubleshooting

- **Network Error when registering/logging in**: Ensure the backend is running on port `5000` and MongoDB is reachable. The server now logs detailed errors—check the terminal output.
- **Mongo duplicate error**: The API responds with `User already exists.`; sign in instead or use a new email address.
- **Token expired**: Tokens last 1 hour. Log in again to refresh the session.

---

## Roadmap Ideas

- Email verification and password reset flow
- Persisted session refresh tokens
- Role-based authorization with expanded dashboard
- Consolidated build and deployment scripts (Docker, PM2, etc.)

---

Happy building! 🎉
