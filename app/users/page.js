// File: app/users/page.js 

"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
// Components are now directly imported and used below.
import Navbar from '@/components/Navbar'; 
import Footer from '@/components/Footer'; 


import { getAllWorkers } from '@/app/data/workers'; 
// 👇 FIX: Added ChevronDown to the import list
import { Search, MapPin, DollarSign, Star, Briefcase, Clock, X, ArrowUp, ChevronLeft, ChevronRight, UserCheck, Eye, ChevronDown } from "lucide-react";

const ITEMS_PER_PAGE = 20;

// --- Mock Data Locations (64 Districts of Bangladesh) ---
// This list is now comprehensive and should be used to generate your mock data 
// in '@/app/data/workers'.
const ALL_64_DISTRICTS = [
    "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria", 
    "Chandpur", "Chapai Nawabganj", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", 
    "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", 
    "Habiganj", "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", 
    "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", 
    "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", 
    "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", 
    "Natore", "Netrakona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", 
    "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", 
    "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", 
    "Tangail", "Thakurgaon"
];


// --- Worker Card Component (Attractive Design) ---
const WorkerCard = ({ profile }) => (
  <div className="bg-white rounded-2xl shadow-3xl overflow-hidden 
      transform hover:scale-[1.03] hover:shadow-blue-500/50 
      transition-all duration-300 border-t-4 border-blue-600 cursor-pointer group"
      onClick={() => { if (typeof window !== 'undefined') window.location.href = `/workers/profile/${profile.id}`; }}
  >
    
    {/* Gig Preview Image & Overlay */}
    <div className="relative h-40 w-full">
        <img
            src={profile.imageUrl}
            alt={profile.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1f2937/ffffff?text=Gig"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Profile Info Overlay (Shadowed Photo) */}
        <div className="absolute bottom-[-20px] left-4 flex items-center">
             <div className="relative w-16 h-16"> 
                 <img
                    src={profile.profilePic}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover ring-4 ring-white shadow-xl shadow-blue-500/50" 
                />
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white shadow-md"></div>
             </div>
        </div>

        {/* Quick Action Button (Hover to Reveal) */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <a 
                href={`/workers/profile/${profile.id}`}
                className="p-2 bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center"
                onClick={(e) => e.stopPropagation()} 
             >
                <Eye className="w-5 h-5" />
             </a>
        </div>
    </div>

    {/* Content Area */}
    <div className="p-4 pt-8"> 
      {/* Name and Category Badge */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xl font-bold text-gray-900 line-clamp-1">{profile.name}</span>
        <span className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-full flex items-center shadow-md">
            <Briefcase className="w-3 h-3 mr-1" />
            {profile.category}
        </span>
      </div>

      {/* Gig Title */}
      <h3 className="text-sm font-semibold text-gray-600 mb-3 min-h-[36px] line-clamp-2">
          {profile.title}
      </h3>

      {/* Rating & Location */}
      <div className="flex justify-between items-center mb-3 text-sm border-b pb-3 border-gray-100">
        <div className="flex items-center text-yellow-600 font-bold">
          <Star className="w-4 h-4 mr-1 fill-yellow-500" />
          <span>{profile.rating.toFixed(1)}</span>
          <span className="text-gray-500 font-normal ml-1 text-xs">({profile.reviews} reviews)</span>
        </div>
        <div className="flex items-center text-gray-500">
            <MapPin className="w-4 h-4 mr-1 text-blue-500" />
            <span className="text-xs font-semibold text-gray-700">{profile.location}</span>
        </div>
      </div>
      
      {/* Price and Action Buttons */}
      <div className="flex justify-between items-center pt-3">
        <div className="flex items-center text-2xl font-extrabold text-blue-700">
          <span className="text-sm font-medium text-gray-500 mr-1">Starts at</span>
          <DollarSign className="w-5 h-5 mr-1" />
          {profile.price}
        </div>
        
        <a 
          href={`/workers/hire/${profile.id}`} 
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold rounded-full 
                     hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 
                     shadow-xl shadow-blue-300/50 flex items-center transform hover:translate-y-[-1px]"
          onClick={(e) => e.stopPropagation()} 
        >
          <UserCheck className="w-4 h-4 mr-1" /> Hire Now
        </a>
      </div>
    </div>
  </div>
);


// --- Pagination Component ---
const renderPagination = ({ totalPages, currentPage, handlePageChange }) => {
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
          className="p-3 border border-blue-200 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-blue-600" />
        </button>
        
        {/* Render page numbers */}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`px-5 py-2.5 rounded-xl text-md font-bold transition-all duration-200 shadow-lg ${
              currentPage === number 
                ? 'bg-blue-600 text-white shadow-blue-400/50' 
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-3 border border-blue-200 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <ChevronRight className="w-5 h-5 text-blue-600" />
        </button>

        <span className="ml-4 text-sm text-gray-600 hidden sm:inline font-medium">
            Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };


// --- Main Directory Page Component ---
export default function WorkersPage() {
    const [workers, setWorkers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    const [currentPage, setCurrentPage] = useState(1); 

    // 1. Initial Data Loading and URL Parameter Reading
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const category = params.get('service') || "";
            const location = params.get('location') || "";
            
            setFilterCategory(category);
            setFilterLocation(location);
        }
        
        // Simulating data load (assuming getAllWorkers covers all 64 districts)
        setWorkers(getAllWorkers()); 
        setIsLoading(false);
    }, []);

    // 1.1 Extract unique categories from all workers for the dropdown
    const availableCategories = useMemo(() => {
        if (workers.length === 0) return [];
        const categories = new Set(workers.map(w => w.category));
        return Array.from(categories).sort();
    }, [workers]);


    // 2. Filter Handlers
    const handleCategoryChange = (e) => {
        setFilterCategory(e.target.value);
        setCurrentPage(1);
    };

    const handleLocationChange = (e) => {
        setFilterLocation(e.target.value);
        setCurrentPage(1);
    };

    // 3. Filtering Logic based on URL/State
    const filteredWorkers = useMemo(() => {
        let list = workers;

        if (filterCategory) {
            const lowerCaseCat = filterCategory.toLowerCase();
            list = list.filter(w => w.category.toLowerCase() === lowerCaseCat);
        }

        // Filter works across all 64 districts if present in the mock data
        if (filterLocation) {
            const lowerCaseLoc = filterLocation.toLowerCase().trim();
            list = list.filter(w => w.location.toLowerCase().includes(lowerCaseLoc)); 
        }
        
        return list;
    }, [workers, filterCategory, filterLocation]);

    // 4. Pagination Logic
    const totalItems = filteredWorkers.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentWorkers = filteredWorkers.slice(startIndex, endIndex);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            
            {/* Navbar component */}
            <Navbar />
            
            {/* Desktop Query Area: Filters 🎚️ */}
            <div className="bg-white p-8 rounded-b-3xl shadow-3xl mx-auto max-w-7xl px-4 lg:px-8 mt-0 mb-10 border-b-8 border-blue-500/80">
                
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
                    <Briefcase className="w-10 h-10 mr-3 text-blue-600" />
                    <span className="text-blue-600">{filterCategory || "All"}</span> Experts in {filterLocation || "Your Area"}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Category Selector (New Dropdown) */}
                    <div className="relative">
                        <select
                            value={filterCategory}
                            onChange={handleCategoryChange}
                            className={`w-full p-3 pl-12 border-2 rounded-xl text-lg shadow-inner appearance-none transition-colors 
                                ${filterCategory ? 'border-blue-500/80 bg-white text-gray-900' : 'border-gray-300 bg-gray-50 text-gray-600'}`}
                        >
                            <option value="">Select a Service Category</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500" />
                        {/* 👇 FIX APPLIED HERE */}
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Location Filter (Editable Input) */}
                    <div className="relative md:col-span-2">
                        <input
                            type="text"
                            placeholder={`Refine location (e.g., Dhaka, Chattogram)`}
                            value={filterLocation}
                            onChange={handleLocationChange}
                            className="w-full p-3 pl-12 border-2 border-blue-400/50 rounded-xl focus:ring-blue-600 focus:border-blue-600 text-lg shadow-inner transition-colors"
                        />
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                </div>

                <button 
                    onClick={() => { setFilterCategory(""); setFilterLocation(""); setCurrentPage(1); }}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center font-medium"
                >
                    <X className="w-4 h-4 mr-1" /> Clear All Filters
                </button>
            </div>
            
            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-4">
                
                {/* Worker Listings Count */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center pt-4">
                    <span className="text-blue-600 mr-2">{totalItems}</span> Experts Available 
                    <span className="text-lg font-normal text-gray-500 ml-3 hidden sm:inline">
                         (Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems})
                    </span>
                </h2>

                {/* Conditional Rendering Logic: Loading / Data / Empty */}
                {isLoading ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-blue-300">
                        <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
                        <p className="text-2xl font-semibold text-gray-800 mb-2">Searching for Skilled Workers...</p>
                    </div>
                ) : currentWorkers.length > 0 ? (
                    // Data Grid 
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {currentWorkers.map((profile) => (
                            <WorkerCard key={profile.id} profile={profile} />
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                        <Search className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <p className="text-2xl font-semibold text-gray-800 mb-2">No Workers Found</p>
                        <p className="text-gray-600">Try broadening your search or checking spelling for **{filterCategory}** in **{filterLocation}**.</p>
                        <button 
                            onClick={() => { setFilterCategory(""); setFilterLocation(""); }}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
                        >
                            View All Workers
                        </button>
                    </div>
                )}
                
                {/* Pagination Controls */}
                {renderPagination({ totalPages, currentPage, handlePageChange })}
            </main>

           {/* Footer component */}
           <Footer /> 
            
            {/* Scroll to Top Button */}
            <button 
                onClick={() => { if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-opacity duration-300 z-50"
            >
                <ArrowUp className="w-6 h-6" />
            </button>
        </div>
    );
}