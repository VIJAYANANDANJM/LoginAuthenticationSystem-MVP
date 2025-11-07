import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#e0f2ff] via-[#bde3ff] to-[#8ad0ff]">
      {/* Top Navbar */}
      <div className="absolute top-6 left-10 flex items-center space-x-2 text-sky-900/90">
        <div className="h-6 w-6 rounded-full border-2 border-sky-900/50"></div>
        <span className="text-sm font-semibold tracking-wide">
          LOGIN AUTHENTICATION SYSTEM
        </span>
      </div>

      <div className="absolute top-6 right-10">
        <Link
          to="/register"
          className="rounded-lg border border-sky-900/20 px-4 py-1 text-sm font-medium text-sky-900/90 transition hover:bg-white/80 hover:text-sky-900"
        >
          Sign up
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-10 shadow-2xl backdrop-blur">
        <h2 className="mb-1 text-center text-3xl font-bold text-slate-800">
          Log in to your <span className="text-sky-600">account</span>
        </h2>
        <p className="mb-6 text-center text-sm text-slate-500">
          Don’t have an account?{" "}
          <Link to="/register" className="text-sky-600 hover:underline">
            Sign up
          </Link>
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Email or Phone Number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button
            type="submit"
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-sky-600 py-2 font-semibold text-white transition-all duration-300 hover:bg-sky-500"
          >
            <span>Log In</span>
            <span className="text-lg">→</span>
          </button>
        </form>

        <div className="mt-2 flex justify-end">
          <a href="#" className="text-sm text-sky-600 hover:underline">
            Forgot password?
          </a>
        </div>

      </div>
    </div>
  );
}
