"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Briefcase, 
  Home, 
  Globe, 
  ChevronDown, 
  Sparkles, 
  TrendingUp, 
  Award,
  LayoutDashboard,
  Shield,
  Gift,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { updateUserProfile, getUserProfile } from "@/lib/firestoreService";
import NotificationBell from "@/components/NotificationBell";
import SearchBar from "@/components/SearchBar";

export default function Navbar({ searchQuery, setSearchQuery, onShowLogin }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const userMenuRef = useRef(null);
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const { currentUser, logout, isAuthenticated, setCurrentUser } = useAuth();
  const { isAdmin, refreshAdminStatus } = useAdminAuth();

  // Fetch user active status from database
  useEffect(() => {
    if (currentUser) {
      fetchUserStatus();
      refreshAdminStatus();
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout
  const handleLogoutClick = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    setShowUserMenu(false);
    
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle refer friend
  const handleReferFriend = () => {
    const shareUrl = `${window.location.origin}/?ref=${currentUser?.uid}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Referral link copied to clipboard! Share with your friends.");
  };

  // Translations
  const translations = {
    english: {
      explore: "Explore",
      becomeProvider: "Become a Provider",
      signIn: "Sign In",
      home: "Home",
      logout: "Logout",
      trending: "Trending",
      topRated: "Top Rated",
      nearYou: "Near You",
      dashboard: "Dashboard",
      adminDashboard: "Admin Panel",
      referFriend: "Refer a Friend",
      active: "Active",
      inactive: "Inactive"
    },
    bengali: {
      explore: "এক্সপ্লোর",
      becomeProvider: "প্রোভাইডার হোন",
      signIn: "সাইন ইন",
      home: "হোম",
      logout: "লগআউট",
      trending: "ট্রেন্ডিং",
      topRated: "টপ রেটেড",
      nearYou: "আপনার কাছাকাছি",
      dashboard: "ড্যাশবোর্ড",
      adminDashboard: "অ্যাডমিন প্যানেল",
      referFriend: "বন্ধুকে রেফার করুন",
      active: "সক্রিয়",
      inactive: "নিষ্ক্রিয়"
    }
  };

  const lang = translations[language];

  // If not authenticated, show simplified navbar
  if (!isAuthenticated) {
    return (
      <nav className={`bg-white sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md border-b-0' : 'border-b border-gray-100'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/favicon.ico" alt="Logo" width={32} height={32} className="w-8 h-8" />
              <span className="text-2xl font-bold text-black">Kaazbazar</span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full text-black hover:bg-gray-50 transition"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">{language === "english" ? "EN" : "BN"}</span>
              </button>
              <button onClick={onShowLogin} className="text-black font-medium hover:text-gray-600 transition">
                {lang.signIn}
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`bg-white sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md border-b-0' : 'border-b border-gray-100'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 md:py-0">
          {/* Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <Image 
                src="/favicon.ico" 
                alt="Kaazbazar Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10 md:w-12 md:h-12"
                priority
              />
              <span className="text-2xl md:text-3xl font-bold text-black group-hover:text-gray-700 transition-colors">
                Kaazbazar
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Search Bar Component */}
          <div className={`hidden md:block flex-1 max-w-2xl mx-8 transition-all duration-500 transform ${showSearchBar ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}`}>
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isScrolled={isScrolled}
              language={language}
            />
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Explore Link with Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-black hover:text-gray-600 font-medium transition">
                {lang.explore}
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-20 border border-gray-100">
                <Link href="/trending" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors rounded-t-xl">
                  <TrendingUp className="w-4 h-4" /> {lang.trending}
                </Link>
                <Link href="/top-rated" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors">
                  <Award className="w-4 h-4" /> {lang.topRated}
                </Link>
                <Link href="/near-you" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors rounded-b-xl">
                  <Sparkles className="w-4 h-4" /> {lang.nearYou}
                </Link>
              </div>
            </div>
            
            {/* Become a Provider Link */}
            <Link 
              href="/become-provider" 
              className="text-black hover:text-gray-600 transition font-medium"
            >
              {lang.becomeProvider}
            </Link>
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-full hover:border-gray-500 hover:bg-gray-50 transition text-black"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">{language === "english" ? "EN" : "BN"}</span>
            </button>
            
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* User Menu with Active Status */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 group"
              >
                <div className="relative">
                  {currentUser?.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-300 transition"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold group-hover:from-gray-600 group-hover:to-gray-800 transition">
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Online/Offline Status Dot */}
                  <div className="absolute -bottom-0.5 -right-0.5">
                    {isActive ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-white animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                        <XCircle className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 z-30">
                  {/* Active Status Toggle Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
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

                  {/* Dashboard Link */}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-sm">{lang.dashboard}</span>
                  </Link>

                  {/* Admin Dashboard Link - Only for admin users */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">{lang.adminDashboard}</span>
                    </Link>
                  )}

                  {/* Refer a Friend Link */}
                  <button
                    onClick={() => {
                      handleReferFriend();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                  >
                    <Gift className="w-4 h-4" />
                    <span className="text-sm">{lang.referFriend}</span>
                  </button>

                  <hr className="my-1" />
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogoutClick}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">{lang.logout}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className={`md:hidden transition-all duration-500 overflow-hidden ${showSearchBar ? 'max-h-24 opacity-100 mt-2 pb-3' : 'max-h-0 opacity-0'}`}>
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isScrolled={isScrolled}
            language={language}
          />
        </div>

        {/* Mobile Menu with Active Status */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-2">
            <Link href="/" className="flex items-center gap-3 py-2 text-black hover:bg-gray-50 px-3 rounded-lg transition">
              <Home className="w-5 h-5" /> {lang.home}
            </Link>
            <Link href="/explore" className="flex items-center gap-3 py-2 text-black hover:bg-gray-50 px-3 rounded-lg transition">
              <Sparkles className="w-5 h-5" /> {lang.explore}
            </Link>
            
            <Link href="/become-provider" className="flex items-center gap-3 py-2 text-black hover:bg-gray-50 px-3 rounded-lg transition">
              <Briefcase className="w-5 h-5" /> {lang.becomeProvider}
            </Link>
            
            {/* Language Toggle in Mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-3 py-2 text-black hover:bg-gray-50 px-3 rounded-lg w-full transition"
            >
              <Globe className="w-5 h-5" />
              <span>{language === "english" ? "English" : "বাংলা"}</span>
            </button>
            
            {/* Active Status in Mobile */}
            <div className="flex items-center justify-between py-2 px-3">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">{isActive ? lang.active : lang.inactive}</span>
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
            
            {/* Notification Bell in Mobile */}
            <div className="px-3 py-2">
              <NotificationBell />
            </div>
            
            {/* Dashboard Links in Mobile */}
            <Link href="/dashboard" className="flex items-center gap-3 py-2 text-black hover:bg-gray-50 px-3 rounded-lg transition">
              <LayoutDashboard className="w-5 h-5" /> {lang.dashboard}
            </Link>
            
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-3 py-2 text-black hover:bg-gray-50 px-3 rounded-lg transition">
                <Shield className="w-5 h-5" /> {lang.adminDashboard}
              </Link>
            )}
            
            <button
              onClick={handleReferFriend}
              className="flex items-center gap-3 w-full text-left py-2 text-black hover:bg-gray-50 px-3 rounded-lg transition"
            >
              <Gift className="w-5 h-5" /> {lang.referFriend}
            </button>
            
            <button 
              onClick={handleLogoutClick} 
              disabled={isLoggingOut}
              className="flex items-center gap-3 w-full text-left py-2 text-red-600 hover:bg-red-50 px-3 rounded-lg transition disabled:opacity-50"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" /> {lang.logout}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}