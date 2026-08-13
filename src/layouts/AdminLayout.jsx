import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="signet-app flex h-screen text-[rgb(var(--foreground))]">
      <div className="signet-ambient" aria-hidden />
      <Sidebar />
      <div className="relative z-[1] flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-auto p-6 md:p-8"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
