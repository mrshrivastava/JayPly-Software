import React, {
  useEffect,
  useRef,
  useState,
  useContext
} from "react";
import api from "../services/api";
import { CategoryContext } from "../context/CategoryContext";

const LIMIT = 50;

export default function Transactions() {
  const { categories } = useContext(CategoryContext);

  const [transactions, setTransactions] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  /* ================= DATE FILTER ================= */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* ================= NEW TRANSACTION ================= */
  const [productType, setProductType] = useState("");
  const [productList, setProductList] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");

  /* ================= SEARCHABLE PRODUCT ================= */
  const [productSearch, setProductSearch] = useState("");
  const [showProductList, setShowProductList] = useState(false);

  const loaderRef = useRef(null);

  /* ================= INIT CATEGORY ================= */
  useEffect(() => {
    if (categories.length && !productType) {
      setProductType(categories[0].id);
    }
  }, [categories, productType]);

  /* ================= LOAD PRODUCT LIST ================= */
  useEffect(() => {
    if (!productType) return;

    api.get(`/stocks/${productType}`).then(res => {
      setProductList(res.data || []);
    });
  }, [productType]);

  /* ================= LOAD TRANSACTIONS ================= */
  const loadTransactions = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);

    const res = await api.get("/transactions", {
      params: {
        offset: reset ? 0 : offset,
        limit: LIMIT,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
    });

    setTransactions(prev =>
      reset ? res.data.data : [...prev, ...res.data.data]
    );

    setHasMore(res.data.hasMore);
    setOffset(prev => (reset ? LIMIT : prev + LIMIT));
    setLoading(false);
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadTransactions(true);
  }, []);

  /* ================= APPLY DATE FILTER ================= */
  const applyDateFilter = () => {
    setTransactions([]);
    setOffset(0);
    setHasMore(true);
    loadTransactions(true);
  };

  /* ================= INFINITE SCROLL ================= */
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadTransactions();
        }
      },
      { rootMargin: "200px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  /* ================= ADD TRANSACTION ================= */
  const addTransaction = async () => {
    if (!productType || !productId || !quantity) {
      alert("Please select category, product and quantity");
      return;
    }

    await api.post("/transactions", {
      product: productType,
      product_id: productId,
      quantity: Number(quantity),
    });

    setQuantity("");
    setProductId("");
    setProductSearch("");

    setTransactions([]);
    setOffset(0);
    setHasMore(true);
    loadTransactions(true);
  };

  /* ================= DELETE ================= */
  const remove = async (id) => {
    if (!confirm("Delete this transaction?")) return;

    await api.delete(`/transactions/${id}`);

    setTransactions([]);
    setOffset(0);
    setHasMore(true);
    loadTransactions(true);
  };

  if (!categories.length) {
    return (
      <div className="pt-20 text-center text-gray-500">
        Loading categories...
      </div>
    );
  }

  const downloadTransactions = async () => {
  try {
    const res = await api.get("/download/transactions", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "transactions.xlsx");

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("Failed to download transactions file");
    console.error(err);
  }
};


  return (
    <div className="pt-20 px-4 md:px-6 bg-gray-100 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Transactions</h1>

        <button
          onClick={downloadTransactions}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 w-full sm:w-auto"
        >
          Download Transactions Excel
        </button>
      </div>

      {/* ADD TRANSACTION */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="font-semibold mb-4">New Transaction</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            className="border rounded px-3 py-2"
            value={productType}
            onChange={e => {
              setProductType(e.target.value);
              setProductId("");
              setProductSearch("");
              setShowProductList(false);
            }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              className="border rounded px-3 py-2 w-full"
              placeholder="Search product ID..."
              value={productSearch}
              onChange={e => {
                setProductSearch(e.target.value);
                setShowProductList(true);
                setProductId("");
              }}
              onFocus={() => setShowProductList(true)}
            />

            {showProductList && (
              <div className="absolute z-20 bg-white border rounded w-full max-h-48 overflow-y-auto shadow mt-1">
                {productList
                  .filter(p =>
                    p.id.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map(p => (
                    <div
                      key={p.id}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setProductId(p.id);
                        setProductSearch(p.id);
                        setShowProductList(false);
                      }}
                    >
                      {p.id}
                    </div>
                  ))}

                {productList.filter(p =>
                  p.id.toLowerCase().includes(productSearch.toLowerCase())
                ).length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No matching products
                  </div>
                )}
              </div>
            )}
          </div>

          <input
            type="number"
            placeholder="+ / - Quantity"
            className="border rounded px-3 py-2"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />

          <button
            onClick={addTransaction}
            className="bg-[#8B5A2B] text-white rounded px-4 py-2 hover:bg-[#734822]"
          >
            Add
          </button>
        </div>
      </div>

      {/* DATE FILTER */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="font-semibold mb-4">Filter by Date</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="border rounded px-3 py-2"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />

          <button
            onClick={applyDateFilter}
            className="bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-900"
          >
            Apply
          </button>
        </div>
      </div>


      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-[120px] px-4 py-3 text-left">Date</th>
              <th className="w-[120px] px-4 py-3 text-left">Category</th>
              <th className="w-[140px] px-4 py-3 text-left">Product ID</th>
              <th className="w-[100px] px-4 py-3 text-right">Qty</th>
              <th className="w-[120px] px-4 py-3 text-right">Remaining</th>
              <th className="w-[100px] px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map(tx => (
              <tr key={tx.transaction_id} className="border-t">
                <td className="px-4 py-3">
                  {new Date(tx.date).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3 capitalize">{tx.product}</td>
                <td className="px-4 py-3 font-mono">{tx.product_id}</td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    tx.quantity < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {tx.quantity}
                </td>
                <td className="px-4 py-3 text-right">
                  {tx.remaining_product_stock}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => remove(tx.transaction_id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {hasMore && (
          <div
            ref={loaderRef}
            className="p-4 text-center text-gray-500"
          >
            Loading more...
          </div>
        )}
      </div>
    </div>
  );
}
