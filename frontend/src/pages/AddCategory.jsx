import React, { useContext, useState } from "react";
import api from "../services/api";
import { CategoryContext } from "../context/CategoryContext";

export default function AddCategory() {
  const { categories, refreshCategories } = useContext(CategoryContext);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const addCategory = async () => {
    setMessage("");
    setError("");

    if (!id || !name) {
      setError("Both fields are required");
      return;
    }

    // basic sanitization
    const cleanId = id.trim().toLowerCase().replace(/\s+/g, "_");

    try {
      const res = await api.post("/categories", {
        id: cleanId,
        name: name.trim(),
      });

      setMessage(res.data.message);
      setId("");
      setName("");

      refreshCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add category");
    }
  };

  const deleteCategory = async (cat) => {
    if (
      !window.confirm(
        `Delete category "${cat.name}"?\n\nThis action cannot be undone.`
      )
    )
      return;

    setMessage("");
    setError("");

    try {
      const res = await api.delete(`/categories/${cat.id}`);
      setMessage(res.data.message);
      refreshCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <div className="pt-20 px-4 md:px-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>

      {/* ADD CATEGORY */}
      <div className="bg-white p-6 rounded shadow max-w-md mb-8">
        {message && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 p-2 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm text-gray-600">Category ID</label>
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="e.g. laminate"
            value={id}
            onChange={e => setId(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">
            Used internally (lowercase, no spaces)
          </p>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Category Name</label>
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Laminate"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <button
          onClick={addCategory}
          className="bg-[#8B5A2B] text-white px-4 py-2 rounded hover:bg-[#734822]"
        >
          Add Category
        </button>
      </div>

      {/* EXISTING CATEGORIES */}
      <div className="bg-white p-6 rounded shadow max-w-md">
        <h2 className="font-semibold mb-4">Existing Categories</h2>

        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">
            No categories available
          </p>
        ) : (
          <ul className="space-y-2">
            {categories.map(cat => (
              <li
                key={cat.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <span>
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-gray-400 text-sm ml-2">
                    ({cat.id})
                  </span>
                </span>

                <button
                  onClick={() => deleteCategory(cat)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
