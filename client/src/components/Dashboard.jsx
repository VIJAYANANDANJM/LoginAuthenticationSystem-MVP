import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorStatus, setTwoFactorStatus] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Handle OAuth token from URL
    const urlToken = searchParams.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      window.history.replaceState({}, document.title, "/dashboard");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setTwoFactorStatus(res.data.twoFactorEnabled);
      } catch (err) {
        localStorage.removeItem("token");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleToggle2FA = async () => {
    try {
      const token = localStorage.getItem("token");
      if (twoFactorStatus) {
        await axios.post(
          "http://localhost:5000/api/auth/disable-2fa",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTwoFactorStatus(false);
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/auth/enable-2fa",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTwoFactorStatus(true);
        alert(`2FA enabled! QR Code URL: ${res.data.qrCodeUrl}`);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to toggle 2FA");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e0f2ff] via-[#bde3ff] to-[#8ad0ff]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f2ff] via-[#bde3ff] to-[#8ad0ff] p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome back, <span className="text-sky-600">{user?.email}</span>! 🎉
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {user?.isVerified ? "✓ Email verified" : "⚠ Email not verified"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-rose-500 px-6 py-2 font-semibold text-white transition-all duration-300 hover:bg-rose-600"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur transition-all duration-300 hover:scale-105">
            <div className="mb-2 text-sm font-medium text-slate-500">Account Status</div>
            <div className="text-2xl font-bold text-slate-800">
              {user?.isVerified ? "Active" : "Pending"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur transition-all duration-300 hover:scale-105">
            <div className="mb-2 text-sm font-medium text-slate-500">2FA Status</div>
            <div className="text-2xl font-bold text-slate-800">
              {twoFactorStatus ? "Enabled" : "Disabled"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur transition-all duration-300 hover:scale-105">
            <div className="mb-2 text-sm font-medium text-slate-500">Member Since</div>
            <div className="text-2xl font-bold text-slate-800">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-2xl border border-white/70 bg-white/90 p-8 shadow-xl backdrop-blur">
          <h2 className="mb-6 text-2xl font-bold text-slate-800">Security Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div>
                <h3 className="font-semibold text-slate-800">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`rounded-lg px-6 py-2 font-semibold text-white transition-all duration-300 ${
                  twoFactorStatus
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {twoFactorStatus ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
