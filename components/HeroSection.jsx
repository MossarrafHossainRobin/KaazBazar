"use client";
import Link from "next/link";
import { Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection({ searchQuery, setSearchQuery }) {
  const { t } = useLanguage();

  // Service Categories Array - এখানে সঠিক জায়গায় ডিফাইন করা হয়েছে
  const serviceCategories = [
    { name: "Electrician", icon: "⚡", href: "/services/electrician" },
    { name: "Plumber", icon: "🔧", href: "/services/plumber" },
    { name: "Carpenter", icon: "🪚", href: "/services/carpenter" },
    { name: "Gardener", icon: "🌱", href: "/services/gardener" },
    { name: "Others", icon: "📦", href: "/services/others" }
  ];

  const popularSearches = [
    "ইলেকট্রিক তারের কাজ",
    "পাইপ লিকেজ রিপেয়ার",
    "ফার্নিচার মেরামত",
    "বাগান করা",
    "ঘর পেইন্টিং",
    "এসি সার্ভিসিং"
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
              {t.heroTitle}
            </h1>
            
            <p className="text-base md:text-lg text-gray-600 mb-8">
              {t.heroSubtitle}
            </p>
            
            {/* Search Bar */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-1 flex flex-col md:flex-row gap-2 mb-8 hover:border-gray-500 transition-colors">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-black placeholder-gray-400 focus:outline-none text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setSearchQuery(searchQuery)}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                {t.searchButton}
              </button>
            </div>
            
            {/* Category Chain */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">{t.serviceTypes}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {serviceCategories.map((category, idx) => (
                  <Link
                    key={idx}
                    href={category.href}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Popular Searches */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{t.popularSearches}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(item)}
                    className="text-sm text-gray-600 hover:text-black hover:underline transition-colors"
                  >
                    {item}
                    {idx < popularSearches.length - 1 && (
                      <span className="mx-1 text-gray-300">•</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-6 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">{t.securePayments}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">{t.support247}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">{t.verifiedPros}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700 text-sm">{t.moneyBack}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}