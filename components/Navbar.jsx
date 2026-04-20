"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Briefcase, 
  MessageCircle, 
  Home, 
  Globe, 
  ChevronDown, 
  Sparkles, 
  TrendingUp, 
  Award, 
  XCircle,
  Settings,
  Heart,
  Clock,
  Shield,
  UserCircle,
  HelpCircle,
  LayoutDashboard,
  Package,
  CheckCircle,
  XCircle as XCircleIcon
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile, getUserProfile } from "@/lib/firestoreService";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar({ searchQuery, setSearchQuery, onShowLogin }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const { currentUser, logout, isAuthenticated, setCurrentUser } = useAuth();

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

  // Fetch user active status from database
  useEffect(() => {
    if (currentUser) {
      fetchUserStatus();
    }
  }, [currentUser]);

  const fetchUserStatus = async () => {
    try {
      const result = await getUserProfile(currentUser.uid);
      if (result.success && result.data.isActive !== undefined) {
        setIsActive(result.data.isActive);
        setCurrentUser({ ...currentUser, isActive: result.data.isActive });
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  };

  // Handle scroll event
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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout with session deletion
  const handleLogoutClick = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setShowUserMenu(false);
    
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (path) => {
    setShowUserMenu(false);
    router.push(path);
  };

  // Toggle active status and save to database
  const toggleActiveStatus = async () => {
    if (updatingStatus) return;
    
    setUpdatingStatus(true);
    const newStatus = !isActive;
    setIsActive(newStatus);
    
    const result = await updateUserProfile(currentUser.uid, { isActive: newStatus });
    if (result.success) {
      setCurrentUser({ ...currentUser, isActive: newStatus });
    } else {
      setIsActive(!newStatus);
      alert("Failed to update status");
    }
    setUpdatingStatus(false);
  };

  // Translations
  const translations = {
    english: {
      explore: "Explore",
      becomeProvider: "Become a Service Provider",
      signIn: "Sign In",
      searchPlaceholder: "What service are you looking for today?",
      home: "Home",
      services: "Services",
      messages: "Messages",
      profile: "Profile",
      myOrders: "My Orders",
      logout: "Logout",
      trending: "Trending",
      topRated: "Top Rated",
      nearYou: "Near You",
      dashboard: "Dashboard",
      savedItems: "Saved Items",
      recentActivity: "Recent Activity",
      accountSettings: "Account Settings",
      helpSupport: "Help & Support",
      becomeSeller: "Become a Seller",
      active: "Active",
      inactive: "Inactive",
      loggingOut: "Logging out..."
    },
    bengali: {
      explore: "এক্সপ্লোর",
      becomeProvider: "সার্ভিস প্রোভাইডার হোন",
      signIn: "সাইন ইন",
      searchPlaceholder: "আপনি কি ধরনের সেবা খুঁজছেন?",
      home: "হোম",
      services: "সেবাসমূহ",
      messages: "বার্তা",
      profile: "প্রোফাইল",
      myOrders: "আমার অর্ডার",
      logout: "লগআউট",
      trending: "ট্রেন্ডিং",
      topRated: "টপ রেটেড",
      nearYou: "আপনার কাছাকাছি",
      dashboard: "ড্যাশবোর্ড",
      savedItems: "সেভ করা আইটেম",
      recentActivity: "রিসেন্ট অ্যাক্টিভিটি",
      accountSettings: "অ্যাকাউন্ট সেটিংস",
      helpSupport: "হেল্প ও সাপোর্ট",
      becomeSeller: "সেলার হোন",
      active: "সক্রিয়",
      inactive: "নিষ্ক্রিয়",
      loggingOut: "লগআউট হচ্ছে..."
    }
  };

  const lang = translations[language];

  return (
    <nav className={`bg-white sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md border-b-0' : 'border-b border-gray-100'}`}>
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
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Search Bar - Visible to everyone */}
          <div ref={searchRef} className={`hidden md:block flex-1 max-w-2xl mx-8 transition-all duration-500 transform ${showSearchBar ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}`}>
            <div className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full blur opacity-0 group-hover:opacity-50 transition duration-500 ${isSearchFocused ? 'opacity-50' : ''}`}></div>
              
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-6 py-3.5 border-2 rounded-full outline-none text-black placeholder-gray-400 text-base transition-all duration-300 bg-white relative z-10"
                  style={{
                    borderColor: isSearchFocused ? '#9ca3af' : '#e5e7eb',
                    backgroundColor: isSearchFocused ? '#f9fafb' : 'white',
                    boxShadow: isSearchFocused ? '0 0 0 3px rgba(156, 163, 175, 0.1)' : 'none'
                  }}
                  placeholder={lang.searchPlaceholder}
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
                <Search className={`absolute right-4 top-3.5 w-5 h-5 transition-all duration-300 ${isSearchFocused ? 'text-gray-600 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`} />
              </div>

              {showServiceSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-20 animate-fadeInUp">
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
                                className="text-sm text-gray-600 hover:text-black font-semibold"
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
                                  className="text-left px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-200 text-sm"
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
            {/* Explore Link - Visible to everyone */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-black hover:text-gray-600 transition-colors duration-300 font-medium">
                {lang.explore}
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 border border-gray-100">
                <Link href="/trending" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 hover:text-black transition-colors rounded-t-xl">
                  <TrendingUp className="w-4 h-4" /> {lang.trending}
                </Link>
                <Link href="/top-rated" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 hover:text-black transition-colors">
                  <Award className="w-4 h-4" /> {lang.topRated}
                </Link>
                <Link href="/near-you" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 hover:text-black transition-colors rounded-b-xl">
                  <Sparkles className="w-4 h-4" /> {lang.nearYou}
                </Link>
              </div>
            </div>
            
            {/* Become a Service Provider Link - ONLY visible when logged in */}
            {isAuthenticated && currentUser && (
              <Link 
                href="/become-provider" 
                className="text-black hover:text-gray-600 transition-colors duration-300 font-medium"
              >
                {lang.becomeProvider}
              </Link>
            )}
            
            {/* Language Toggle Button - Visible to everyone */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full hover:border-gray-500 hover:bg-gray-50 transition-all duration-300 text-black"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === "english" ? "EN" : "BN"}
              </span>
            </button>
            
            {/* User Section - Shows different based on auth status */}
            {isAuthenticated && currentUser ? (
              <>
                {/* Notification Bell - Only for logged in users */}
                <NotificationBell />
                
                {/* User Menu - Only for logged in users */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 focus:outline-none group"
                  >
                    <div className="relative">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt={currentUser.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-300 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold group-hover:from-gray-600 group-hover:to-gray-800 transition-all duration-300">
                          {currentUser.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {isActive ? (
                          <div className="w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white animate-pulse" />
                        ) : (
                          <div className="w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                            <XCircleIcon className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-semibold text-black">{currentUser.name?.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-30 animate-fadeInUp">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {currentUser.photoURL ? (
                              <img 
                                src={currentUser.photoURL} 
                                alt={currentUser.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                                {currentUser.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5">
                              {isActive ? (
                                <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                              ) : (
                                <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                                  <XCircleIcon className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-black text-sm">{currentUser.name}</p>
                            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isActive ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircleIcon className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium">
                              {isActive ? lang.active : lang.inactive}
                            </span>
                          </div>
                          <button
                            onClick={toggleActiveStatus}
                            disabled={updatingStatus}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              isActive ? 'bg-green-600' : 'bg-gray-300'
                            } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                          {isActive 
                            ? "✓ You're visible to customers" 
                            : "✗ You're hidden from customers"}
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span className="text-sm">{lang.dashboard}</span>
                        </Link>
                      </div>

                      <hr className="my-1" />
                      
                      <button
                        onClick={handleLogoutClick}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isLoggingOut ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">{lang.loggingOut}</span>
                          </>
                        ) : (
                          <>
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">{lang.logout}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onShowLogin}
                className="text-black hover:text-gray-600 transition-colors duration-300 font-medium"
              >
                {lang.signIn}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar - Visible to everyone */}
        <div className={`md:hidden transition-all duration-500 overflow-hidden ${showSearchBar ? 'max-h-24 opacity-100 mt-2 pb-3' : 'max-h-0 opacity-0'}`}>
          <div className="relative">
            <input
              type="text"
              className="w-full px-5 py-2.5 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none text-black placeholder-gray-400 text-sm"
              placeholder={lang.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-2 animate-slideDown">
            <Link href="/" className="flex items-center gap-3 py-3 text-black hover:text-gray-600 hover:bg-gray-50 px-3 rounded-lg transition-all duration-300">
              <Home className="w-5 h-5" /> {lang.home}
            </Link>
            <Link href="/explore" className="flex items-center gap-3 py-3 text-black hover:text-gray-600 hover:bg-gray-50 px-3 rounded-lg transition-all duration-300">
              <Sparkles className="w-5 h-5" /> {lang.explore}
            </Link>
            
            {/* Become a Service Provider - Only visible when logged in */}
            {isAuthenticated && currentUser && (
              <Link href="/become-provider" className="flex items-center gap-3 py-3 text-black hover:text-gray-600 hover:bg-gray-50 px-3 rounded-lg transition-all duration-300">
                <Briefcase className="w-5 h-5" /> {lang.becomeProvider}
              </Link>
            )}
            
            {/* Mobile Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-3 py-3 text-black hover:text-gray-600 hover:bg-gray-50 px-3 rounded-lg transition-all duration-300 w-full"
            >
              <Globe className="w-5 h-5" />
              <span>{language === "english" ? "English" : "বাংলা"}</span>
            </button>
            
            {isAuthenticated && currentUser ? (
              <>
                {/* Notification Bell in Mobile Menu */}
                <div className="px-3 py-2">
                  <NotificationBell />
                </div>
                
                <div className="flex items-center gap-3 py-3 px-3 border-t border-gray-100 pt-3">
                  <div className="relative">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                        {currentUser.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {isActive ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                      ) : (
                        <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                          <XCircleIcon className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-black">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3 px-3">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {isActive ? lang.active : lang.inactive}
                    </span>
                  </div>
                  <button
                    onClick={toggleActiveStatus}
                    disabled={updatingStatus}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? 'bg-green-600' : 'bg-gray-300'
                    } ${updatingStatus ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <Link href="/dashboard" className="flex items-center gap-3 py-3 text-black hover:text-gray-600 hover:bg-gray-50 px-3 rounded-lg transition-all duration-300">
                  <LayoutDashboard className="w-5 h-5" /> {lang.dashboard}
                </Link>
                
                <button onClick={handleLogoutClick} disabled={isLoggingOut} className="flex items-center gap-3 w-full text-left py-3 text-red-600 hover:bg-red-50 px-3 rounded-lg transition-all duration-300 disabled:opacity-50">
                  {isLoggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <span>{lang.loggingOut}</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-5 h-5" />
                      <span>{lang.logout}</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button onClick={onShowLogin} className="flex items-center gap-3 w-full text-left py-3 text-black hover:text-gray-600 hover:bg-gray-50 px-3 rounded-lg transition-all duration-300 font-medium">
                <User className="w-5 h-5" /> {lang.signIn}
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}