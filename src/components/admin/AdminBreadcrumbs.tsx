"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export default function AdminBreadcrumbs() {
  const pathname = usePathname();
  
  if (pathname === "/admin") return null;

  const paths = pathname.split("/").filter(Boolean);
  
  // Build breadcrumb segments
  const segments = paths.map((path, index) => {
    const href = "/" + paths.slice(0, index + 1).join("/");
    // Format text: replace hyphens with spaces and capitalize words
    const label = path
      .replace(/-/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return { href, label };
  });

  return (
    <nav className="flex text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link href="/admin" className="inline-flex items-center hover:text-[#E91E8C] transition-colors">
            <Home className="w-4 h-4 mr-2" />
            Admin
          </Link>
        </li>
        {segments.slice(1).map((segment, index) => {
          const isLast = index === segments.length - 2;
          
          return (
            <li key={segment.href}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                {isLast ? (
                  <span className="text-gray-900 font-semibold">{segment.label}</span>
                ) : (
                  <Link href={segment.href} className="hover:text-[#E91E8C] transition-colors">
                    {segment.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
