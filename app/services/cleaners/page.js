"use client";
import { useState, useMemo, useCallback } from "react";
// We use standard <a> tags instead of 'next/link' for compilation in this environment.
import { Broom, Sparkles, Clock, Star, Phone, MapPin, DollarSign, Search, User, ClipboardList } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// --- Mock Data ---
const MOCK_CLEANERS = [
  {
    id: 301,
    name: "Fahima Rahman",
    title: "Deep Cleaning & Full Home Sanitization Specialist",
    description: "Highly rated for deep, comprehensive cleaning services and advanced disinfection using eco-friendly products.",
    rating: 5.0,
    reviews: 110,
    price: 40, // Starting price per hour or per small job
    location: "Dhaka Central",
    categories: ["Deep Cleaning", "Sanitization", "Residential"],
    imageUrl: "https://placehold.co/100x100/166534/ffffff?text=FR",
  },
  {
    id: 302,
    name: "Raihan Uddin",
    title: "Office and Commercial Regular Cleaning Services",
    description: "Scheduled cleaning solutions for small to medium-sized offices. Flexible hours and reliable team service.",
    rating: 4.7,
    reviews: 185,
    price: 45,
    location: "Chattogram",
    categories: ["Regular Cleaning", "Commercial", "Office"],
    imageUrl: "https://placehold.co/100x100/059669/ffffff?text=RU",
  },
  {
    id: 303,
    name: "Taslima Akter",
    title: "Move-In/Out and Post-Construction Cleanup",
    description: "Thorough cleaning tailored for properties changing tenants or after renovation projects. We leave it spotless.",
    rating: 4.9,
    reviews: 72,
    price: 55,
    location: "Khulna",
    categories: ["Move-Out", "Post-Construction", "Deep Cleaning"],
    imageUrl: "https://placehold.co/100x100/14532d/ffffff?text=TA",
  },
  {
    id: 304,
    name: "Jamil Hossain",
    title: "Carpet, Upholstery, and Sofa Cleaning Expert",
    description: "Professional steam cleaning and fabric care for carpets, rugs, sofas, and delicate upholstery items.",
    rating: 4.8,
    reviews: 99,
    price: 60,
    location: "Sylhet",
    categories: ["Carpet", "Sofa Wash", "Specialty"],
    imageUrl: "https://placehold.co/100x100/34d399/ffffff?text=JH",
  },
];

const CATEGORIES = ["All", "Deep Cleaning", "Regular Cleaning", "Move-Out", "Sanitization", "Carpet", "Commercial"];

// --- Cleaner Card Component ---
const CleanerCard = ({ profile }) => (
  <div className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 border-t-4 border-emerald-600">
    <div className="p-6">
      {/* Top Section: Profile and Rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <img
            src={profile.imageUrl}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover mr-4 ring-2 ring-emerald-600"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/1f2937/ffffff?text=User"; }}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-emerald-700 font-semibold">{profile.title}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-yellow-500 font-bold text-lg">
            <Star className="w-5 h-5 mr-1 fill-yellow-500" />
            {profile.rating.toFixed(1)}
          </div>
          <span className="text-xs text-gray-500">({profile.reviews} reviews)</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 text-sm italic border-l-4 border-gray-100 pl-3">
        {profile.description}
      </p>

      {/* Details (Location, Price) */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-4 mb-4">
        <div className="flex items-center text-gray-700">
          <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
          <span className="text-sm">{profile.location}</span>
        </div>
        <div className="text-2xl font-extrabold text-green-700 flex items-center">
          <DollarSign className="w-5 h-5" />
          {profile.price}<span className="text-base font-medium text-gray-500">/hr</span>
        </div>
      </div>

      {/* Categories/Services Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {profile.categories.map((cat, i) => (
          <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
            {cat}
          </span>
        ))}
      </div>

      {/* Action Buttons (Using <a> tags) */}
      <div className="flex gap-3">
        <a 
          href={`/hire/${profile.id}`}
          className="flex-1 text-center py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
        >
          Book Now
        </a>
        <a 
          href={`/profile/${profile.id}`}
          className="flex-1 text-center py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Profile
        </a>
      </div>
    </div>
  </div>
);

// --- Main Directory Page Component ---
export default function CleanersPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
  }, []);

  // Filtering logic to combine search text and category filter
  const filteredCleaners = useMemo(() => {
    let list = MOCK_CLEANERS;

    // 1. Filter by Category
    if (selectedCategory !== "All") {
      list = list.filter(e => e.categories.includes(selectedCategory));
    }

    // 2. Filter by Search Text
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(lowerCaseSearch) ||
        e.title.toLowerCase().includes(lowerCaseSearch) ||
        e.description.toLowerCase().includes(lowerCaseSearch)
      );
    }

    return list;
  }, [searchText, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
 <Navbar />
      <header className="bg-gradient-to-r from-green-500 to-emerald-700 text-white py-12 text-center shadow-lg">
        <h1 className="text-4xl font-extrabold mb-2">Find Your Professional Cleaner 🧹</h1>
        <p className="text-lg text-emerald-200">
          Browse and book top-rated cleaners for your home, office, and specialty needs.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Search and Filtering Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-2xl mb-10 sticky top-0 z-10 border-b-4 border-yellow-400">
          
          {/* Search Input */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by cleaner name, service, or expertise..."
              value={searchText}
              onChange={handleSearchChange}
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 text-lg shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <ClipboardList className="w-5 h-5 text-gray-500 self-center mr-2 hidden sm:inline" />
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 shadow-md ${
                  selectedCategory === category
                    ? "bg-yellow-500 text-gray-900 border-2 border-yellow-700 scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Cleaner Listings */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {filteredCleaners.length} Cleaning Gigs Found
        </h2>

        {filteredCleaners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCleaners.map((profile) => (
              <CleanerCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <User className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-gray-800 mb-2">No Cleaners Found</p>
            <p className="text-gray-600">Try adjusting your search query or selecting a different service category.</p>
            <button 
                onClick={() => { setSearchText(""); setSelectedCategory("All"); }}
                className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
                Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer CTA (Kept minimal) */}
    <Footer />
    </div>
  );
}
