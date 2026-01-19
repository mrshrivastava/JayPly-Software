import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const COLORS = ["#8B5A2B", "#2563EB", "#16A34A", "#DC2626"];

export default function Analytics() {
  const [months, setMonths] = useState(1);
  const [category, setCategory] = useState("plywood");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    api.get("/transactions", { params: { limit: 10000 } }).then(res => {
        setTransactions(res.data.data || []);
    });
  }, []);

  const filtered = filterByMonths(transactions, months);
  const categoryData = categoryWiseSales(filtered);
  const productData = productWiseSales(filtered, category);

  return (
    <div className="pt-20 px-4 md:px-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Business Analytics</h1>

      {/* Period Selector */}
      <select
        className="mb-6 border rounded px-3 py-2"
        value={months}
        onChange={e => setMonths(Number(e.target.value))}
      >
        <option value={1}>Last 1 Month</option>
        <option value={2}>Last 2 Months</option>
        <option value={3}>Last 3 Months</option>
        <option value={6}>Last 6 Months</option>
      </select>

      {/* Category-wise */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="font-semibold mb-4">
          Category-wise Sales Contribution (%)
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={categoryData} dataKey="value" outerRadius={100}>
              {categoryData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Product-wise */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-4">
          Product-wise Contribution ({category})
        </h2>

        <select
          className="mb-4 border rounded px-3 py-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="doors">Doors</option>
          <option value="plywood">Plywood</option>
          <option value="sunmica">Sunmica</option>
        </select>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8B5A2B" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
// function filterByMonths(transactions, months) {
//   const cutoff = new Date();
//   cutoff.setMonth(cutoff.getMonth() - months);

//   return transactions.filter(tx =>
//     new Date(tx.date) >= cutoff && tx.quantity < 0
//   );
// }
function filterByMonths(transactions, months) {
  if (!transactions.length) return [];

  // Find latest transaction date instead of system date
  const latestDate = new Date(
    Math.max(...transactions.map(tx => new Date(tx.date)))
  );

  const start = new Date(
    latestDate.getFullYear(),
    latestDate.getMonth() - (months - 1),
    1,
    0, 0, 0, 0
  );

  return transactions.filter(tx => {
    const d = new Date(tx.date);
    return d >= start && tx.quantity < 0; // sales only
  });
}


function categoryWiseSales(transactions) {
  const result = { doors: 0, plywood: 0, sunmica: 0 };

  transactions.forEach(tx => {
    result[tx.product] += Math.abs(tx.quantity);
  });

  const total = Object.values(result).reduce((a, b) => a + b, 0);

  return Object.keys(result).map(cat => ({
    name: cat,
    value: total ? ((result[cat] / total) * 100).toFixed(1) : 0
  }));
}
function productWiseSales(transactions, category) {
  const map = {};

  transactions
    .filter(tx => tx.product === category)
    .forEach(tx => {
      map[tx.product_id] =
        (map[tx.product_id] || 0) + Math.abs(tx.quantity);
    });

  const total = Object.values(map).reduce((a, b) => a + b, 0);

  return Object.entries(map).map(([id, qty]) => ({
    name: id,
    value: total ? ((qty / total) * 100).toFixed(1) : 0
  }));
}
