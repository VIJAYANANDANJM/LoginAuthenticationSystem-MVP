import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: null, message: "" });
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      let message = res.data.message || "If an account exists with this email, a password reset link has been sent.";
      
      // Show dev link if available
      if (res.data.devResetLink) {
        message += `\n\n🔗 Development Link: ${res.data.devResetLink}`;
      }
      
      setStatus({
        type: "success",
        message,
      });
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

      <div className="absolute top-6 right-10">
        <Link
          to="/"
          className="rounded-lg border border-sky-900/20 px-4 py-1 text-sm font-medium text-sky-900/90 transition hover:bg-white/80 hover:text-sky-900"
        >
          Back to Login
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-10 shadow-2xl backdrop-blur">
        <h2 className="mb-1 text-center text-3xl font-bold text-slate-800">
          Reset your <span className="text-sky-600">password</span>
        </h2>
        <p className="mb-6 text-center text-sm text-slate-500">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {status.message && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {status.message.split("\n").map((line, idx) => (
                <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                  {line.startsWith("🔗") ? (
                    <a
                      href={line.split(": ")[1]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-mono text-xs text-sky-600 underline hover:text-sky-700"
                    >
                      {line}
                    </a>
                  ) : (
                    line
                  )}
                </p>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-sky-600 py-2 font-semibold text-white transition-all duration-300 hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-400/70"
          >
            <span>{loading ? "Sending..." : "Send reset link"}</span>
            <span className="text-lg">→</span>
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link to="/" className="font-semibold text-sky-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

