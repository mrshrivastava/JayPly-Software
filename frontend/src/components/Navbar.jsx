import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const NavItem = ({ to, label, onClick }) => {
    const active = location.pathname === to || location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`block px-4 py-3 rounded text-sm font-medium transition
          ${
            active
              ? "bg-[#8B5A2B] text-white"
              : "text-gray-200 hover:bg-gray-700"
          }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-gray-900 fixed top-0 left-0 right-0 z-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-[#8B5A2B] text-white font-bold px-3 py-1 rounded">
            JAYPLY
          </div>
          <span className="text-white font-semibold text-lg hidden sm:block">
            Plywood Manager
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-2">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/stocks/doors" label="Doors" />
          <NavItem to="/stocks/plywood" label="Plywood" />
          <NavItem to="/stocks/sunmica" label="Sunmica" />
          <NavItem to="/transactions" label="Transactions" />
          <NavItem to="/analytics" label="Analytics" />


          <button
            onClick={logout}
            className="ml-3 px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Logout
          </button>
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-2xl focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 py-2 space-y-1">
            <NavItem to="/" label="Dashboard" onClick={() => setOpen(false)} />
            <NavItem to="/stocks/doors" label="Doors" onClick={() => setOpen(false)} />
            <NavItem to="/stocks/plywood" label="Plywood" onClick={() => setOpen(false)} />
            <NavItem to="/stocks/sunmica" label="Sunmica" onClick={() => setOpen(false)} />
            <NavItem to="/transactions" label="Transactions" onClick={() => setOpen(false)} />

            <button
              onClick={logout}
              className="w-full mt-2 px-4 py-3 rounded bg-red-600 text-white text-sm hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
