import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { CategoryProvider } from "./context/CategoryContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CategoryProvider>
      <App />
    </CategoryProvider>
  </BrowserRouter>
);