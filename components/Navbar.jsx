"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, User, LogOut, Menu, X, Briefcase, MessageCircle, Home, Globe, ChevronDown, Sparkles, TrendingUp, Award, XCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar({ currentUser, onLogout, onShowLogin, searchQuery, setSearchQuery }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const searchRef = useRef(null);
  const { language, toggleLanguage, t } = useLanguage();

  // Service Categories Data
  const serviceCategories = [
    {
      name: "Electrical Services",
      icon: "⚡",
      services: ["Wiring & rewiring", "Fan & light installation", "Switch & socket repair", "Electrical troubleshooting"],
      exploreLink: "/services/electrician",
    },
    {
      name: "Plumbing Services",
      icon: "🔧",
      services: ["Pipe repair & installation", "Bathroom fitting", "Water heater service", "Drain cleaning"],
      exploreLink: "/services/plumber",
    },
    {
      name: "Carpentry Services",
      icon: "🪚",
      services: ["Furniture repair", "Custom woodwork", "Door & window fitting", "Kitchen cabinet installation"],
      exploreLink: "/services/carpenter",
    },
    {
      name: "Cleaning Services",
      icon: "🧹",
      services: ["Deep house cleaning", "Office cleaning", "Post-construction cleanup", "Regular maintenance"],
      exploreLink: "/services/cleaner",
    },
    {
      name: "Painting Services",
      icon: "🎨",
      services: ["Interior & exterior painting", "Wall texture work", "Color consultation", "Waterproofing solutions"],
      exploreLink: "/services/painter",
    },
    {
      name: "Appliance Repair & Handyman",
      icon: "🔨",
      services: ["Appliance diagnostics & repair", "Furniture assembly", "General home maintenance", "Emergency repairs"],
      exploreLink: "/services/handyman",
    },
    {
      name: "Gardening Services",
      icon: "🌿",
      services: ["Lawn mowing & maintenance", "Tree & shrub care", "Planting & landscaping", "Garden cleanup"],
      exploreLink: "/services/gardener",
    }
  ];

  const filteredServices = searchQuery 
    ? serviceCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : serviceCategories;

  // Handle scroll event to show/hide search bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
        setShowSearchBar(true);
      } else {
        setIsScrolled(false);
        setShowSearchBar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowServiceSuggestions(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`bg-white sticky top-0 z-50 transition-all duration-500 ${isScrolled ? 'shadow-md border-b-0' : 'border-b border-gray-200'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 md:py-0">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="relative group">
              <span className="text-2xl md:text-3xl font-bold text-black group-hover:text-gray-700 transition-colors duration-300">
                Kaazbazar
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Search Bar with Service Suggestions */}
          <div ref={searchRef} className={`hidden md:block flex-1 max-w-2xl mx-8 transition-all duration-700 transform ${showSearchBar ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}`}>
            <div className="relative group">
              {/* Search Bar Glow Effect - Light Green */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-green-300 to-green-400 rounded-full blur opacity-0 group-hover:opacity-50 transition duration-500 ${isSearchFocused ? 'opacity-50' : ''}`}></div>
              
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-6 py-3.5 border-2 rounded-full outline-none text-black placeholder-gray-400 text-base transition-all duration-300 bg-white relative z-10"
                  style={{
                    borderColor: isSearchFocused ? '#86efac' : '#e5e7eb',
                    backgroundColor: isSearchFocused ? '#f0fdf4' : 'white',
                    boxShadow: isSearchFocused ? '0 0 0 3px rgba(134, 239, 172, 0.2)' : 'none'
                  }}
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowServiceSuggestions(true);
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setShowServiceSuggestions(true);
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowServiceSuggestions(false);
                    }}
                    className="absolute right-12 top-3.5 text-gray-400 hover:text-red-500 transition-colors z-10"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                <Search className={`absolute right-4 top-3.5 w-5 h-5 transition-all duration-300 ${isSearchFocused ? 'text-green-600 scale-110' : 'text-gray-400 group-hover:text-green-500'}`} />
              </div>

              {/* Service Suggestions Dropdown */}
              {showServiceSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-20 animate-fadeInUp">
                  <div className="p-4">
                    {filteredServices.length > 0 ? (
                      <>
                        {filteredServices.map((category, idx) => (
                          <div key={idx} className="mb-6 last:mb-0">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{category.icon}</span>
                                <h3 className="font-bold text-gray-800">{category.name}</h3>
                              </div>
                              <Link 
                                href={category.exploreLink}
                                className="text-sm text-green-600 hover:text-green-700 font-semibold"
                              >
                                Explore →
                              </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {category.services.map((service, serviceIdx) => (
                                <button
                                  key={serviceIdx}
                                  onClick={() => {
                                    setSearchQuery(service);
                                    setShowServiceSuggestions(false);
                                  }}
                                  className="text-left px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 text-sm"
                                >
                                  {service}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No services found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Explore Link */}
            <Link href="/explore" className="text-black hover:text-gray-600 transition-colors duration-300 font-medium">
              {t.explore}
            </Link>
            
            {/* Become a Service Provider Link */}
            <Link href="/become-provider" className="text-black hover:text-gray-600 transition-colors duration-300 font-medium">
              {t.becomeProvider}
            </Link>
            
            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full hover:border-gray-500 transition-all duration-300 text-black"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === "english" ? "EN" : "BN"}
              </span>
            </button>
            
            {/* Sign In Button */}
            {currentUser ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none group">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-400 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold group-hover:bg-gray-700 transition-all duration-300">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-black group-hover:text-gray-600 transition-colors duration-300 font-medium">{currentUser.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block border border-gray-200">
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <User className="inline w-4 h-4 mr-2" /> {t.profile}
                  </Link>
                  <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                    {t.myOrders}
                  </Link>
                  <hr className="my-1" />
                  <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50">
                    <LogOut className="inline w-4 h-4 mr-2" /> {t.logout}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onShowLogin}
                className="text-black hover:text-gray-600 transition-colors duration-300 font-medium"
              >
                {t.signIn}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={`md:hidden transition-all duration-500 overflow-hidden ${showSearchBar ? 'max-h-24 opacity-100 mt-2 pb-3' : 'max-h-0 opacity-0'}`}>
          <div className="relative">
            <input
              type="text"
              className="w-full px-5 py-2.5 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none text-black placeholder-gray-400 text-sm"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-2">
            <Link href="/" className="block py-2 text-black hover:text-gray-600">
              {t.home}
            </Link>
            <Link href="/explore" className="block py-2 text-black hover:text-gray-600">
              {t.explore}
            </Link>
            <Link href="/become-provider" className="block py-2 text-black hover:text-gray-600">
              {t.becomeProvider}
            </Link>
            
            {/* Mobile Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 py-2 text-black"
            >
              <Globe className="w-4 h-4" />
              <span>{language === "english" ? "English" : "বাংলা"}</span>
            </button>
            
            {currentUser ? (
              <>
                <Link href="/messages" className="block py-2 text-black">
                  {t.messages}
                </Link>
                <Link href="/profile" className="block py-2 text-black">
                  {t.profile}
                </Link>
                <button onClick={onLogout} className="block w-full text-left py-2 text-red-600">
                  {t.logout}
                </button>
              </>
            ) : (
              <button onClick={onShowLogin} className="block w-full text-left py-2 text-black font-medium">
                {t.signIn}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}