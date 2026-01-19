import React, { useContext, useEffect, useState } from "react";
import api from "../services/api";
import { CategoryContext } from "../context/CategoryContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8B5A2B", "#A47551", "#C19A6B", "#D2B48C", "#E6CCB2"];

export default function Dashboard() {
  const { categories } = useContext(CategoryContext);

  const [stockSummary, setStockSummary] = useState([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [stockIn, setStockIn] = useState(0);
  const [stockOut, setStockOut] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categories.length) return;
    loadDashboard();
  }, [categories]);

  const loadDashboard = async () => {
    try {
      /* ---------------- STOCK SUMMARY ---------------- */
      const stockRequests = categories.map(cat =>
        api.get(`/stocks/${cat.id}`)
      );

      const stockResponses = await Promise.all(stockRequests);

      const summary = stockResponses.map((res, index) => ({
        name: categories[index].name,
        value: res.data.reduce(
          (sum, item) => sum + Number(item.stock || 0),
          0
        ),
      }));

      setStockSummary(summary);

      /* ---------------- TRANSACTIONS ---------------- */
      const txRes = await api.get("/transactions", {
        params: { limit: 10000 },
      });

      const txData = txRes.data.data || [];
      setTransactionsCount(txData.length);

      let inQty = 0;
      let outQty = 0;

      txData.forEach(tx => {
        if (tx.quantity > 0) inQty += tx.quantity;
        if (tx.quantity < 0) outQty += Math.abs(tx.quantity);
      });

      setStockIn(inQty);
      setStockOut(outQty);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 text-center text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 md:px-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Stock Dashboard
        </h1>
        <p className="text-gray-600">
          Inventory overview & analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stockSummary.map(item => (
          <Stat
            key={item.name}
            title={`${item.name} Stock`}
            value={item.value}
          />
        ))}
        <Stat title="Transactions" value={transactionsCount} />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">
            Current Stock Distribution
          </h2>

          {stockSummary.every(s => s.value === 0) ? (
            <p className="text-gray-500 text-center py-10">
              No stock data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stockSummary}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8B5A2B" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">
            Stock In vs Stock Out
          </h2>

          {(stockIn === 0 && stockOut === 0) ? (
            <p className="text-gray-500 text-center py-10">
              No transaction data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Stock In", value: stockIn },
                    { name: "Stock Out", value: stockOut },
                  ]}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                >
                  <Cell fill="#16A34A" />
                  <Cell fill="#DC2626" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI COMPONENT ---------------- */

function Stat({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#8B5A2B]">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">
        {value}
      </p>
    </div>
  );
}
