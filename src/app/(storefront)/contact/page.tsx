import { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { getGlobalStoreSettings } from "@/actions/store-settings.actions";

export const metadata: Metadata = {
  title: "Contact Us | DevWonder Fashion",
  description: "Get in touch with DevWonder Fashion. We are here to help.",
};

export default async function ContactPage() {
  const settings = await getGlobalStoreSettings();

  return (
    <div className="bg-gray-50 min-h-screen py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-500">
            Have a question, feedback, or need help with your order? Our team is always ready to assist you!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Get In Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Call Us</p>
                  <p className="text-lg font-bold text-gray-900">{settings.phoneNumber || "+880 1700-000000"}</p>
                  <p className="text-sm text-gray-400 mt-1">Mon - Sat, 10:00 AM - 8:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Us</p>
                  <p className="text-lg font-bold text-gray-900">support@devwonder.shop</p>
                  <p className="text-sm text-gray-400 mt-1">We aim to reply within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-lg font-bold text-gray-900">Dhaka, Bangladesh</p>
                  <p className="text-sm text-gray-400 mt-1">Online Store Only</p>
                </div>
              </div>
            </div>
            
            {settings.whatsappNumber && (
              <a 
                href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#20bd5a] transition-all shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with us on WhatsApp
              </a>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none" placeholder="John Doe" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none" placeholder="john@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#E91E8C] focus:border-[#E91E8C] bg-gray-50 focus:bg-white transition-all outline-none resize-none" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="button" onClick={() => alert("Message sent successfully! (Demo)")} className="w-full bg-[#E91E8C] text-white font-bold py-4 rounded-xl hover:bg-[#d8157a] hover:shadow-lg transition-all">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Improve padding
