import React, { useContext, useEffect, useState } from "react";
import api from "../services/api";
import { CategoryContext } from "../context/CategoryContext";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";

const COLORS = ["#8B5A2B", "#2563EB", "#16A34A", "#DC2626", "#9333EA"];

export default function Analytics() {
  const { categories } = useContext(CategoryContext);

  const [period, setPeriod] = useState(1);
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productData, setProductData] = useState([]);

  /* ================= AUTO SELECT FIRST CATEGORY ================= */
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  /* ================= LOAD ANALYTICS ================= */
  useEffect(() => {
    loadCategoryAnalytics();
    loadProductAnalytics();
  }, [period, categories, selectedCategory]);

  /* ================= CATEGORY-WISE SALES ================= */
  const loadCategoryAnalytics = async () => {
    const res = await api.get("/transactions");
    const transactions = res.data.data || [];

    const start = new Date();
    start.setMonth(start.getMonth() - period);
    start.setHours(0, 0, 0, 0);

    const totals = {};
    categories.forEach(c => (totals[c.id] = 0));

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d >= start && t.quantity < 0) {
        totals[t.product] += Math.abs(t.quantity);
      }
    });

    const chartData = Object.entries(totals)
      .filter(([_, v]) => v > 0)
      .map(([id, value]) => ({
        name: categories.find(c => c.id === id)?.name || id,
        value
      }));

    setCategoryData(chartData);
  };

  /* ================= PRODUCT-WISE SALES ================= */
  const loadProductAnalytics = async () => {
    if (!selectedCategory) return;

    const res = await api.get("/transactions");
    const transactions = res.data.data || [];

    const start = new Date();
    start.setMonth(start.getMonth() - period);
    start.setHours(0, 0, 0, 0);

    const totals = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (
        d >= start &&
        t.quantity < 0 &&
        t.product === selectedCategory
      ) {
        totals[t.product_id] =
          (totals[t.product_id] || 0) + Math.abs(t.quantity);
      }
    });

    const chartData = Object.entries(totals)
      .map(([id, value]) => ({ name: id, value }))
      .sort((a, b) => b.value - a.value);

    setProductData(chartData);
  };

  return (
    <div className="pt-20 px-4 md:px-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Business Analytics</h1>

        <select
          value={period}
          onChange={e => setPeriod(Number(e.target.value))}
          className="border rounded px-3 py-2 w-full sm:w-auto"
        >
          <option value={1}>Last 1 Month</option>
          <option value={2}>Last 2 Months</option>
          <option value={3}>Last 3 Months</option>
        </select>
      </div>

      {/* CATEGORY-WISE CHART */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="font-semibold mb-4">
          Category-wise Sales Contribution (%)
        </h2>

        {categoryData.length === 0 ? (
          <p className="text-gray-500">
            No sales data available for selected period
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {categoryData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* PRODUCT-WISE CHART */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <h2 className="font-semibold">
            Product-wise Contribution (
            {categories.find(c => c.id === selectedCategory)?.name})
          </h2>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-2 w-full sm:w-auto"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {productData.length === 0 ? (
          <p className="text-gray-500">
            No sales data for selected category
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8B5A2B" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
