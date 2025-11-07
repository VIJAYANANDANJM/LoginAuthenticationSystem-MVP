import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus({ type: "error", message: "Invalid reset link. Please request a new one." });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", { token, password });
      setStatus({ type: "success", message: "Password reset successfully! Redirecting..." });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#e0f2ff] via-[#bde3ff] to-[#8ad0ff]">
      <div className="absolute top-6 left-10 flex items-center space-x-2 text-sky-900/90">
        <div className="h-6 w-6 rounded-full border-2 border-sky-900/50"></div>
        <span className="text-sm font-semibold tracking-wide">LOGIN AUTHENTICATION SYSTEM</span>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-10 shadow-2xl backdrop-blur">
        <h2 className="mb-1 text-center text-3xl font-bold text-slate-800">
          Create new <span className="text-sky-600">password</span>
        </h2>
        <p className="mb-6 text-center text-sm text-slate-500">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {status.message && (
            <p
              className={`text-sm ${
                status.type === "success" ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-sky-600 py-2 font-semibold text-white transition-all duration-300 hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-400/70"
          >
            <span>{loading ? "Resetting..." : "Reset password"}</span>
            <span className="text-lg">→</span>
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="font-semibold text-sky-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

