"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Droplets, Hammer, Leaf, PaintBucket, Home, Star, Clock, MapPin, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const serviceCategories = [
  {
    id: "electrician",
    name: "Electrical Services",
    icon: <Wrench className="w-8 h-8" />,
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-50",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
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
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
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
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
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
    color: "from-green-500 to-teal-500",
    bgColor: "bg-green-50",
    buttonColor: "bg-green-600 hover:bg-green-700",
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
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
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
    name: "Appliance Repair & Handyman",
    icon: <Wrench className="w-8 h-8" />,
    color: "from-red-500 to-pink-500",
    bgColor: "bg-red-50",
    buttonColor: "bg-red-600 hover:bg-red-700",
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
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-50",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
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

const popularServices = [
  {
    name: "Emergency Plumber",
    cost: "৳500-1500/hr",
    icon: "🔧",
    color: "bg-blue-100 text-blue-700",
    link: "/services/plumber"
  },
  {
    name: "Urgent Electrician",
    cost: "৳400-1200/hr",
    icon: "⚡",
    color: "bg-yellow-100 text-yellow-700",
    link: "/services/electrician"
  },
  {
    name: "Appliance Repair",
    cost: "৳400-1000/job",
    icon: "🔨",
    color: "bg-red-100 text-red-700",
    link: "/services/handyman"
  },
  {
    name: "Quick Carpentry Fix",
    cost: "৳600-2000/job",
    icon: "🪚",
    color: "bg-amber-100 text-amber-700",
    link: "/services/carpenter"
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
    <div className="space-y-12">
      {/* Explore Our Professional Services Section */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Explore Our Professional Services</h2>
          <p className="text-gray-500">Find the right professional for your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((category) => (
            <div
              key={category.id}
              className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100`}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${category.color} p-4 text-white`}>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-2">
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-lg">{category.name}</h3>
                </div>
              </div>

              {/* Services List */}
              <div className="p-4 space-y-2">
                {category.services.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-600 text-sm py-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${category.buttonColor.replace('hover:', '').replace('bg-', 'bg-')} opacity-60`}></div>
                    <span>{service}</span>
                  </div>
                ))}
              </div>

              {/* Explore Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleExplore(category.exploreLink)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-white font-medium transition-all ${category.buttonColor}`}
                >
                  <span>{category.exploreText}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Services Section */}
      <div className="bg-gray-50 rounded-2xl p-8 -mx-4 md:mx-0">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Popular Services</h2>
          <p className="text-gray-500">Quickly book trusted professionals for urgent home repairs and essential maintenance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularServices.map((service, idx) => (
            <button
              key={idx}
              onClick={() => handlePopularServiceClick(service.link)}
              className="bg-white rounded-xl p-5 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 group"
            >
              <div className={`w-14 h-14 ${service.color} rounded-full flex items-center justify-center text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{service.name}</h3>
              <p className="text-sm text-gray-500">Typical Cost: {service.cost}</p>
              <div className="mt-3 text-green-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Book Now →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}