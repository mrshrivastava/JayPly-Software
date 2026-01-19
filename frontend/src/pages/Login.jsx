import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#8B5A2B] p-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Plywood Manager
          </h1>
          <p className="text-sm text-white/90 mt-1">
            Inventory & Stock Control
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Username
              </label>
              <input
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-[#8B5A2B] text-white py-2 rounded font-medium hover:bg-[#734822] transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 text-center text-xs text-gray-500 py-3">
          © {new Date().getFullYear()} Plywood Manager
        </div>

      </div>
    </div>
  );
}
