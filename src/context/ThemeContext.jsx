import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(localStorage.getItem("themeMode") || "light");
  const [accent, setAccent] = useState(localStorage.getItem("themeAccent") || "#004CF0");

  // ✅ Apply light/dark mode by toggling <html class="dark">
  useEffect(() => {
    const root = document.documentElement;

    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("themeMode", mode);
  }, [mode]);

  // ✅ Apply dynamic accent color to CSS variable
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--purple", accent);
    localStorage.setItem("themeAccent", accent);
  }, [accent]);

  const toggleTheme = () => setMode((prev) => (prev === "light" ? "dark" : "light"));
  const resetAccent = () => setAccent("#004CF0");

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, accent, setAccent, resetAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}
