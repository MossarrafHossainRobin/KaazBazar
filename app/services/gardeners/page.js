// --- File: app/services/gardeners/page.js ---

"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
// Import all necessary icons, including those for the mobile header and pagination
import { Leaf, Clock, Star, Phone, MapPin, DollarSign, Search, User, ClipboardList, ChevronLeft, ChevronRight, Menu, X, ArrowUp } from "lucide-react";
import Navbar from "@/components/Navbar";

// --- Configuration & Mock Data Setup ---
const ITEMS_PER_PAGE = 20; 
const CATEGORIES = ["All", "Lawn Care", "Landscaping", "Tree Trimming", "Weeding", "Pest Control", "Hedge Cutting", "Seasonal Cleanup", "Garden Design"];
const LOCATIONS = ["Central City", "West End", "North Suburbs", "East Bay", "Downtown", "South Side"];
const NAMES = ["Alia", "Babar", "Chanda", "Dawood", "Esha", "Farooq", "Gulzar", "Hina", "Imran", "Joya"];
const MOCK_TITLES = [
    "Master Landscaper & Design Specialist", 
    "Organic Lawn & Turf Expert", 
    "Certified Arborist & Tree Care", 
    "Residential Garden Maintenance Pro", 
    "Weed & Seasonal Cleanup Specialist"
];
const IMAGE_COLORS = ["65a30d", "4d7c0f", "84cc16", "a3e635", "365314", "45781a"]; // Shades of Lime and Green

const generateMockGardeners = (count) => {
  const gardeners = [];
  for (let i = 1; i <= count; i++) {
    const nameIndex = i % NAMES.length;
    const locationIndex = i % LOCATIONS.length;
    const titleIndex = i % MOCK_TITLES.length;
    const colorIndex = i % IMAGE_COLORS.length;
    
    const basePrice = 30 + (i % 20); 
    const rating = parseFloat((4.0 + Math.random() * 0.9).toFixed(1));

    // Randomly assign 2 to 3 categories (excluding "All")
    const assignedCategories = Array.from(new Set([
        CATEGORIES[1 + Math.floor(Math.random() * (CATEGORIES.length - 1))],
        CATEGORIES[1 + Math.floor(Math.random() * (CATEGORIES.length - 1))]
    ])).slice(0, 3); 

    gardeners.push({
      id: String(500 + i), // Ensure ID is a string for consistent URL use
      name: `${NAMES[nameIndex]} Khan ${i}`,
      title: MOCK_TITLES[titleIndex],
      description: "Dedicated professional offering specialized garden and lawn maintenance services. Custom quotes available for large projects.",
      rating: rating,
      reviews: Math.floor(Math.random() * 300) + 20,
      price: basePrice + Math.floor(Math.random() * 10),
      location: LOCATIONS[locationIndex],
      categories: assignedCategories,
      imageUrl: `https://placehold.co/600x400/${IMAGE_COLORS[colorIndex]}/ffffff?text=${MOCK_TITLES[titleIndex].split(' ')[0]}`,
      profilePic: `https://placehold.co/100x100/${IMAGE_COLORS[(colorIndex + 3) % IMAGE_COLORS.length]}/ffffff?text=${NAMES[nameIndex].charAt(0)}`,
    });
  }
  return gardeners;
};

// MOCK_GARDENERS_DATA is defined but loaded via useEffect to prevent SSR/CSR mismatch
const MOCK_GARDENERS_DATA = generateMockGardeners(50); 


// --- Footer Component Placeholder (Lime/Green Theme) ---
import Footer from "@/components/Footer";

// --- Mobile-Optimized Header/Search Component (Lime/Green Theme) ---
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
                            className="w-full p-3 pl-10 border-2 border-lime-400/50 rounded-full focus:ring-lime-500 focus:border-lime-500 text-sm shadow-inner"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <a href="#" className="p-2 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"><User className="w-6 h-6" /></a>
                </div>
            </div>
            
            {/* Category Filter Bar */}
            <div className={`fixed top-16 left-0 right-0 z-30 bg-white px-4 py-2 shadow-lg transition-all duration-300 ${transitionClasses}`}>
                <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => onCategorySelect(category)}
                            className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 border-2 ${
                                selectedCategory === category
                                    ? "bg-lime-600 text-white border-lime-700 shadow-md"
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

// --- Gardener Card Component (UPDATED LINKS) ---
const GardenerCard = ({ profile }) => (
  <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.03] hover:shadow-lime-400/50 transition-all duration-300 border border-gray-100">
    
    {/* Gig Preview Image */}
    <div className="relative h-36 md:h-44 w-full">
        <img
            src={profile.imageUrl}
            alt={profile.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/4d7c0f/ffffff?text=Garden+Gig"; }}
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
                {/* Online Status Indicator (Lime Green) */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-lime-500 rounded-full ring-2 ring-white shadow-md"></div>
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
        <div className="flex items-center text-xl font-extrabold text-green-700">
          <span className="text-sm font-medium text-gray-500 mr-1">Start at</span>
          <DollarSign className="w-5 h-5 mr-1" />
          {profile.price}
        </div>
        
        {/* Dual Action Buttons: Book + Profile (Lime/Green Theme) */}
        <div className="flex space-x-2">
          <a 
            // Corrected to dynamic route: /gardeners/hire/[id]
            href={`/gardeners/hire/${profile.id}`} 
            className="px-4 py-2 bg-gradient-to-r from-lime-600 to-green-700 text-white text-sm font-bold rounded-full hover:from-lime-700 hover:to-green-800 transition-all duration-200 shadow-xl shadow-lime-300/50 flex items-center"
          >
            Book
          </a>
          <a 
            // Corrected to dynamic route: /gardeners/profile/[id]
            href={`/gardeners/profile/${profile.id}`} 
            className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 text-sm font-bold rounded-full hover:from-gray-300 hover:to-gray-400 transition-all duration-200 shadow-md flex items-center"
          >
            Profile
          </a>
        </div>
      </div>
    </div>
  </div>
);


// --- Main Directory Page Component (With Pagination and Loading) ---
export default function GardenersPage() {
  const [gardeners, setGardeners] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1); 

  // FIX: Load data on the client side only to prevent hydration mismatch
  useEffect(() => {
    // Ensure IDs are strings here to match the dynamic URL segment type
    const gardenersWithStrId = MOCK_GARDENERS_DATA.map(g => ({ ...g, id: String(g.id) }));
    setGardeners(gardenersWithStrId);
    setIsLoading(false); // Turn off loading after data is set
  }, []);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1); 
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
    setCurrentPage(1); 
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  }, []);

  // Filtering Logic
  const filteredGardeners = useMemo(() => {
    let list = gardeners;

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
    return list;
  }, [searchText, selectedCategory, gardeners]);

  // Pagination Calculations
  const totalItems = filteredGardeners.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGardeners = filteredGardeners.slice(startIndex, endIndex);

  // --- Render Pagination Controls ---
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
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
          className="p-3 border border-lime-200 rounded-xl hover:bg-lime-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-lime-600" />
        </button>
        
        {/* Render page numbers (Lime Theme) */}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-5 py-2.5 rounded-xl text-md font-bold transition-all duration-200 shadow-lg ${
              currentPage === number 
                ? 'bg-lime-600 text-white shadow-lime-400/50' 
                : 'bg-white text-gray-700 hover:bg-lime-50 hover:text-lime-700'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-3 border border-lime-200 rounded-xl hover:bg-lime-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <ChevronRight className="w-5 h-5 text-lime-600" />
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
      
      {/* Desktop Query Area: Search and Filtering Controls (Lime Theme) */}
      <div className="hidden md:block bg-white p-8 rounded-2xl shadow-3xl mx-auto max-w-7xl px-4 lg:px-8 mt-6 mb-10 border-b-8 border-lime-500/80">
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
            <Leaf className="w-10 h-10 mr-3 text-lime-600" />
            Certified Gardening Service Directory
        </h1>
        
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search by gardener name, service, or location..."
            value={searchText}
            onChange={handleSearchChange}
            className="w-full p-4 pl-12 border-4 border-lime-400/50 rounded-xl focus:ring-lime-600 focus:border-lime-600 text-lg shadow-lg transition-colors"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500" />
        </div>

        {/* Category Filters */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <ClipboardList className="w-6 h-6 mr-2 text-lime-600" />
            Quick Filters:
        </h3>
        <div className="flex flex-wrap gap-3 justify-start">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 shadow-md ${
                selectedCategory === category
                  ? "bg-lime-600 text-white border-2 border-lime-700 scale-[1.05] shadow-lime-400/50"
                  : "bg-gray-100 text-gray-700 hover:bg-lime-50 hover:text-lime-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-4">
        
        {/* Gardener Listings Count */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 px-0 sm:px-0 flex items-center pt-4">
            <span className="text-lime-600 mr-2">{totalItems}</span> Experts Found 
             <span className="text-lg font-normal text-gray-500 ml-3 hidden sm:inline">
                (Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems})
            </span>
        </h2>

        {/* Conditional Rendering Logic: Loading / Data / Empty */}
        {isLoading ? (
            // Loading State (Matching previous design)
            <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-lime-300">
                <Clock className="w-16 h-16 text-lime-500 mx-auto mb-4 animate-spin" />
                <p className="text-2xl font-semibold text-gray-800 mb-2">Finding Expert Gardeners...</p>
                <p className="text-gray-600">Please wait while we load the best matches for you.</p>
            </div>
        ) : currentGardeners.length > 0 ? (
          // Data Grid
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentGardeners.map((profile) => (
              <GardenerCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <User className="w-16 h-16 text-lime-500 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-gray-800 mb-2">No Gardeners Found</p>
            <p className="text-gray-600">Try adjusting your search query or selecting a different service category.</p>
            <button 
                onClick={() => { setSearchText(""); setSelectedCategory("All"); }}
                className="mt-4 px-6 py-2 bg-lime-600 text-white rounded-lg font-medium hover:bg-lime-700 transition-colors shadow-lg"
            >
                Reset Filters
            </button>
          </div>
        )}
        
        {/* Pagination Controls */}
        {renderPagination()}
      </main>

     <Footer />
     
      {/* Scroll to Top Button */}
      <button 
        onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        className="fixed bottom-6 right-6 p-3 bg-lime-600 text-white rounded-full shadow-xl hover:bg-lime-700 transition-opacity duration-300 z-50"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
}