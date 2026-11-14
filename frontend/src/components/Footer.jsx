import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { BrandLockup } from "@/components/BrandLockup";

import { SUPPORT_EMAIL } from "@/lib/site";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { to: "/discover", label: "Restaurants" },
      { to: "/about", label: "About" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Members",
    links: [
      { to: "/login", label: "Sign in" },
      { to: "/bookings", label: "My reservations" },
      { to: "/wallet", label: "Wallet" },
    ],
  },
  {
    title: "Restaurants",
    links: [{ to: "/restaurant-login", label: "Restaurant sign in" }],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms of use" },
      { to: "/privacy", label: "Privacy policy" },
      { to: "/refunds", label: "Cancellation & refunds" },
      { to: "/pricing", label: "Pricing" },
      { to: "/shipping", label: "Shipping & delivery" },
      { to: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#E3B364]/20 bg-[#0B0A0A] text-[#A89C8C]" data-testid="site-footer">
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-10 lg:px-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" aria-label="Table home">
              <BrandLockup />
            </Link>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E3B364]">{col.title}</div>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="transition-colors hover:text-[#F6EBD6]">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#E3B364]/15 pt-6 text-xs">
          <span>© {new Date().getFullYear()} Table. Dine · Earn · Return.</span>
          {SUPPORT_EMAIL && (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 transition-colors hover:text-[#F6EBD6]">
              <Mail strokeWidth={1.5} className="h-4 w-4 text-[#E3B364]" />
              {SUPPORT_EMAIL}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
