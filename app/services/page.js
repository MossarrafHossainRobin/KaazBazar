"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Zap, Droplets, Hammer, Wrench, Home, Leaf, TrendingUp } from "lucide-react";

const ServicesPage = () => {
  const categories = [
    { name: "Electricians", icon: <Zap className="w-8 h-8" />, description: "Wiring, repairs, installations & lighting.", color: "bg-indigo-600", href: "/services/electricians" },
    { name: "Plumbers", icon: <Droplets className="w-8 h-8" />, description: "Leaks, pipe repairs, fixture installation, and drainage.", color: "bg-cyan-600", href: "/services/plumbers" },
    { name: "Carpenters", icon: <Hammer className="w-8 h-8" />, description: "Custom furniture, repair, and precision woodworking.", color: "bg-amber-600", href: "/services/carpenters" },
    { name: "Appliance Repair", icon: <Wrench className="w-8 h-8" />, description: "Washer, fridge, oven, and HVAC service experts.", color: "bg-rose-600", href: "/services/appliance-repair" },
    // Replaced Broom with Home as a stand-in for cleaning.
    { name: "Cleaners", icon: <Home className="w-8 h-8" />, description: "Deep cleaning, regular service, and janitorial staff.", color: "bg-emerald-600", href: "/services/cleaners" },
    { name: "Gardeners", icon: <Leaf className="w-8 h-8" />, description: "Landscaping, trimming, and expert lawn care services.", color: "bg-lime-600", href: "/services/gardeners" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Mock Navbar (Styling only) */}
      <Navbar />

      {/* Hero Section */}
      <div className="py-20 md:py-32 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-gray-900">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">Right Talent</span> for Any Job
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            From emergency repairs to complex renovations, connect with **certified local professionals** in minutes.
          </p>
          <div className="mt-10">
            <a href="/post-job" className="px-10 py-3 rounded-xl text-lg font-bold text-gray-900 shadow-xl transition-all transform hover:scale-[1.02] bg-yellow-400 hover:bg-yellow-500">
              Post Your Job Request
            </a>
          </div>
        </div>
      </div>

      {/* Categories Grid (Main Content) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900">
          Popular Service Categories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, index) => (
            <a
              key={index}
              href={cat.href}
              // The entire card is now the anchor link
              className={`block bg-white p-8 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-t-4 ${cat.color} hover:border-yellow-500 group relative overflow-hidden`}
            >
              {/* Animated background on hover */}
              <div className={`absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-10 ${cat.color}`}></div>
              
              <div className={`text-white w-14 h-14 mb-4 p-3 rounded-xl ${cat.color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                {cat.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-indigo-700 transition-colors">{cat.name}</h3>
              <p className="text-gray-600 text-base mb-4">{cat.description}</p>
              
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 group-hover:text-yellow-600 transition-colors">
                Explore Talent <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <StatBlock count="15K+" label="Jobs Completed" />
            <StatBlock count="5K+" label="Vetted Professionals" />
            <StatBlock count="4.9/5" label="Average Rating" />
          </div>
        </div>
      </div>

      {/* Mock Footer (Styling only) */}
      <Footer />
    </div>
  );
};

const StatBlock = ({ count, label }) => (
  <div className="p-4">
    <p className="text-5xl font-extrabold mb-2 text-yellow-400">{count}</p>
    <p className="text-xl font-medium text-gray-200 uppercase tracking-wider">{label}</p>
  </div>
);

export default ServicesPage;
