import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";

export default function VerifyEmail() {
  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus({ type: "error", message: "Invalid verification link." });
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify-email?token=${token}`);
        setStatus({ type: "success", message: res.data.message });
      } catch (err) {
        setStatus({
          type: "error",
          message: err?.response?.data?.message || "Verification failed. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#e0f2ff] via-[#bde3ff] to-[#8ad0ff]">
      <div className="absolute top-6 left-10 flex items-center space-x-2 text-sky-900/90">
        <div className="h-6 w-6 rounded-full border-2 border-sky-900/50"></div>
        <span className="text-sm font-semibold tracking-wide">LOGIN AUTHENTICATION SYSTEM</span>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-10 shadow-2xl backdrop-blur text-center">
        {loading ? (
          <>
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
            <p className="text-slate-600">Verifying your email...</p>
          </>
        ) : (
          <>
            <div
              className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full ${
                status.type === "success" ? "bg-emerald-100" : "bg-rose-100"
              }`}
            >
              <span className="text-3xl">{status.type === "success" ? "✓" : "✗"}</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              {status.type === "success" ? "Email Verified!" : "Verification Failed"}
            </h2>
            <p
              className={`mb-6 text-sm ${
                status.type === "success" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {status.message}
            </p>
            <Link
              to="/"
              className="inline-block rounded-lg bg-sky-600 px-6 py-2 font-semibold text-white transition-all duration-300 hover:bg-sky-500"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

