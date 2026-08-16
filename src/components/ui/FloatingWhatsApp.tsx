"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface FloatingWhatsAppProps {
  whatsappNumber: string;
}

export default function FloatingWhatsApp({ whatsappNumber }: FloatingWhatsAppProps) {
  // Ensure the number is formatted correctly for the WA link (numbers only)
  const formattedNumber = whatsappNumber.replace(/\D/g, "");
  
  if (!formattedNumber) return null;

  return (
    <Link
      href={`https://wa.me/${formattedNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg shadow-[#25D366]/30 hover:bg-[#20bd5a] hover:scale-110 transition-all cursor-pointer flex items-center justify-center animate-bounce-slow"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
    </Link>
  );
}
