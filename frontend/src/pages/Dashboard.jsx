import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    doors: 0,
    plywood: 0,
    sunmica: 0,
    transactions: 0,
    stockIn: 0,
    stockOut: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          doorsRes,
          plywoodRes,
          sunmicaRes,
          transactionsRes
        ] = await Promise.all([
          api.get("/stocks/doors"),
          api.get("/stocks/plywood"),
          api.get("/stocks/sunmica"),
          api.get("/transactions"),
        ]);

        const doors = doorsRes.data || [];
        const plywood = plywoodRes.data || [];
        const sunmica = sunmicaRes.data || [];
        const transactions = transactionsRes.data.data || [];


        const stockIn = transactions
          .filter(t => t.quantity > 0)
          .reduce((a, b) => a + b.quantity, 0);

        const stockOut = Math.abs(
          transactions
            .filter(t => t.quantity < 0)
            .reduce((a, b) => a + b.quantity, 0)
        );

        setSummary({
          doors: doors.reduce((a, b) => a + (b.stock || 0), 0),
          plywood: plywood.reduce((a, b) => a + (b.stock || 0), 0),
          sunmica: sunmica.reduce((a, b) => a + (b.stock || 0), 0),
          transactions: transactions.length,
          stockIn,
          stockOut,
        });

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

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
          Plywood Stock Dashboard
        </h1>
        <p className="text-gray-600">
          Inventory overview & analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Stat title="Doors Stock" value={summary.doors} />
        <Stat title="Plywood Stock" value={summary.plywood} />
        <Stat title="Sunmica Stock" value={summary.sunmica} />
        <Stat title="Transactions" value={summary.transactions} />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Current Stock Distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { name: "Doors", value: summary.doors },
                { name: "Plywood", value: summary.plywood },
                { name: "Sunmica", value: summary.sunmica },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8B5A2B" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Stock In vs Stock Out</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={[
                  { name: "Stock In", value: summary.stockIn },
                  { name: "Stock Out", value: summary.stockOut },
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
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
