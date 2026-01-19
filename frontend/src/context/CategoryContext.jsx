import React, { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);

  const loadCategories = async () => {
    const res = await api.get("/categories");
    setCategories(res.data || []);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        refreshCategories: loadCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}
