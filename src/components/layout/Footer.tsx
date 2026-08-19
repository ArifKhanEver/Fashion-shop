import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";

const QUICK_LINKS = [
  { label: "Luxury Edit Heels", href: "/category/luxury-edit-heels" },
  { label: "Luxury Bags", href: "/category/luxury-bags" },
  { label: "Flats & Sandals", href: "/category/flats-sandals" },
  { label: "Party Clutch", href: "/category/party-clutch" },
  { label: "Clearance Sale", href: "/category/clearance-sale" },
];

const SUPPORT_LINKS = [
  { label: "Track Your Order", href: "/track-order" },
  { label: "About Us", href: "/about" },
  { label: "Shop All", href: "/shop" },
];

export default function Footer({
  logoUrl,
  storeName = "DEVWONDER FASHION",
  phoneNumber,
}: {
  logoUrl?: string | null;
  storeName?: string;
  phoneNumber?: string | null;
}) {
  const storeInitials = storeName ? storeName.charAt(0).toUpperCase() : "D";

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* ── Main Footer ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <Image src={logoUrl} alt={storeName} width={160} height={40} className="h-10 w-auto rounded object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-[#E91E8C] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{storeInitials}</span>
                  </div>
                  <span className="text-xl font-extrabold text-white">
                    {storeName.split(" ")[0] || "DEVWONDER"} <span className="text-[#E91E8C]">{storeName.split(" ").slice(1).join(" ") || "FASHION"}</span>
                  </span>
                </>
              )}
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Your daily fashion companion. Discover premium heels, luxury bags,
              and fashionable accessories delivered across Bangladesh.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#E91E8C] transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#E91E8C] transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              {/* TikTok icon (SVG fallback) */}
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#E91E8C] transition-colors"
                aria-label="TikTok"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.77a8.18 8.18 0 004.78 1.54V6.84a4.85 4.85 0 01-1.01-.15z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Collections
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#E91E8C] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#E91E8C] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-[#E91E8C] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">{phoneNumber || "+880 1700-000000"}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-[#E91E8C] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">support@fashion.devwonder.shop</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#E91E8C] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">
                  Dhaka, Bangladesh
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Copyright Bar ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} DevWonder Fashion. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Powered by ❤️ — Cash on Delivery across Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
