import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
        otp: requires2FA ? otp : undefined,
      });

      if (res.data.requires2FA) {
        setRequires2FA(true);
        setError("");
      } else if (res.data.requiresVerification) {
        setRequiresVerification(true);
        setError("Please verify your email before logging in.");
      } else {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
      if (err?.response?.data?.requiresVerification) {
        setRequiresVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, { email });
      setError("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send verification email.");
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#e0f2ff] via-[#bde3ff] to-[#8ad0ff]">
      <div className="absolute top-6 left-10 flex items-center space-x-2 text-sky-900/90">
        <div className="h-6 w-6 rounded-full border-2 border-sky-900/50"></div>
        <span className="text-sm font-semibold tracking-wide">
          LOGIN AUTHENTICATION SYSTEM
        </span>
      </div>

      <div className="absolute top-6 right-10 flex gap-2">
        <Link
          to="/register"
          className="rounded-lg border border-sky-900/20 px-4 py-1 text-sm font-medium text-sky-900/90 transition hover:bg-white/80 hover:text-sky-900"
        >
          Sign up
        </Link>
        <a
          href={`${API_URL.replace('/api', '')}/auth/google`}
          className="rounded-lg border border-sky-900/20 px-4 py-1 text-sm font-medium text-sky-900/90 transition hover:bg-white/80 hover:text-sky-900"
        >
          Google
        </a>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-10 shadow-2xl backdrop-blur">
        <h2 className="mb-1 text-center text-3xl font-bold text-slate-800">
          Log in to your <span className="text-sky-600">account</span>
        </h2>
        <p className="mb-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-sky-600 hover:underline">
            Sign up
          </Link>
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {!requires2FA ? (
            <>
              <div>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Enter 2FA Code
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-2xl font-mono tracking-widest text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                disabled={loading}
              />
              <p className="mt-2 text-xs text-slate-500">
                Check your email for the verification code.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-rose-500">{error}</p>}

          {requiresVerification && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                Please verify your email before logging in.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                className="mt-2 text-sm font-semibold text-amber-700 hover:underline"
              >
                Resend verification email
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-sky-600 py-2 font-semibold text-white transition-all duration-300 hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-400/70"
          >
            <span>{loading ? "Signing in..." : requires2FA ? "Verify" : "Log In"}</span>
            <span className="text-lg">→</span>
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link to="/forgot-password" className="text-sky-600 hover:underline">
            Forgot password?
          </Link>
          {requires2FA && (
            <button
              type="button"
              onClick={() => {
                setRequires2FA(false);
                setOtp("");
              }}
              className="text-slate-500 hover:underline"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
