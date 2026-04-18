// --- File: app/services/plumbers/page.js ---

"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
// We use standard <a> tags instead of 'next/link' for compilation in this environment.
import { Droplets, Clock, Star, Phone, MapPin, DollarSign, Search, User, ClipboardList, ChevronLeft, ChevronRight, Menu, X, ArrowUp } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

// --- Configuration ---
// Updated to show 20 profiles per page
const ITEMS_PER_PAGE = 20; 
const CATEGORIES = ["All", "Emergency", "Leak Detection", "Pipe Repair", "Drain Cleaning", "Water Heater", "Fittings", "Inspection", "Commercial", "Maintenance"];
const LOCATIONS = ["Dhaka North", "Dhaka South", "Chattogram", "Khulna", "Sylhet", "Rajshahi", "Barisal", "Rangpur"];
const NAMES = ["Tariq", "Sadia", "Karim", "Farida", "Jamil", "Rina", "Nabil", "Shapla", "Omar", "Laila", "Rafiq", "Nazmul", "Sonia", "Fahim"];
const IMAGE_COLORS = ["0891b2", "10b981", "374151", "f59e0b", "2563eb", "06b6d4", "3b82f6", "1d4ed8"];

// --- Mock Data Generation (50 Listings) ---
const generateMockPlumbers = (count) => {
  const plumbers = [];
  const BASE_GIGS = [
    { title: "24/7 Emergency Leak & Burst Pipe Repair Specialist", desc: "Rapid response for all urgent plumbing issues. Immediate pipe repairs.", cats: ["Emergency", "Pipe Repair"] },
    { title: "Drain Cleaning & Water Heater Installation Expert", desc: "Specializing in unclogging heavy drains and professional setup of water heaters.", cats: ["Drain Cleaning", "Water Heater"] },
    { title: "Bathroom & Kitchen Fitting and Fixture Replacements", desc: "High-quality installation of taps, sinks, toilets, and showers. Focus on modern fixtures.", cats: ["Fittings", "Installation"] },
    { title: "Residential and Commercial Plumbing Audits", desc: "Comprehensive plumbing system health checks, pressure testing, and preventative maintenance.", cats: ["Inspection", "Maintenance", "Commercial"] },
    { title: "Advanced Leak Detection and Water Pressure Services", desc: "Using non-invasive techniques to locate hidden leaks and calibrate water pressure.", cats: ["Leak Detection", "Pipe Repair", "Inspection"] },
  ];

  for (let i = 1; i <= count; i++) {
    const nameIndex = i % NAMES.length;
    const locationIndex = i % LOCATIONS.length;
    const colorIndex = i % IMAGE_COLORS.length;
    const baseGig = BASE_GIGS[i % BASE_GIGS.length];

    // Assign a base price plus a small random variance
    const basePrice = 50 + (i % 25); 
    
    // Randomly assign 2 to 3 categories from the base gig and general pool
    const assignedCategories = Array.from(new Set([
        ...baseGig.cats,
        CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    ])).slice(0, 3); // Limit to 3 categories

    plumbers.push({
      // Ensure ID is a string for consistent routing
      id: String(100 + i), 
      name: `${NAMES[nameIndex]} Khan ${i}`,
      title: baseGig.title,
      description: baseGig.desc,
      // Ensure rating is a number with one decimal point
      rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
      reviews: Math.floor(Math.random() * 500) + 50,
      price: basePrice + Math.floor(Math.random() * 15),
      location: LOCATIONS[locationIndex],
      categories: assignedCategories,
      // Increased resolution for a better "gig showing" mobile feel
      imageUrl: `https://placehold.co/600x400/${IMAGE_COLORS[colorIndex]}/ffffff?text=${baseGig.title.split(' ')[0]}`,
      profilePic: `https://placehold.co/100x100/${IMAGE_COLORS[(colorIndex + 4) % IMAGE_COLORS.length]}/ffffff?text=${NAMES[nameIndex].charAt(0)}`,
    });
  }
  return plumbers;
};

// MOCK_PLUMBERS is defined here, but consumed later in useEffect to prevent SSR/CSR mismatch
const MOCK_PLUMBERS = generateMockPlumbers(50); // Now 50 listings!

// --- Footer Component Placeholder ---


// --- Mobile-Optimized Header/Search Component (Fiverr-like vanishing sticky header) ---
const MobileStickyHeader = ({ searchText, onSearchChange, selectedCategory, onCategorySelect }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY < lastScrollY || window.scrollY < 50) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
            setLastScrollY(window.scrollY);
        };

        // Check for window existence before adding event listener (though 'use client' helps, this is robust)
        if (typeof window !== 'undefined') {
          window.addEventListener('scroll', handleScroll, { passive: true });
          return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [lastScrollY]);

    const transitionClasses = isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0';

    return (
        <div className="md:hidden">
            {/* Sticky Search Header */}
            <div className={`fixed top-0 left-0 right-0 z-40 bg-white p-3 transition-all duration-300 shadow-2xl ${transitionClasses}`}>
                <div className="flex items-center space-x-3">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search Gigs..."
                            value={searchText}
                            onChange={onSearchChange}
                            className="w-full p-3 pl-10 border-2 border-cyan-400/50 rounded-full focus:ring-cyan-500 focus:border-cyan-500 text-sm shadow-inner"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <a href="#" className="p-2 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"><User className="w-6 h-6" /></a>
                </div>
            </div>
            
            {/* Category Filter Bar (Below Header, also hides on scroll down) */}
            <div className={`fixed top-16 left-0 right-0 z-30 bg-white px-4 py-2 shadow-lg transition-all duration-300 ${transitionClasses}`}>
                <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => onCategorySelect(category)}
                            className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border-2 ${
                                selectedCategory === category
                                    ? "bg-cyan-600 text-white border-cyan-700 shadow-md"
                                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Spacer for fixed header/filter */}
            <div className="h-[90px]"></div>
        </div>
    );
};

// --- Plumber Card Component (Updated Links) ---
const PlumberCard = ({ profile }) => (
  <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.03] hover:shadow-cyan-400/50 transition-all duration-300 border border-gray-100">
    
    {/* Gig Preview Image */}
    <div className="relative h-36 md:h-44 w-full">
        <img
            src={profile.imageUrl}
            alt={profile.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/3b82f6/ffffff?text=Gig+Preview"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Profile Info Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center">
             <div className="relative w-8 h-8"> 
                 <img
                    src={profile.profilePic}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover ring-2 ring-white shadow-lg"
                />
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white shadow-md"></div>
             </div>
            <span className="text-white text-sm font-semibold ml-2 drop-shadow-lg">{profile.name}</span>
        </div>
    </div>

    {/* Content Area */}
    <div className="p-4">
      {/* Gig Title */}
      <h2 className="text-md font-extrabold text-gray-900 mb-2 min-h-[40px] line-clamp-2">
          {profile.title}
      </h2>

      {/* Rating & Location */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <div className="flex items-center text-yellow-600 font-bold">
          <Star className="w-4 h-4 mr-1 fill-yellow-500" />
          <span>{profile.rating.toFixed(1)}</span>
          <span className="text-gray-500 font-normal ml-1">({profile.reviews})</span>
        </div>
        <div className="flex items-center text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-xs">{profile.location}</span>
        </div>
      </div>
      
      {/* Price and Action Buttons */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-3">
        <div className="flex items-center text-xl font-extrabold text-cyan-700">
          <span className="text-sm font-medium text-gray-500 mr-1">Start at</span>
          <DollarSign className="w-5 h-5 mr-1" />
          {profile.price}
        </div>
        
        {/* Dual Action Buttons: Hire + Profile - UPDATED LINKS HERE */}
        <div className="flex space-x-2">
          <a 
            href={`/plumbers/hire/${profile.id}`} // Corrected path
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-full hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-xl shadow-green-300/50 flex items-center"
          >
            Hire
          </a>
          <a 
            href={`/plumbers/profile/${profile.id}`} // Corrected path
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-bold rounded-full hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 shadow-xl shadow-cyan-300/50 flex items-center"
          >
            Profile
          </a>
        </div>
      </div>
    </div>
  </div>
);


// --- Main Directory Page Component (With Pagination) ---
export default function PlumbersPage() {
  // FIX: Initialize plumbers as an empty array to prevent hydration mismatch 
  // because MOCK_PLUMBERS uses Math.random()
  const [plumbers, setPlumbers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1); 

  // FIX: Load the MOCK_PLUMBERS array into state only on the client side after the first render
  useEffect(() => {
    setPlumbers(MOCK_PLUMBERS);
  }, []);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset page on filter change
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reset page on search change
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Only scroll if window exists (client-side)
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  }, []);

  // Filtering Logic
  const filteredPlumbers = useMemo(() => {
    // Use the state-managed plumbers data
    let list = plumbers;

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
        e.description.toLowerCase().includes(lowerCaseSearch) ||
        e.categories.some(cat => cat.toLowerCase().includes(lowerCaseSearch))
      );
    }

    // Dependency array updated to include 'plumbers' state
    return list;
  }, [searchText, selectedCategory, plumbers]);

  // Pagination Calculations
  const totalItems = filteredPlumbers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPlumbers = filteredPlumbers.slice(startIndex, endIndex);

  // --- Render Pagination Controls ---
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    // Show up to 5 buttons in the pagination control
    const maxPagesToShow = 5; 
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-10">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-3 border border-cyan-200 rounded-xl hover:bg-cyan-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-cyan-600" />
        </button>
        
        {/* Render page numbers */}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-5 py-2.5 rounded-xl text-md font-bold transition-all duration-200 shadow-lg ${
              currentPage === number 
                ? 'bg-cyan-600 text-white shadow-cyan-400/50' 
                : 'bg-white text-gray-700 hover:bg-cyan-50 hover:text-cyan-700'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-3 border border-cyan-200 rounded-xl hover:bg-cyan-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <ChevronRight className="w-5 h-5 text-cyan-600" />
        </button>

        <span className="ml-4 text-sm text-gray-600 hidden sm:inline font-medium">
            Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
       <Navbar />
      {/* Mobile Query Area: Sticky Search and Filters */}
      <MobileStickyHeader 
        searchText={searchText} 
        onSearchChange={handleSearchChange} 
        selectedCategory={selectedCategory} 
        onCategorySelect={handleCategorySelect}
      />
      
      {/* Desktop Query Area: Search and Filtering Controls (Attractive Design) */}
      <div className="hidden md:block bg-white p-8 rounded-2xl shadow-3xl mx-auto max-w-7xl px-4 lg:px-8 mt-6 mb-10 border-b-8 border-cyan-500/80">
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
            <Droplets className="w-10 h-10 mr-3 text-cyan-600" />
            Certified Plumbing Service Directory
        </h1>
        
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search by plumber name, service, or location (e.g., Dhaka North)..."
            value={searchText}
            onChange={handleSearchChange}
            className="w-full p-4 pl-12 border-4 border-cyan-400/50 rounded-xl focus:ring-cyan-600 focus:border-cyan-600 text-lg shadow-lg transition-colors"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500" />
        </div>

        {/* Category Filters */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <ClipboardList className="w-6 h-6 mr-2 text-cyan-600" />
            Quick Filters:
        </h3>
        <div className="flex flex-wrap gap-3 justify-start">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 shadow-md ${
                selectedCategory === category
                  ? "bg-cyan-600 text-white border-2 border-cyan-700 scale-[1.05] shadow-cyan-400/50"
                  : "bg-gray-100 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-4">
       
        {/* Plumber Listings Count */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 px-0 sm:px-0 flex items-center pt-4">
            <span className="text-cyan-600 mr-2">{totalItems}</span> Experts Found 
             <span className="text-lg font-normal text-gray-500 ml-3 hidden sm:inline">
                (Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems})
            </span>
        </h2>

        {/* Plumber Listings Grid - Adjusted to 4 columns for better look and card size */}
        {currentPlumbers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentPlumbers.map((profile) => (
              <PlumberCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <User className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-gray-800 mb-2">No Plumbers Found</p>
            <p className="text-gray-600">Try adjusting your search query or selecting a different service category.</p>
            <button 
                onClick={() => { setSearchText(""); setSelectedCategory("All"); }}
                className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors shadow-lg"
            >
                Reset Filters
            </button>
          </div>
        )}
        
        {/* Pagination Controls */}
        {renderPagination()}
      </main>

      {/* Footer CTA */}
    <Footer />
      
      {/* Scroll to Top Button */}
      <button 
        onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="fixed bottom-6 right-6 p-3 bg-cyan-600 text-white rounded-full shadow-xl hover:bg-cyan-700 transition-opacity duration-300 z-50"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}