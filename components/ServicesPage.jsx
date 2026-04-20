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
  ArrowRight,
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
    exploreText: "Explore Electricians",
    stat: "120+ Professionals"
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
    exploreText: "Explore Plumbers",
    stat: "95+ Professionals"
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
    exploreText: "Explore Carpenters",
    stat: "80+ Professionals"
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
    exploreText: "Explore Cleaners",
    stat: "110+ Professionals"
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
    exploreText: "Explore Painters",
    stat: "70+ Professionals"
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
    exploreText: "Explore Handymen",
    stat: "100+ Professionals"
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
    exploreText: "Explore Gardeners",
    stat: "65+ Professionals"
  }
];

const popularServices = [
  {
    name: "Emergency Plumber",
    cost: "৳500-1500/hr",
    icon: "🔧",
    link: "/services/plumber",
    description: "24/7 emergency service"
  },
  {
    name: "Urgent Electrician",
    cost: "৳400-1200/hr",
    icon: "⚡",
    link: "/services/electrician",
    description: "Same-day repair"
  },
  {
    name: "Appliance Repair",
    cost: "৳400-1000/job",
    icon: "🔨",
    link: "/services/handyman",
    description: "Quick diagnostics"
  },
  {
    name: "Quick Carpentry",
    cost: "৳600-2000/job",
    icon: "🪚",
    link: "/services/carpenter",
    description: "Fast furniture repair"
  }
];

export default function ServicesPage({ currentUser, onShowLogin }) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleExplore = (link) => {
    if (!currentUser) {
      onShowLogin();
    } else {
      router.push(link);
    }
  };

  const handlePopularServiceClick = (link) => {
    if (!currentUser) {
      onShowLogin();
    } else {
      router.push(link);
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-gray-700" />
          <span className="text-sm text-gray-700">Trusted by 10,000+ customers</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Explore Our Professional Services
        </h2>
        <p className="text-lg text-gray-500">
          Find the right professional for your needs. Connect with trusted experts.
        </p>
      </div>

      {/* Service Categories Grid - Full Card Links */}
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
                <div className="text-right">
                  <p className="text-xs text-gray-400">{category.stat}</p>
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

      {/* Popular Services Section */}
      <div className="bg-gray-50 rounded-3xl py-12 px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Popular Services</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Quickly book trusted professionals for urgent home repairs and maintenance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularServices.map((service, idx) => (
            <button
              key={idx}
              onClick={() => handlePopularServiceClick(service.link)}
              className="group bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-200 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:bg-green-600 group-hover:scale-110 transition-all duration-300">
                <span className="group-hover:text-white transition-colors">{service.icon}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{service.description}</p>
              <p className="text-sm font-semibold text-gray-800 mb-3">{service.cost}</p>
              <div className="inline-flex items-center gap-1 text-sm font-medium text-green-600 group-hover:text-green-700">
                Book Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trust Section - Black/White/Green */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-100 transition">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-sm">Secure Payments</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-sm">24/7 Support</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-sm">Verified Pros</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 10v8m12-8v8M8 18h8" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-sm">Money Back</p>
          </div>
        </div>
      </div>
    </div>
  );
}