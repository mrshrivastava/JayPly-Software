import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function Stocks() {
  const { type } = useParams();

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [id, setId] = useState("");
  const [stock, setStock] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  // Modal state
  const [editItem, setEditItem] = useState(null);
  const [editStock, setEditStock] = useState("");

  const load = async () => {
    const res = await api.get(`/stocks/${type}`);
    setData(res.data);
    setFiltered(res.data);
  };

  useEffect(() => { load(); }, [type]);

  useEffect(() => {
    setFiltered(
      data.filter(item =>
        item.id.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data]);

  /* ---------------- ADD ---------------- */
  const addStock = async () => {
    try {
      if (!id || !stock) return;

      await api.post(`/stocks/${type}`, {
        id,
        stock: Number(stock),
      });

      setMessage("Stock added successfully");
      setId("");
      setStock("");
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error adding stock");
    }
  };

  /* ---------------- UPDATE ---------------- */
  const openEditModal = (item) => {
    setEditItem(item);
    setEditStock(item.stock);
  };

  const updateStock = async () => {
    try {
      await api.put(`/stocks/${type}/${editItem.id}`, {
        stock: Number(editStock),
      });

      setMessage("Stock updated successfully");
      setEditItem(null);
      load();
    } catch {
      setMessage("Error updating stock");
    }
  };

  /* ---------------- DELETE ---------------- */
  const remove = async (pid) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/stocks/${type}/${pid}`);
    load();
  };

  return (
    <div className="pt-20 px-4 md:px-6 bg-gray-100 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold capitalize">{type} Stock</h1>
        <p className="text-gray-600">Manage inventory items</p>
      </div>

      {/* Message */}
      {message && (
        <div className="mb-4 text-sm bg-blue-50 text-blue-700 p-2 rounded">
          {message}
        </div>
      )}

      {/* ADD FORM */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Add New Product</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Product ID"
            value={id}
            onChange={e => setId(e.target.value)}
          />
          <input
            type="number"
            className="border rounded px-3 py-2"
            placeholder="Initial Stock"
            value={stock}
            onChange={e => setStock(e.target.value)}
          />
          <button
            onClick={addStock}
            className="bg-[#8B5A2B] text-white rounded px-4 py-2 hover:bg-[#734822]"
          >
            Add Stock
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <input
        className="border rounded px-3 py-2 mb-4 w-full md:w-1/3"
        placeholder="Search by Product ID"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Product ID</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-6 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
            {filtered.map(item => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">{item.id}</td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3 text-right space-x-4">
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              Update Stock
            </h2>

            <div className="mb-3">
              <label className="text-sm text-gray-600">Product ID</label>
              <input
                className="border rounded px-3 py-2 w-full bg-gray-100"
                value={editItem.id}
                disabled
              />
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-600">Stock</label>
              <input
                type="number"
                className="border rounded px-3 py-2 w-full"
                value={editStock}
                onChange={e => setEditStock(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditItem(null)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={updateStock}
                className="px-4 py-2 rounded bg-[#8B5A2B] text-white hover:bg-[#734822]"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
