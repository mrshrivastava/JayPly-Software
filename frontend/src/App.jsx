import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import Transactions from "./pages/Transactions";
import Navbar from "./components/Navbar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AddCategory from "./pages/AddCategory";

export default function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const PrivateRoute = ({ children }) =>
    token ? children : <Navigate to="/login" />;

  return (
    <>
      {token && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />

        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/stocks/:type" element={<PrivateRoute><Stocks /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/settings/categories" element={<PrivateRoute><AddCategory /></PrivateRoute>} />
      </Routes>
    </>
  );
}
