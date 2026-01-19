import React, { useState } from "react";
import api from "../services/api";

export default function Settings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const updateCredentials = async () => {
    try {
      const res = await api.put("/auth/update-credentials", {
        oldPassword,
        newUsername,
        newPassword,
      });

      setMessage(res.data.message);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="pt-20 px-4 md:px-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <div className="bg-white rounded shadow p-6 max-w-md">
        {message && (
          <div className="mb-4 text-sm text-blue-700 bg-blue-50 p-2 rounded">
            {message}
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm text-gray-600">New Username</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={newUsername}
            onChange={e => setNewUsername(e.target.value)}
            placeholder="Leave blank to keep same"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Old Password</label>
          <input
            type="password"
            className="border rounded px-3 py-2 w-full"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">New Password</label>
          <input
            type="password"
            className="border rounded px-3 py-2 w-full"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>

        <button
          onClick={updateCredentials}
          className="bg-[#8B5A2B] text-white px-4 py-2 rounded hover:bg-[#734822]"
        >
          Update Credentials
        </button>
      </div>
    </div>
  );
}
