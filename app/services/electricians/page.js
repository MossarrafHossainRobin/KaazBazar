// File: app/services/electricians/page.js
"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Zap,
  Star,
  MapPin,
  DollarSign,
  Search,
  User,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// --- Mock Data ---
const MOCK_ELECTRICIANS = [
  {
    id: "101",
    name: "Ayesha Rahman",
    title: "Certified Residential Wiring Specialist",
    description: "Expert in safe home rewiring, distribution board upgrades, and fault detection. Highly reliable and on time.",
    rating: 5.0,
    reviews: 155,
    price: 50,
    location: "Dhaka Central",
    categories: ["Rewiring", "Fault Fix", "Residential"],
    imageUrl: "https://placehold.co/100x100/1e3a8a/ffffff?text=AR",
  },
  {
    id: "102",
    name: "Tanvir Alam",
    title: "Smart Lighting & Appliance Installation Expert",
    description: "Specializing in recessed, ambient, and smart home lighting systems. *Your perfect light setup is guaranteed.*",
    rating: 4.8,
    reviews: 210,
    price: 45,
    location: "Chattogram",
    categories: ["Lighting", "Installation", "Smart Home"],
    imageUrl: "https://placehold.co/100x100/1d4ed8/ffffff?text=TA",
  },
  {
    id: "103",
    name: "Mita Hasan",
    title: "Emergency 24/7 Electrical Repairs & Maintenance",
    description: "Fast response for tripped breakers, faulty outlets, and emergency power issues. Available day or night.",
    rating: 4.9,
    reviews: 95,
    price: 60,
    location: "Khulna",
    categories: ["Emergency", "Repairs", "Fault Fix"],
    imageUrl: "https://placehold.co/100x100/3b82f6/ffffff?text=MH",
  },
  {
    id: "104",
    name: "Jasim Uddin",
    title: "Commercial & Industrial Electrical Services",
    description: "Experienced in large-scale commercial wiring, high-capacity switchgear, and routine safety inspections.",
    rating: 4.7,
    reviews: 63,
    price: 75,
    location: "Sylhet",
    categories: ["Commercial", "Rewiring", "Safety Inspection"],
    imageUrl: "https://placehold.co/100x100/60a5fa/ffffff?text=JU",
  },
];

const CATEGORIES = ["All", "Rewiring", "Lighting", "Repairs", "Installation", "Safety Inspection", "Emergency", "Commercial"];

// --- Electrician Card ---
const ElectricianCard = ({ profile }) => {
  const { id, name, title, description, rating, reviews, price, location, categories, imageUrl } = profile;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 border-t-4 border-indigo-600">
      <div className="p-6 flex flex-col justify-between h-full">

        {/* Profile & Rating */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <img
              src={imageUrl}
              alt={`${name}'s profile`}
              className="w-16 h-16 rounded-full object-cover mr-4 ring-2 ring-indigo-600/70"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/1f2937/ffffff?text=User"; }}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{name}</h2>
              <p className="text-sm text-indigo-700 font-semibold">{title}</p>
            </div>
          </div>
          <div className="text-right ml-4 flex flex-col items-end">
            <div className="flex items-center text-yellow-500 font-bold text-lg">
              <Star className="w-5 h-5 mr-1 fill-yellow-500" />
              {rating.toFixed(1)}
            </div>
            <span className="text-xs text-gray-500">({reviews} reviews)</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm italic border-l-4 border-gray-100 pl-3">{description}</p>

        {/* Location & Price */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-4 mb-4">
          <div className="flex items-center text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-indigo-600" />
            <span className="text-sm font-medium">{location}</span>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 flex items-center">
            <DollarSign className="w-5 h-5 mr-0.5" />
            {price}<span className="text-base font-medium text-gray-500">/hr</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat, i) => (
            <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full shadow-sm">{cat}</span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <a href={`/electricians/hire/${id}`} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center">
            <Zap className="w-5 h-5 mr-2" /> Book Now
          </a>
          <a href={`/electricians/profile/${id}`} className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 flex justify-center items-center">
            View Profile <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---
export default function ElectriciansPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleCategorySelect = useCallback((cat) => setSelectedCategory(cat), []);
  const handleSearchChange = useCallback((e) => setSearchText(e.target.value), []);

  const filteredElectricians = useMemo(() => {
    let list = MOCK_ELECTRICIANS;
    if (selectedCategory !== "All") list = list.filter(e => e.categories.includes(selectedCategory));
    if (searchText) {
      const q = searchText.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    return list.sort((a,b)=>b.rating-a.rating);
  }, [searchText, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-12 text-center shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-2">Certified Electricians Near You ⚡</h1>
        <p className="text-lg text-indigo-200">Browse top-rated electricians for home repairs, wiring, and smart installations.</p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Search & Filter */}
        <div className="bg-white p-6 rounded-2xl shadow-2xl mb-10 sticky top-4 z-10 border-b-4 border-yellow-400">
          <div className="relative mb-6">
            <input type="text" placeholder="Search by electrician name, service, or specialty..." value={searchText} onChange={handleSearchChange}
              className="w-full p-4 pl-12 border-2 border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-lg shadow-inner" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <ClipboardList className="w-5 h-5 text-gray-500 self-center mr-2 hidden sm:inline" />
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={()=>handleCategorySelect(cat)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 shadow-md ${
                  selectedCategory===cat?"bg-yellow-500 text-gray-900 border-2 border-yellow-700 scale-105":"bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Electrician Listings */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">{filteredElectricians.length} Electrical Gigs Found</h2>
        {filteredElectricians.length>0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredElectricians.map(profile=><ElectricianCard key={profile.id} profile={profile} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <User className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-gray-800 mb-2">No Electricians Found</p>
            <p className="text-gray-600">Try adjusting your search query or selecting a different service category.</p>
            <button onClick={()=>{ setSearchText(""); setSelectedCategory("All"); }}
              className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md">
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
