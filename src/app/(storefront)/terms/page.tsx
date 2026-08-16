import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | DevWonder Fashion",
  description: "Read our terms of service and conditions of use.",
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
            <div className="w-16 h-16 bg-pink-50 text-[#E91E8C] rounded-2xl flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
              <p className="text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="prose prose-lg text-gray-600 max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and DevWonder Fashion (“Company”, “we”, “us”, or “our”), concerning your access to and use of our website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Products & Pricing</h2>
            <p>
              All products are subject to availability, and we cannot guarantee that items will be in stock. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change. We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Purchases and Payment</h2>
            <p>
              We accept Cash on Delivery (COD) and various digital payment methods. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. We reserve the right to refuse any order placed through the Site.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Shipping & Delivery</h2>
            <p>
              Delivery times may vary depending on your location within Bangladesh. While we strive to deliver within the estimated timeframes (typically 2-4 business days), we are not liable for delays outside our control. Delivery charges will be calculated and displayed at checkout.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Returns and Refunds</h2>
            <p>
              Please review our Return Policy posted on the Site prior to making any purchases. If you are unsatisfied with a product, you must contact our support team within 3 days of delivery. The item must be unused, in its original packaging, and with all tags attached.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
            <p>
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mt-4 border border-gray-100">
              <p><strong>Email:</strong> support@devwonder.shop</p>
              <p><strong>Phone:</strong> +880 1700-000000</p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <Link href="/" className="text-[#E91E8C] font-bold hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
