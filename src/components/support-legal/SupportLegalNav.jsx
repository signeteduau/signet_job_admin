import { NavLink, useLocation } from "react-router-dom";
import { HelpCircle, FileText, Shield } from "lucide-react";

const TABS = [
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle, match: ["/admin/faqs"] },
  { to: "/admin/terms", label: "Terms", icon: FileText, match: ["/admin/terms"] },
  { to: "/admin/privacy", label: "Privacy", icon: Shield, match: ["/admin/privacy"] },
];

function isActiveTab(pathname, tab) {
  return tab.match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export default function SupportLegalNav() {
  const { pathname } = useLocation();

  return (
    <nav className="signet-support-tabs" aria-label="Support and legal sections">
      {TABS.map((tab) => {
        const active = isActiveTab(pathname, tab);
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={`signet-support-tab ${active ? "is-active" : ""}`}
          >
            <Icon size={16} />
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
