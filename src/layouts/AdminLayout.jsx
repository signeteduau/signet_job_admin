import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminLayout() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("signet-nav-lock", navOpen);
    return () => document.body.classList.remove("signet-nav-lock");
  }, [navOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={`signet-app flex h-screen text-[rgb(var(--foreground))]${navOpen ? " is-nav-open" : ""}`}>
      <div className="signet-ambient" aria-hidden />
      {navOpen && (
        <button
          type="button"
          className="signet-nav-scrim"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />
      )}
      <Sidebar mobileOpen={navOpen} onClose={() => setNavOpen(false)} />
      <div className="relative z-[1] flex min-w-0 flex-col flex-1 overflow-hidden">
        <Topbar navOpen={navOpen} onMenuClick={() => setNavOpen((open) => !open)} />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="signet-main flex-1 overflow-auto"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
