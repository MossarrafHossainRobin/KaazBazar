"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Wrench,
  Zap,
  Monitor,
  MapPin,
  DollarSign,
  Star,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// --- Configuration ---
const ITEMS_PER_PAGE = 9;
const CATEGORY_KEYS = [
  "air-conditioner-repair",
  "microwave-oven-fix",
  "refrigerator-service",
  "smart-appliance-setup",
  "washing-machine-repair",
];

const LOCATIONS = [
  "Dhaka North",
  "Dhaka South",
  "Chattogram",
  "Khulna",
  "Sylhet",
  "Rajshahi",
  "Barisal",
  "Rangpur",
];
const NAMES = [
  "Ruhan",
  "Zinnia",
  "Jamil",
  "Mita",
  "Kamal",
  "Shapla",
  "Raju",
  "Nabila",
  "Omar",
  "Laila",
  "Rafiq",
  "Nazmul",
  "Sonia",
  "Fahim",
];
const IMAGE_COLORS = [
  "1e40af",
  "3b82f6",
  "2563eb",
  "60a5fa",
  "15803d",
  "ca8a04",
  "dc2626",
  "9333ea",
];

const CATEGORIES = ["All", ...CATEGORY_KEYS].map((cat) => ({
  key: cat,
  label: cat
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
}));

// --- TechnicianCard Component ---
const TechnicianCard = ({ profile }) => (
  <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 border-t-4 border-blue-600 hover:border-indigo-600">
    <div className="p-6">
      <div className="flex items-start justify-between mb-4 pb-2 border-b border-gray-50">
        <div className="flex items-center">
          <img
            src={profile.imageUrl}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover mr-4 ring-2 ring-blue-600 shadow-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/100x100/4f46e5/ffffff?text=User";
            }}
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-indigo-700 font-semibold">
              {profile.title}
            </p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center text-amber-500 font-bold text-xl">
            <Star className="w-5 h-5 mr-1 fill-amber-500" />
            {profile.rating.toFixed(1)}
          </div>
          <span className="text-xs text-gray-500">
            ({profile.reviews} verified jobs)
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 text-sm italic border-l-4 border-sky-200 pl-3">
        {profile.description}
      </p>

      <div className="flex justify-between items-center border-t border-gray-100 pt-4 mb-4">
        <div className="flex items-center text-gray-700">
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          <span className="text-sm font-medium">{profile.location}</span>
        </div>
        <div className="text-2xl font-extrabold text-blue-700 flex items-center">
          <DollarSign className="w-5 h-5 mr-1" />
          {profile.price}
          <span className="text-base font-medium text-gray-500">/hr</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {profile.categories.map((cat, i) => {
          const displayLabel = cat
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          return (
            <span
              key={i}
              className="px-3 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full flex items-center shadow-sm"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              {displayLabel}
            </span>
          );
        })}
      </div>

      <div className="flex gap-3">
        <a
          href={`/hire/${profile.id}`}
          className="flex-1 text-center py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Book Repair
        </a>
        <a
          href={`/profile/${profile.id}`}
          className="flex-1 text-center py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
        >
          View Portfolio
        </a>
      </div>
    </div>
  </div>
);

// --- Mock Generator Function ---
const generateMockTechnicians = (count) => {
  const titleMap = {
    "air-conditioner-repair": "HVAC & AC System Specialist",
    "microwave-oven-fix": "Small Appliance & Microwave Expert",
    "refrigerator-service": "Refrigeration & Freezer Master",
    "smart-appliance-setup": "Smart Home IoT Integration Tech",
    "washing-machine-repair": "Washer/Dryer Motor & Drum Repair",
  };

  const technicians = [];
  for (let i = 1; i <= count; i++) {
    const nameIndex = i % NAMES.length;
    const locationIndex = i % LOCATIONS.length;
    const colorIndex = i % IMAGE_COLORS.length;

    const numCategories = Math.floor(Math.random() * 3) + 1;
    const categories = Array.from({ length: numCategories }, () =>
      CATEGORY_KEYS[Math.floor(Math.random() * CATEGORY_KEYS.length)]
    ).filter((v, i, a) => a.indexOf(v) === i);

    const primaryCategory = categories[0] || CATEGORY_KEYS[0];
    technicians.push({
      id: 300 + i,
      name: `${NAMES[nameIndex]} Hossain ${i}`,
      title: titleMap[primaryCategory],
      description: `Expert in ${categories.join(", ").replace(/-/g, " ")}.`,
      rating: (4.0 + Math.random()).toFixed(1) * 1,
      reviews: Math.floor(Math.random() * 200) + 50,
      price: Math.floor(Math.random() * (75 - 45 + 1)) + 45,
      location: LOCATIONS[locationIndex],
      categories,
      imageUrl: `https://placehold.co/100x100/${IMAGE_COLORS[colorIndex]}/ffffff?text=${NAMES[nameIndex].charAt(0)}${i}`,
    });
  }
  return technicians;
};

// --- Main Component ---
export default function ApplianceRepairPage() {
  const [technicians, setTechnicians] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Generate mock data only after hydration
  useEffect(() => {
    setTechnicians(generateMockTechnicians(50));
  }, []);

  const handleCategorySelect = useCallback((key) => {
    setSelectedCategory(key);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredTechnicians = useMemo(() => {
    let list = technicians;
    if (selectedCategory !== "All")
      list = list.filter((t) => t.categories.includes(selectedCategory));
    if (searchText) {
      const s = searchText.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.title.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s)
      );
    }
    return list;
  }, [technicians, searchText, selectedCategory]);

  const totalItems = filteredTechnicians.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const currentTechnicians = filteredTechnicians.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow)
      startPage = Math.max(1, endPage - maxPagesToShow + 1);

    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
      <div className="flex justify-center items-center space-x-2 mt-10">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-blue-600" />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              currentPage === number
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-blue-600" />
        </button>

        <span className="ml-4 text-sm text-gray-600 hidden sm:inline">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  if (technicians.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">
        Loading technicians...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-12 text-center shadow-2xl">
        <h1 className="text-4xl font-extrabold mb-2 flex items-center justify-center">
          <Wrench className="w-10 h-10 mr-3 animate-pulse" />
          Certified Appliance Repair Services
          <Zap className="w-8 h-8 ml-3 text-yellow-300" />
        </h1>
        <p className="text-lg text-blue-200">
          Reliable technicians for your Refrigerator, AC, Washing Machine, and
          Smart Appliances.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-2xl mb-10 sticky top-0 z-10 border-b-4 border-sky-400">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by technician name, appliance, or issue..."
              value={searchText}
              onChange={handleSearchChange}
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg shadow-inner"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>

          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-blue-500" />
            Service Categories:
          </h3>
          <div className="flex flex-wrap gap-2 justify-start">
            {CATEGORIES.map((category) => (
              <button
                key={category.key}
                onClick={() => handleCategorySelect(category.key)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 shadow-md ${
                  selectedCategory === category.key
                    ? "bg-sky-500 text-white border-2 border-sky-700 scale-[1.03]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listing */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          {totalItems} Appliance Experts Found
          <span className="text-base font-normal text-gray-500 ml-3">
            (Showing {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of{" "}
            {totalItems})
          </span>
        </h2>

        {totalItems > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTechnicians.map((profile) => (
              <TechnicianCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <Wrench className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-gray-800 mb-2">
              No Technicians Found
            </p>
            <p className="text-gray-600">
              Try adjusting your search query or selecting a different service
              category.
            </p>
            <button
              onClick={() => {
                setSearchText("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {renderPagination()}
      </main>

      <Footer />
    </div>
  );
}
