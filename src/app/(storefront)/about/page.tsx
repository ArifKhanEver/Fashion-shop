import { Metadata } from "next";
import { CheckCircle2, ShieldCheck, Truck, Users } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | DevWonder Fashion",
  description: "Learn more about DevWonder Fashion, your daily fashion companion in Bangladesh.",
};

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-[#E91E8C] text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About DevWonder Fashion</h1>
        <p className="text-lg md:text-xl text-pink-100 max-w-2xl mx-auto">
          Elevating everyday style for everyone in Bangladesh with premium quality and unmatched elegance.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg text-gray-600 max-w-none">
            <p className="mb-4">
              DevWonder Fashion started with a simple idea: premium fashion should be accessible to everyone without compromising on quality or style. Born in the heart of Dhaka, we have quickly grown into one of the most trusted fashion destinations for luxury heels, bags, flats, and accessories in Bangladesh.
            </p>
            <p>
              We believe that what you wear is an extension of who you are. That&apos;s why our team carefully curates every single piece in our collection, ensuring it meets our high standards for durability, comfort, and trend-setting design. From a casual day out to your most important evening events, we are your daily fashion companion.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 mx-auto bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
            <p className="text-gray-500">Every product is handpicked and quality-checked before it reaches you.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 mx-auto bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center mb-6">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
            <p className="text-gray-500">We offer incredibly fast and reliable delivery all across Bangladesh.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 mx-auto bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Shopping</h3>
            <p className="text-gray-500">Your privacy and security are our top priorities. Shop with complete peace of mind.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 mx-auto bg-pink-50 text-[#E91E8C] rounded-full flex items-center justify-center mb-6">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Customer First</h3>
            <p className="text-gray-500">Our dedicated support team is always here to assist you with any queries.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link href="/shop" className="inline-block bg-[#E91E8C] text-white px-10 py-4 rounded-full font-bold hover:bg-[#d8157a] hover:shadow-lg transition-all text-lg">
            Explore Our Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
