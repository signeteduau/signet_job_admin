import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { showConnectToAdmin } from "../lib/managementAccess";

function isWriteControl(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest("[data-viewer-action]")) return true;
  if (
    target.closest(
      "[data-viewer-ok], .signet-back-link, .signet-sidebar, .signet-topbar, .signet-filter-bar, .signet-table-footer, .signet-nav-scrim"
    )
  ) {
    return Boolean(target.closest("[data-viewer-action]"));
  }

  const node = target.closest(
    "button.signet-btn, button.signet-btn-secondary, button.signet-btn-danger, button.btn-primary, button.signet-review-icon-btn, button.signet-theme-swatch, button.signet-fu-btn-save, button.signet-fu-btn-ghost, input[type='submit'], input[type='file'], input[type='color'], input[type='checkbox'], .signet-dropdown-item, select"
  );
  if (!node) return false;
  if (node.matches(".signet-dropdown-item") && node.hasAttribute("data-viewer-ok")) return false;
  return true;
}

export default function AdminLayout() {
  const location = useLocation();
  const { isViewer } = useAuth();
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

  useEffect(() => {
    if (!isViewer) return;

    const blockEvent = (event) => {
      if (!isWriteControl(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      showConnectToAdmin();
    };

    const blockSubmit = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      showConnectToAdmin();
    };

    document.addEventListener("click", blockEvent, true);
    document.addEventListener("change", blockEvent, true);
    document.addEventListener("submit", blockSubmit, true);
    return () => {
      document.removeEventListener("click", blockEvent, true);
      document.removeEventListener("change", blockEvent, true);
      document.removeEventListener("submit", blockSubmit, true);
    };
  }, [isViewer]);

  return (
    <div className={`signet-app flex h-screen text-[rgb(var(--foreground))]${navOpen ? " is-nav-open" : ""}`}>
      <div className="signet-ambient" aria-hidden />
      {navOpen && (
        <button
          type="button"
          className="signet-nav-scrim"
          aria-label="Close navigation"
          data-viewer-ok
          onClick={() => setNavOpen(false)}
        />
      )}
      <Sidebar mobileOpen={navOpen} onClose={() => setNavOpen(false)} />
      <div className="relative z-[1] flex min-w-0 flex-col flex-1 overflow-hidden">
        <Topbar navOpen={navOpen} onMenuClick={() => setNavOpen((open) => !open)} />
        {isViewer && (
          <div className="signet-viewer-banner" data-viewer-ok>
            <span>View only. Connect to admin to add or remove anything.</span>
          </div>
        )}
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
