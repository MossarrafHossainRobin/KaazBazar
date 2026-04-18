"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { 
    Search, MapPin, DollarSign, Star, Briefcase, Clock, X, ArrowUp, ChevronLeft, ChevronRight, UserCheck, Eye, ChevronDown, 
    Phone, Mail, Home, Calendar, Award, Wrench, Package, MessageSquare
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


// --- MOCK DATA FUNCTIONS ---
const GENERAL_CATEGORIES = ["Plumber", "Electrician", "Carpenter", "Cleaner", "Painter", "Handyman"];
const LOCATIONS = [
    "Dhaka", "Chittagong", "Khulna", "Sylhet", "Rajshahi", "Barisal", "Rangpur", "Comilla" 
];
const NAMES = ["Rahman", "Karim", "Sumiya", "Jahid", "Fariha", "Akash", "Tania", "Rashed", "Shuvo"];
const MOCK_TITLES = ["Certified Specialist", "Master Technician", "Reliable Local Expert", "Quick Service Pro"];
const IMAGE_COLORS = ["1f2937", "4b5563", "6b7280", "9ca3af", "374151", "111827", "4c51bf", "3f51b5"]; 

const generateMockWorkers = (count = 50) => {
  const workers = [];
  let workerId = 100;
  for (let i = 0; i < count; i++) {
    workerId++;
    const nameIndex = i % NAMES.length;
    const locationIndex = i % LOCATIONS.length;
    const categoryIndex = i % GENERAL_CATEGORIES.length;
    const colorIndex = i % IMAGE_COLORS.length;
    const rating = parseFloat((4.0 + Math.random() * 0.9).toFixed(1)); 

    workers.push({
      id: String(workerId), 
      name: `${NAMES[nameIndex]} ${workerId}`,
      title: MOCK_TITLES[workerId % MOCK_TITLES.length],
      description: `Providing expert ${GENERAL_CATEGORIES[categoryIndex]} services in the ${LOCATIONS[locationIndex]} area.`,
      rating: rating,
      reviews: Math.floor(Math.random() * 500) + 50,
      basePrice: 50 + Math.floor(Math.random() * 20),
      location: LOCATIONS[locationIndex],
      category: GENERAL_CATEGORIES[categoryIndex],
      imageUrl: `https://placehold.co/600x400/${IMAGE_COLORS[colorIndex]}/ffffff?text=${GENERAL_CATEGORIES[categoryIndex]}`,
      profilePic: `https://placehold.co/100x100/${IMAGE_COLORS[(colorIndex + 3) % IMAGE_COLORS.length]}/ffffff?text=${NAMES[nameIndex].charAt(0)}`,
      // Booking Page Details
      phone: `017xxxxxxxx${workerId % 10}`,
      email: `${NAMES[nameIndex].toLowerCase()}${workerId}@example.com`,
      experience: `${Math.floor(Math.random() * 10) + 1} Years`,
      portfolio: ["Completed 100+ projects.", "Specialized in residential repairs.", "Certified by local authority."],
      availability: "Mon-Sat, 8:00 AM - 6:00 PM",
      certifications: ["Safety Certification 2023", "Advanced Skill Diploma"],
      servicePackages: [
          { name: "Basic Checkup", price: 30, description: "Initial 1-hour diagnosis." },
          { name: "Standard Repair", price: 100, description: "Up to 3 hours of focused repair work." },
          { name: "Full System Overhaul", price: 250, description: "Complex issues and long-term fix assurance." },
      ]
    });
  }
  return workers;
};
const MOCK_WORKERS_DATA = generateMockWorkers(60); 

function getAllWorkers() { return MOCK_WORKERS_DATA; }
function getWorkerById(id) { return MOCK_WORKERS_DATA.find(worker => String(worker.id) === String(id)); }
// --- END MOCK DATA FUNCTIONS ---


// --- UI Component 1: Worker Card ---
const WorkerCard = ({ profile, onSelectWorker }) => (
  <div 
      className="bg-white rounded-2xl shadow-3xl overflow-hidden 
      transform hover:scale-[1.03] hover:shadow-blue-500/50 
      transition-all duration-300 border-t-4 border-blue-600 group"
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

        {/* Quick Action Button (Hover to Reveal) - Now links to the booking page */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button 
                onClick={(e) => { e.stopPropagation(); onSelectWorker(profile.id); }}
                className="p-2 bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center"
             >
                <Eye className="w-5 h-5" />
             </button>
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
          {profile.basePrice}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onSelectWorker(profile.id); }} 
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold rounded-full 
                     hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 
                     shadow-xl shadow-blue-300/50 flex items-center transform hover:translate-y-[-1px]"
        >
          <UserCheck className="w-4 h-4 mr-1" /> Hire Now
        </button>
      </div>
    </div>
  </div>
);

// --- UI Component 2: Pagination Controls ---
const PaginationControls = ({ totalPages, currentPage, handlePageChange }) => {
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


// --- UI Component 3: Worker Directory (Listing Page) ---
const ITEMS_PER_PAGE = 20;

const WorkerDirectory = ({ onSelectWorker }) => {
    const [workers, setWorkers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    const [currentPage, setCurrentPage] = useState(1); 

    useEffect(() => {
        setWorkers(getAllWorkers()); 
        setIsLoading(false);
    }, []);

    const availableCategories = useMemo(() => {
        if (workers.length === 0) return [];
        const categories = new Set(workers.map(w => w.category));
        return Array.from(categories).sort();
    }, [workers]);

    const handleCategoryChange = (e) => {
        setFilterCategory(e.target.value);
        setCurrentPage(1);
    };

    const handleLocationChange = (e) => {
        setFilterLocation(e.target.value);
        setCurrentPage(1);
    };

    const filteredWorkers = useMemo(() => {
        let list = workers;

        if (filterCategory) {
            const lowerCaseCat = filterCategory.toLowerCase();
            list = list.filter(w => w.category.toLowerCase() === lowerCaseCat);
        }

        if (filterLocation) {
            const lowerCaseLoc = filterLocation.toLowerCase().trim();
            list = list.filter(w => w.location.toLowerCase().includes(lowerCaseLoc)); 
        }
        
        return list;
    }, [workers, filterCategory, filterLocation]);

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
            
            {/* Filter and Search Area */}
            <div className="bg-white p-8 rounded-b-3xl shadow-3xl mx-auto max-w-7xl px-4 lg:px-8 mt-0 mb-10 border-b-8 border-blue-500/80">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
                    <Briefcase className="w-10 h-10 mr-3 text-blue-600" />
                    <span className="text-blue-600">{filterCategory || "All"}</span> Experts in {filterLocation || "Your Area"}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Category Selector */}
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
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Location Filter */}
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

                {/* Conditional Rendering Logic: Data / Empty */}
                {isLoading ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-blue-300">
                        <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
                        <p className="text-2xl font-semibold text-gray-800 mb-2">Searching for Skilled Workers...</p>
                    </div>
                ) : currentWorkers.length > 0 ? (
                    // Data Grid 
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {currentWorkers.map((profile) => (
                            <WorkerCard key={profile.id} profile={profile} onSelectWorker={onSelectWorker} />
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
                <PaginationControls totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
            </main>

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

// --- UI Component 4: Worker Hire Page ---
const WorkerHirePage = ({ workerId, onBackToDirectory }) => {
    const worker = useMemo(() => getWorkerById(workerId), [workerId]);

    const [selectedPackage, setSelectedPackage] = useState(worker?.servicePackages[0]?.name || '');
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');

    // Calculate final price based on selected package
    const finalPrice = useMemo(() => {
        const pkg = worker?.servicePackages.find(p => p.name === selectedPackage);
        return pkg ? pkg.price : worker?.basePrice || 0;
    }, [worker, selectedPackage]);


    const handleBooking = () => {
        if (bookingDate && bookingTime && selectedPackage) {
            // Placeholder for real booking logic (e.g., Firestore write)
            const msgEl = document.getElementById('booking-message');
            msgEl.textContent = `Success! You have booked ${worker.name} for ${bookingDate} at ${bookingTime}. Total: $${finalPrice}`;
            msgEl.classList.remove('hidden', 'bg-red-100', 'text-red-700');
            msgEl.classList.add('bg-green-100', 'text-green-700');
        } else {
            const msgEl = document.getElementById('booking-message');
            msgEl.textContent = 'Please select a package, date, and time to confirm your booking.';
            msgEl.classList.add('bg-red-100', 'text-red-700');
            msgEl.classList.remove('hidden', 'bg-green-100', 'text-green-700');
        }
    };

    if (!worker) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md">
                    <h2 className="text-3xl font-bold text-red-600 mb-4">Worker Not Found</h2>
                    <p className="text-gray-600 mb-6">The worker with ID: **{workerId}** could not be located.</p>
                    <button onClick={onBackToDirectory} className="flex items-center mx-auto text-blue-600 font-semibold hover:text-blue-800 transition duration-150">
                        <ChevronLeft className="w-5 h-5 mr-1" /> Back to Listings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                
                {/* Header Section */}
                <button onClick={onBackToDirectory} className="mb-6 inline-flex items-center text-gray-600 hover:text-blue-600 transition duration-150 font-medium">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Worker Listings
                </button>
                
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Hire & Book Slot for <span className="text-blue-600">{worker.name}</span></h1>
                <p className="text-xl text-gray-600 mb-8">Confirm your service package, desired date, and time.</p>

                <div id="booking-message" className="hidden p-4 mb-6 rounded-lg text-center font-semibold shadow-md"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN (Booking Form) */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. Service Package Selection */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-500">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Package className="w-7 h-7 mr-3 text-blue-600" /> 1. Choose Service Package
                            </h2>

                            <div className="space-y-4">
                                {worker.servicePackages.map((pkg, index) => (
                                    <label key={index} className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 
                                            ${selectedPackage === pkg.name ? 'border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="servicePackage"
                                            value={pkg.name}
                                            checked={selectedPackage === pkg.name}
                                            onChange={() => setSelectedPackage(pkg.name)}
                                            className="mt-1 mr-4 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <div>
                                            <div className="flex justify-between items-center w-full">
                                                <span className="text-xl font-semibold text-gray-900">{pkg.name}</span>
                                                <span className="text-2xl font-bold text-blue-700 flex items-center">
                                                    <DollarSign className="w-5 h-5 mr-1" />{pkg.price}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mt-1 text-sm">{pkg.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 2. Date and Time Selection */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-500">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Calendar className="w-7 h-7 mr-3 text-blue-600" /> 2. Select Date & Time
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        id="bookingDate"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
                                    <select
                                        id="bookingTime"
                                        value={bookingTime}
                                        onChange={(e) => setBookingTime(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select a Time</option>
                                        <option value="9:00 AM">9:00 AM - 12:00 PM</option>
                                        <option value="1:00 PM">1:00 PM - 4:00 PM</option>
                                        <option value="4:00 PM">4:00 PM - 6:00 PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Notes and Confirmation */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-blue-500">
                            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <MessageSquare className="w-7 h-7 mr-3 text-blue-600" /> 3. Special Request / Notes
                            </h2>
                            <textarea
                                placeholder="Add any specific details, special instructions, or confirm the exact address here..."
                                rows="4"
                                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                            ></textarea>
                            
                            <div className="mt-6">
                                <button 
                                    onClick={handleBooking}
                                    disabled={!bookingDate || !bookingTime || !selectedPackage}
                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white font-extrabold text-xl rounded-xl 
                                               shadow-xl shadow-green-400/50 hover:from-green-600 hover:to-teal-700 transition-all duration-300 
                                               disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
                                >
                                    Confirm Booking for ${finalPrice}
                                </button>
                            </div>
                        </div>

                    </div>
                    
                    {/* RIGHT COLUMN (Booking Summary / Worker Info) */}
                    <div className="lg:col-span-1 space-y-8">
                        
                        {/* Worker Snapshot */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-blue-500">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Worker Snapshot</h3>
                            <div className="flex items-center mb-3">
                                <img
                                    src={worker.profilePic}
                                    alt={worker.name}
                                    className="w-12 h-12 rounded-full mr-3 object-cover"
                                />
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{worker.name}</p>
                                    <span className="text-sm text-blue-600">{worker.category} Expert</span>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p className="flex items-center"><Star className="w-4 h-4 mr-2 fill-yellow-500 text-yellow-500" /> {worker.rating.toFixed(1)} Rating ({worker.reviews})</p>
                                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-blue-500" /> Serving in {worker.location}</p>
                                <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-blue-500" /> {worker.experience} Experience</p>
                            </div>
                        </div>
                        
                        {/* Summary Block */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-blue-500 sticky top-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Order Summary</h3>
                            <div className="space-y-3">
                                
                                <div className="flex justify-between border-b pb-3">
                                    <span className="text-gray-700 font-medium">Service Package:</span>
                                    <span className="font-semibold text-gray-900">{selectedPackage || 'Select Above'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-3">
                                    <span className="text-gray-700 font-medium">Booking Date:</span>
                                    <span className="font-semibold text-gray-900">{bookingDate || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-3">
                                    <span className="text-gray-700 font-medium">Time Slot:</span>
                                    <span className="font-semibold text-gray-900">{bookingTime || 'N/A'}</span>
                                </div>
                                
                                <div className="flex justify-between pt-4">
                                    <span className="text-2xl font-extrabold text-gray-900">Total Price:</span>
                                    <span className="text-3xl font-extrabold text-green-600 flex items-center">
                                        <DollarSign className="w-6 h-6 mr-1" />
                                        {finalPrice}
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


// --- Main App Container (Highest Level Component) ---
export default function App() {
    // State to manage navigation: 'directory' or 'hire'
    const [page, setPage] = useState('directory'); 
    const [selectedWorkerId, setSelectedWorkerId] = useState(null);

    const handleSelectWorker = (id) => {
        setSelectedWorkerId(id);
        setPage('hire');
    };

    const handleBackToDirectory = () => {
        setSelectedWorkerId(null);
        setPage('directory');
    };

    return (
        <div className="font-sans min-h-screen bg-gray-50">
           <Navbar />
            <main>
                {page === 'directory' ? (
                    <WorkerDirectory onSelectWorker={handleSelectWorker} />
                ) : (
                    <WorkerHirePage workerId={selectedWorkerId} onBackToDirectory={handleBackToDirectory} />
                )}
            </main>
            <Footer />
        </div>
    );
}