"use client";
import Link from "next/link";
import { ChevronRight, Shield, Headphones, BadgeCheck, DollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SearchBar from "@/components/SearchBar";

export default function HeroSection({ searchQuery, setSearchQuery }) {
  const { t, language } = useLanguage();

  // Service Categories - Updated with Glass Cleaner and Water Tank Cleaning
  const topServices = [
    { nameEn: "Electrician", nameBn: "ইলেকট্রিশিয়ান", href: "/services/electrician" },
    { nameEn: "Plumber", nameBn: "প্লাম্বার", href: "/services/plumber" },
    { nameEn: "AC Service", nameBn: "এসি সার্ভিসিং", href: "/services/ac-repair" },
    { nameEn: "Carpenter", nameBn: "কাঠমিস্ত্রি", href: "/services/carpenter" },
    { nameEn: "Painter", nameBn: "রংমিস্ত্রি", href: "/services/painter" },
    { nameEn: "Deep Cleaning", nameBn: "ডিপ ক্লিনিং", href: "/services/deep-cleaning" },
    { nameEn: "Glass Cleaner", nameBn: "গ্লাস ক্লিনার", href: "/services/glass-cleaning" },
    { nameEn: "Water Tank Cleaning", nameBn: "ওয়াটার ট্যাংক ক্লিনিং", href: "/services/water-tank-cleaning" },
    { nameEn: "Home Shifting", nameBn: "বাসা বদল", href: "/services/home-shifting" },
    { nameEn: "CCTV Setup", nameBn: "সিসিটিভি সেটআপ", href: "/services/cctv" },
    { nameEn: "Internet Setup", nameBn: "ইন্টারনেট সেটআপ", href: "/services/internet" },
    { nameEn: "Home Tutor", nameBn: "প্রাইভেট টিউটর", href: "/services/tutor" },
    { nameEn: "Driver", nameBn: "ড্রাইভার", href: "/services/driver" },
    { nameEn: "Tailor", nameBn: "দর্জি", href: "/services/tailor" },
    { nameEn: "Salon at Home", nameBn: "বিউটি সার্ভিস", href: "/services/beauty" },
    { nameEn: "Generator Service", nameBn: "জেনারেটর সার্ভিস", href: "/services/generator" },
    { nameEn: "Fridge Repair", nameBn: "ফ্রিজ মেরামত", href: "/services/appliance-repair" },
    { nameEn: "Sofa Cleaning", nameBn: "সোফা ক্লিনিং", href: "/services/sofa-cleaning" },
    { nameEn: "Packers & Movers", nameBn: "প্যাকিং ও মুভিং", href: "/services/packers-movers" },
    { nameEn: "Event Decoration", nameBn: "ইভেন্ট ডেকোরেশন", href: "/services/decoration" }
  ];

  // Trust badges data
  const trustBadges = [
    { nameEn: "Secure Payments", nameBn: "সুরক্ষিত পেমেন্ট", icon: Shield },
    { nameEn: "24/7 Support", nameBn: "২৪/৭ সাপোর্ট", icon: Headphones },
    { nameEn: "Verified Professionals", nameBn: "ভেরিফাইড প্রফেশনাল", icon: BadgeCheck },
    { nameEn: "Money Back Guarantee", nameBn: "মানি ব্যাক গ্যারান্টি", icon: DollarSign }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            
            {/* Slogan - Centered */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-gray-50 rounded-full px-4 py-1.5 mb-6 border border-gray-200">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs md:text-sm font-medium text-gray-700 tracking-wide">
                  Trusted • Skilled • Connected
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4">
                {t.heroTitle}
              </h1>
              
              <p className="text-base md:text-lg text-gray-600 mb-8">
                {t.heroSubtitle}
              </p>
            </div>
            
            {/* Search Bar - Centered */}
            <div className="max-w-2xl mx-auto mb-10">
              <SearchBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                language={language}
                isScrolled={false}
              />
            </div>
            
            {/* Top Services - Compact cards below search bar */}
            <div className="mb-12">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {topServices.map((service, idx) => (
                  <Link
                    key={idx}
                    href={service.href}
                    className="group flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all duration-200"
                  >
                    <span className="truncate">
                      {language === 'bengali' ? service.nameBn : service.nameEn}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-1" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Trust Section - Rectangle Shapes with Green Border on Hover */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
                {trustBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="group flex items-center gap-3 px-5 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-green-400 hover:bg-green-50/30 hover:shadow-md transition-all duration-300 cursor-default"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300">
                      <badge.icon className="w-4 h-4 text-gray-600 group-hover:text-green-600 transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors duration-300">
                      {language === 'bengali' ? badge.nameBn : badge.nameEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}