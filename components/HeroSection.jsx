// File: app/components/HeroSection.js 

import React, { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, ChevronDown, CheckCircle, XCircle, Globe } from "lucide-react";

// --- Mock Data Locations (64 Districts of Bangladesh) ---
// This list is needed here to provide suggestions
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


export default function HeroSection({ showPage }) {
  const [service, setService] = useState("");
  const [location, setLocation] = useState(""); 
  const [error, setError] = useState(null); 
  
  const [isTracking, setIsTracking] = useState(false);
  const [autoLocated, setAutoLocated] = useState(false); 
  const [locationTrackingError, setLocationTrackingError] = useState(null);
  
  // --- Suggestion State ---
  const [suggestions, setSuggestions] = useState([]);

  const services = [
    "Plumber",
    "Electrician",
    "Carpenter",
    "Cleaner",
    "Painter",
    "Handyman",
  ];
  
  // Function to get the user's location using the browser API
  const trackUserLocation = (isAuto = false) => {
    if (!navigator.geolocation) {
      setLocationTrackingError("Geolocation is not supported by your browser.");
      return;
    }

    setIsTracking(true);
    setLocationTrackingError(null);
    setAutoLocated(false); 
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsTracking(false);
        const mockDistrict = "Dhaka"; 
        
        setLocation(mockDistrict); 
        setAutoLocated(isAuto); 
        
        setLocationTrackingError(null);
      },
      (err) => {
        setIsTracking(false);
        let errorMsg = "Could not track location.";
        if (err.code === err.PERMISSION_DENIED) {
            errorMsg = "Location access denied. Please allow location access in your browser settings.";
        } else if (err.code === err.TIMEOUT) {
            errorMsg = "Location request timed out. Try again.";
        }
        setLocationTrackingError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };
  
  // Auto-track location on component mount
  useEffect(() => {
    if (location === "") {
        trackUserLocation(true); 
    }
  }, []); 

  // Location Input Handler for Suggestions
  const handleLocationInput = (value) => {
    handleInputChange(setLocation, value); // Update location state
    
    if (value.trim().length > 1) {
      const filteredSuggestions = ALL_64_DISTRICTS
        .filter(district => district.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5); // Show top 5 suggestions
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]); // Clear suggestions if input is too short
    }
  };
  
  // Select Suggestion Handler
  const selectSuggestion = (selectedLocation) => {
    setLocation(selectedLocation);
    setSuggestions([]); // Clear suggestions after selection
    setAutoLocated(false); // User selection overrides auto-location
    if (error) setError(null);
  };


  const performHeroSearch = () => {
    setError(null);
    setSuggestions([]); // Clear any open suggestions on search
    
    const finalLocation = location.trim();

    if (!service.trim() || service === "") {
      setError("Please select a service category.");
      return;
    }
    
    if (!finalLocation) {
      setError("Please enter your location or wait for auto-location.");
      return;
    }

    if (typeof window !== 'undefined') {
        const params = new URLSearchParams();
        params.set('service', service);
        params.set('location', finalLocation); 
        
        window.location.href = `/users?${params.toString()}`;
        
    } else {
        showPage("users"); 
    }
  };

  const handleInputChange = (setter, value) => {
    setter(value);
    
    if (setter === setLocation) {
        setAutoLocated(false);
    }
    
    if (error) setError(null);
  };

  return (
    <section className="relative text-white py-24 sm:py-28 md:py-32 overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-900 w-full">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-pink-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-32 -right-24 w-[28rem] h-[28rem] bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-48 right-10 w-64 h-64 bg-yellow-300/10 rounded-full blur-2xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Section: Title and Search */}
          <div className="space-y-8">
            
            {/* Active Workers Tag */}
            <div className="inline-flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-medium">
                10,000+ Active Workers
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Find Skilled <br />
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Workers Fast
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl max-w-xl text-blue-100 leading-relaxed">
              Connect with verified professionals across Bangladesh. Book
              instantly, pay securely, and get quality service guaranteed.
            </p>

            {/* Search Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg">
              {/* Search Inputs (Responsive Grid/Stack) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                {/* Service Selector */}
                <select
                  value={service}
                  onChange={(e) => handleInputChange(setService, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-0 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 md:col-span-1"
                >
                  <option value="">Select Service</option>
                  {services.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Location Input with Suggestions */}
                <div className="relative md:col-span-2 z-10">
                    <input
                        type="text"
                        placeholder="Enter Location (e.g., Dhaka)"
                        value={location}
                        onChange={(e) => handleLocationInput(e.target.value)} 
                        className="w-full pl-4 pr-16 py-3 rounded-xl border-0 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    {/* Location Pin Icon */}
                    <MapPin className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    
                    {/* Suggestions Dropdown */}
                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                            {suggestions.map((district) => (
                                <div
                                    key={district}
                                    onClick={() => selectSuggestion(district)}
                                    className="px-4 py-2 text-gray-800 cursor-pointer hover:bg-blue-50 flex items-center transition-colors"
                                >
                                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                                    {district}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>
              
              {/* Search Button and Near Me Row */}
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    {/* Find Near Me Button (for retry) */}
                    <button
                        onClick={() => trackUserLocation(false)} 
                        disabled={isTracking}
                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center text-sm ${
                            isTracking ? 'bg-blue-300 text-blue-800 cursor-not-allowed' : 'bg-blue-400 text-white hover:bg-blue-500'
                        }`}
                    >
                        <Globe className={`w-4 h-4 mr-2 ${isTracking ? 'animate-spin' : ''}`} />
                        {isTracking ? 'Tracking...' : 'Retry Location'}
                    </button>

                    {/* Submit Button */}
                    <button
                        onClick={performHeroSearch}
                        className="flex-grow bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-all duration-300 transform hover:scale-[1.01] shadow-lg flex items-center justify-center"
                    >
                        <Search className="w-5 h-5 mr-2" /> Search Workers
                    </button>
              </div>

              {/* Internal Error Message Box */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-sm font-medium">
                  <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
              
              {/* Geolocation Feedback / Recommendation Section */}
              {locationTrackingError && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-sm font-medium">
                      <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      {locationTrackingError}
                  </div>
              )}

              {autoLocated && !isTracking && !locationTrackingError && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center text-sm font-medium">
                      <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-green-500" />
                    Local Experts Await! Since you're in {location}, Choose a service and we'll instantly match you with the best professionals in your area.
                  </div>
              )}
              
            </div>

            {/* CTA Buttons (Responsive Flex) */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => showPage("services")}
                className="bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-all"
              >
                Explore Services
              </button>
              <button
                onClick={() => showPage("workerSignup")}
                className="bg-white/20 border border-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-all"
              >
                Join as Worker
              </button>
              <button
                onClick={() => showPage("userSignup")}
                className="bg-white/20 border border-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-all"
              >
                User Registration
              </button>
              <button
                onClick={() => showPage("login")}
                className="bg-white/20 border border-white/30 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/30 transition-all"
              >
                Login
              </button>
            </div>
          </div>

          {/* Right Section (Stats) - Responsive Grid */}
          <div className="grid grid-cols-2 gap-4 mt-12 lg:mt-0">
            {[
              { label: "Happy Customers", value: "50K+" },
              { label: "Jobs Completed", value: "100K+" },
              { label: "Average Rating", value: "4.9★" },
              { label: "Support", value: "24/7" },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-effect rounded-2xl p-6 text-center shadow-lg bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
              >
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {item.value}
                </div>
                <div className="text-sm text-blue-200">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}