"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Wrench, 
  Droplets, 
  Hammer, 
  Leaf, 
  PaintBucket, 
  Home, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const serviceCategories = [
  {
    id: "electrician",
    name: "Electrical Services",
    icon: <Wrench className="w-8 h-8" />,
    services: [
      "Wiring & rewiring",
      "Fan & light installation",
      "Switch & socket repair",
      "Electrical troubleshooting"
    ],
    exploreLink: "/services/electrician",
    exploreText: "Explore Electricians"
  },
  {
    id: "plumber",
    name: "Plumbing Services",
    icon: <Droplets className="w-8 h-8" />,
    services: [
      "Pipe repair & installation",
      "Bathroom fitting",
      "Water heater service",
      "Drain cleaning"
    ],
    exploreLink: "/services/plumber",
    exploreText: "Explore Plumbers"
  },
  {
    id: "carpenter",
    name: "Carpentry Services",
    icon: <Hammer className="w-8 h-8" />,
    services: [
      "Furniture repair",
      "Custom woodwork",
      "Door & window fitting",
      "Kitchen cabinet installation"
    ],
    exploreLink: "/services/carpenter",
    exploreText: "Explore Carpenters"
  },
  {
    id: "cleaner",
    name: "Cleaning Services",
    icon: <Home className="w-8 h-8" />,
    services: [
      "Deep house cleaning",
      "Office cleaning",
      "Post-construction cleanup",
      "Regular maintenance"
    ],
    exploreLink: "/services/cleaner",
    exploreText: "Explore Cleaners"
  },
  {
    id: "painter",
    name: "Painting Services",
    icon: <PaintBucket className="w-8 h-8" />,
    services: [
      "Interior & exterior painting",
      "Wall texture work",
      "Color consultation",
      "Waterproofing solutions"
    ],
    exploreLink: "/services/painter",
    exploreText: "Explore Painters"
  },
  {
    id: "handyman",
    name: "Handyman Services",
    icon: <Wrench className="w-8 h-8" />,
    services: [
      "Appliance diagnostics & repair",
      "Furniture assembly",
      "General home maintenance",
      "Emergency repairs"
    ],
    exploreLink: "/services/handyman",
    exploreText: "Explore Handymen"
  },
  {
    id: "gardener",
    name: "Gardening Services",
    icon: <Leaf className="w-8 h-8" />,
    services: [
      "Lawn mowing & maintenance",
      "Tree & shrub care",
      "Planting & landscaping",
      "Garden cleanup"
    ],
    exploreLink: "/services/gardener",
    exploreText: "Explore Gardeners"
  }
];

export default function ServicesPage({ selectedCategory = "all", currentUser = null, onShowLogin, searchQuery = "" }) {
  const router = useRouter();
  const { t } = useLanguage();

  // No login required - anyone can explore
  const handleExplore = (link) => {
    router.push(link);
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Explore Our Professional Services
        </h2>
        <p className="text-base text-gray-500">
          Find the right professional for your needs. Connect with trusted experts.
        </p>
      </div>

      {/* Service Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCategories.map((category, index) => (
          <Link
            key={category.id}
            href={category.exploreLink}
            onClick={(e) => {
              e.preventDefault();
              handleExplore(category.exploreLink);
            }}
            className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden hover:-translate-y-1 cursor-pointer"
          >
            <div className="p-6">
              {/* Icon and Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-green-600 transition-colors duration-300">
                  {category.icon}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                {category.name}
              </h3>
              
              {/* Services List */}
              <div className="space-y-2 mb-6">
                {category.services.slice(0, 3).map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    <span>{service}</span>
                  </div>
                ))}
                {category.services.length > 3 && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                    <span>+{category.services.length - 3} more services</span>
                  </div>
                )}
              </div>
              
              {/* Explore Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                  {category.exploreText}
                </span>
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-all group-hover:translate-x-1">
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Trust Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-xs">Secure Payments</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-xs">24/7 Support</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-xs">Verified Pros</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 10v8m12-8v8M8 18h8" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-xs">Money Back Guarantee</p>
          </div>
        </div>
      </div>
    </div>
  );
}