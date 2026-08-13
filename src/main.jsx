import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext"; 
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster position="top-right" />   {/* ✅ Moved here */}
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
