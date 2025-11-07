import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    axios
      .get("http://localhost:5000/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => navigate("/"));
  }, []);

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
      {user ? (
        <>
          <h2 className="text-3xl font-bold text-gray-700 mb-3">
            Welcome, <span className="text-indigo-600">{user.email}</span> 🎉
          </h2>
          <p className="text-gray-500 mb-6">You are now logged in to your dashboard.</p>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition"
          >
            Logout
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
