"use client";

import { useState } from "react";
import { Search, Bell, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      // Very basic global search simulation: direct to products with search query
      router.push(`/admin/products?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 h-16 px-6 flex items-center justify-between shrink-0">
      <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-gray-50 border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#E91E8C] outline-none"
        />
      </form>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E91E8C] rounded-full border border-white"></span>
        </button>
        <div className="h-8 w-8 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
          <UserIcon className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
