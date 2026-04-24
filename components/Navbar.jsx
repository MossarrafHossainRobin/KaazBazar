"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  LayoutDashboard,
  Shield,
  Gift,
  CheckCircle,
  XCircle,
  Package,
  ShoppingBag,
  DollarSign,
  Heart,
  MessageCircle,
  Settings,
  Compass,
  UserCircle,
  MoreHorizontal,
  BadgeCheck
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { updateUserProfile, getUserProfile, getServiceProvider } from "@/lib/firestoreService";
import NotificationBell from "@/components/NotificationBell";
import MessageBox from "@/components/MessageBox";
import SearchBar from "@/components/SearchBar";

// Memoized static translations to avoid recreation
const translations = {
  english: {
    explore: "Explore",
    services: "Services",
    becomeProvider: "Become a Provider",
    signIn: "Sign In",
    home: "Home",
    logout: "Logout",
    loggingOut: "Logging out...",
    trending: "Trending",
    topRated: "Top Rated",
    nearYou: "Near You",
    dashboard: "Dashboard",
    adminDashboard: "Admin Panel",
    referFriend: "Refer a Friend",
    active: "Active",
    inactive: "Inactive",
    myServices: "My Services",
    orders: "Orders",
    earnings: "Earnings",
    myBookings: "My Bookings",
    saved: "Saved",
    messages: "Messages",
    settings: "Settings",
    profile: "Profile",
    menu: "Menu",
    providerBadge: "Provider",
    visibleToCustomers: "You're visible to customers",
    hiddenFromCustomers: "You're hidden from customers",
    referralCopied: "Referral link copied to clipboard! Share with your friends."
  },
  bengali: {
    explore: "এক্সপ্লোর",
    services: "সেবা",
    becomeProvider: "প্রোভাইডার হোন",
    signIn: "সাইন ইন",
    home: "হোম",
    logout: "লগআউট",
    loggingOut: "লগআউট হচ্ছে...",
    trending: "ট্রেন্ডিং",
    topRated: "টপ রেটেড",
    nearYou: "আপনার কাছাকাছি",
    dashboard: "ড্যাশবোর্ড",
    adminDashboard: "অ্যাডমিন প্যানেল",
    referFriend: "বন্ধুকে রেফার করুন",
    active: "সক্রিয়",
    inactive: "নিষ্ক্রিয়",
    myServices: "আমার সেবা",
    orders: "অর্ডার",
    earnings: "আয়",
    myBookings: "আমার বুকিং",
    saved: "সেভ করা",
    messages: "বার্তা",
    settings: "সেটিংস",
    profile: "প্রোফাইল",
    menu: "মেনু",
    providerBadge: "প্রোভাইডার",
    visibleToCustomers: "আপনি গ্রাহকদের কাছে দৃশ্যমান",
    hiddenFromCustomers: "আপনি গ্রাহকদের থেকে লুকানো",
    referralCopied: "রেফারেল লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে! বন্ধুদের সাথে শেয়ার করুন।"
  }
};

export default function Navbar({ searchQuery, setSearchQuery, onShowLogin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [checkingProvider, setCheckingProvider] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [messageBoxOpen, setMessageBoxOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const messageBoxRef = useRef(null);
  const logoutInProgressRef = useRef(false);
  const scrollTickingRef = useRef(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguage();
  const { currentUser, logout, isAuthenticated, setCurrentUser } = useAuth();
  const { isAdmin, refreshAdminStatus } = useAdminAuth();

  const lang = translations[language];

  // Fetch user active status and provider status
  useEffect(() => {
    if (currentUser) {
      fetchUserStatus();
      refreshAdminStatus();
      checkIfProvider();
    } else {
      setCheckingProvider(false);
    }
  }, [currentUser, refreshAdminStatus]);

  const fetchUserStatus = useCallback(async () => {
    try {
      const result = await getUserProfile(currentUser.uid);
      if (result.success && result.data.isActive !== undefined) {
        setIsActive(result.data.isActive);
        setCurrentUser(prev => prev ? { ...prev, isActive: result.data.isActive } : prev);
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  }, [currentUser, setCurrentUser]);

  const checkIfProvider = useCallback(async () => {
    if (!currentUser) {
      setCheckingProvider(false);
      return;
    }
    try {
      const providerResult = await getServiceProvider(currentUser.uid);
      setIsProvider(providerResult.success && !!providerResult.data);
    } catch (error) {
      console.error("Error checking provider status:", error);
      setIsProvider(false);
    } finally {
      setCheckingProvider(false);
    }
  }, [currentUser]);

  // Toggle active status with optimistic update
  const toggleActiveStatus = useCallback(async () => {
    if (updatingStatus || !currentUser) return;
    
    setUpdatingStatus(true);
    const newStatus = !isActive;
    setIsActive(newStatus);
    
    try {
      const result = await updateUserProfile(currentUser.uid, { isActive: newStatus });
      if (result.success) {
        setCurrentUser(prev => prev ? { ...prev, isActive: newStatus } : prev);
      } else {
        // Rollback on failure
        setIsActive(!newStatus);
        alert("Failed to update status");
      }
    } catch (error) {
      setIsActive(!newStatus);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  }, [updatingStatus, isActive, currentUser, setCurrentUser]);

  // Optimized scroll handler with RAF
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollTickingRef.current) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 20;
          setIsScrolled(prev => prev !== scrolled ? scrolled : prev);
          scrollTickingRef.current = false;
        });
        scrollTickingRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (messageBoxRef.current && !messageBoxRef.current.contains(event.target)) {
        setMessageBoxOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileMoreOpen(false);
    setShowUserMenu(false);
    setMessageBoxOpen(false);
  }, [pathname]);

  // FIXED: Reliable logout with guard against double-clicks and stale state
  const handleLogoutClick = useCallback(async () => {
    // Guard against concurrent logout attempts
    if (isLoggingOut || logoutInProgressRef.current) return;
    
    logoutInProgressRef.current = true;
    setIsLoggingOut(true);
    setShowUserMenu(false);
    setMobileMoreOpen(false);
    setMobileMenuOpen(false);
    
    try {
      await logout();
      // Use replace to prevent back-button issues after logout
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Reset state on error so user can retry
      logoutInProgressRef.current = false;
      setIsLoggingOut(false);
    }
    // Note: Don't reset logoutInProgressRef on success since component will unmount
  }, [isLoggingOut, logout, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      logoutInProgressRef.current = false;
    };
  }, []);

  const handleReferFriend = useCallback(() => {
    const shareUrl = `${window.location.origin}/?ref=${currentUser?.uid}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(lang.referralCopied);
    }).catch(() => {
      alert(lang.referralCopied);
    });
  }, [currentUser, lang.referralCopied]);

  const handleMessagesClick = useCallback(() => {
    router.push("/dashboard?tab=messages");
    setShowUserMenu(false);
    setMobileMoreOpen(false);
    setMessageBoxOpen(false);
  }, [router]);

  const handleDashboardClick = useCallback(() => {
    router.push("/dashboard");
    setShowUserMenu(false);
    setMobileMoreOpen(false);
  }, [router]);

  const handleProfileClick = useCallback(() => {
    if (isAuthenticated) {
      setShowUserMenu(prev => !prev);
      setMobileMoreOpen(false);
    } else {
      onShowLogin?.();
    }
  }, [isAuthenticated, onShowLogin]);

  // Navigation links based on auth & role
  const getNavLinks = useCallback(() => {
    if (!isAuthenticated) {
      return [{ label: lang.explore, href: "/explore", icon: Sparkles }];
    }
    if (isProvider) {
      return [
        { label: lang.myServices, href: "/provider/services", icon: Package },
        { label: lang.orders, href: "/my-orders", icon: ShoppingBag },
        { label: lang.earnings, href: "/provider/earnings", icon: DollarSign }
      ];
    }
    return [
      { label: lang.explore, href: "/explore", icon: Sparkles },
      { label: lang.myBookings, href: "/bookings", icon: Heart },
      { label: lang.saved, href: "/saved", icon: Heart },
      { label: lang.becomeProvider, href: "/become-provider", icon: Briefcase, highlight: true }
    ];
  }, [isAuthenticated, isProvider, lang]);

  // User menu items
  const getUserMenuItems = useCallback(() => {
    const commonItems = [
      { label: lang.referFriend, icon: Gift, onClick: handleReferFriend },
      { label: lang.settings, href: "/settings", icon: Settings },
      { divider: true },
      { label: isLoggingOut ? lang.loggingOut : lang.logout, icon: LogOut, onClick: handleLogoutClick, danger: true, disabled: isLoggingOut }
    ];

    if (isProvider) {
      return [
        { label: lang.dashboard, icon: LayoutDashboard, onClick: handleDashboardClick },
        { label: lang.messages, icon: MessageCircle, onClick: handleMessagesClick },
        { label: lang.myServices, href: "/provider/services", icon: Package },
        { label: lang.orders, href: "/provider/orders", icon: ShoppingBag },
        { label: lang.earnings, href: "/provider/earnings", icon: DollarSign },
        ...commonItems
      ];
    }
    return [
      { label: lang.dashboard, icon: LayoutDashboard, onClick: handleDashboardClick },
      { label: lang.messages, icon: MessageCircle, onClick: handleMessagesClick },
      { label: lang.myBookings, href: "/bookings", icon: Heart },
      { label: lang.saved, href: "/saved", icon: Heart },
      ...commonItems
    ];
  }, [isProvider, lang, handleDashboardClick, handleMessagesClick, handleReferFriend, handleLogoutClick, isLoggingOut]);

  // Mobile bottom nav items
  const mobileNavItems = useMemo(() => [
    { 
      label: lang.home, 
      icon: Home, 
      href: "/",
      isActive: pathname === "/" 
    },
    { 
      label: lang.services, 
      icon: Compass, 
      href: "/explore",
      isActive: pathname.startsWith("/explore") 
    },
    { 
      label: lang.messages, 
      icon: MessageCircle, 
      onClick: handleMessagesClick,
      isActive: pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'messages',
      badge: true 
    },
    { 
      label: lang.dashboard, 
      icon: LayoutDashboard, 
      href: "/dashboard",
      isActive: pathname.startsWith("/dashboard") && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') !== 'messages'
    },
    { 
      label: lang.menu, 
      icon: MoreHorizontal, 
      onClick: () => setMobileMoreOpen(true),
      isActive: mobileMoreOpen 
    }
  ], [lang, pathname, handleMessagesClick, mobileMoreOpen]);

  // Memoized values for stable renders
  const desktopNavLinks = useMemo(() => getNavLinks(), [getNavLinks]);
  const userMenuItems = useMemo(() => getUserMenuItems(), [getUserMenuItems]);

  return (
    <>
      {/* ============ DESKTOP NAVBAR ============ */}
      <nav 
        className={`hidden md:block sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-100/40 border-b border-gray-100/50' 
            : 'bg-white border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <Image 
                  src="/favicon.ico" 
                  alt="Kaazbazar Logo" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors tracking-tight">
                  Kaazbazar
                </span>
                {isProvider && !checkingProvider && (
                  <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium border border-emerald-100">
                    <BadgeCheck className="w-3 h-3" />
                    {lang.providerBadge}
                  </span>
                )}
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8 lg:mx-12">
              <SearchBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isScrolled={isScrolled}
                language={language}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Nav Links */}
              {desktopNavLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                    link.highlight 
                      ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </span>
                </Link>
              ))}
              
              {/* Language Toggle - Always visible */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                title={`Switch to ${language === 'english' ? 'Bengali' : 'English'}`}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden lg:inline">{language === "english" ? "EN" : "BN"}</span>
              </button>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  {/* MessageBox - Desktop: inline in the navbar row */}
                  <div className="relative" ref={messageBoxRef}>
                    <button
                      onClick={() => setMessageBoxOpen(!messageBoxOpen)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        messageBoxOpen 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      title={lang.messages}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    
                    {/* MessageBox Dropdown - Anchored properly */}
                    {messageBoxOpen && (
                      <div className="absolute right-0 mt-2 w-80 md:w-96 z-30">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 text-sm">{lang.messages}</h3>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            <MessageBox />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <NotificationBell />
                  
                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                    >
                      <div className="relative">
                        {currentUser?.photoURL ? (
                          <img 
                            src={currentUser.photoURL} 
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-gray-300 transition-all"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div 
                          className={`w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-all ${
                            currentUser?.photoURL ? 'hidden' : 'flex'
                          }`}
                        >
                          {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5">
                          {isActive ? (
                            <div className="w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                          ) : (
                            <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                              <XCircle className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown with animation */}
                    <div className={`absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 transition-all duration-200 origin-top-right ${
                      showUserMenu 
                        ? 'opacity-100 scale-100 translate-y-0 visible' 
                        : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'
                    }`}>
                      {/* Status Toggle */}
                      <div className="px-4 py-3 border-b border-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isActive ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {isActive ? lang.active : lang.inactive}
                            </span>
                          </div>
                          <button
                            onClick={toggleActiveStatus}
                            disabled={updatingStatus}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                              isActive ? 'bg-emerald-600' : 'bg-gray-300'
                            } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {isActive ? lang.visibleToCustomers : lang.hiddenFromCustomers}
                        </p>
                      </div>

                      {/* Menu Items */}
                      {userMenuItems.map((item, idx) => {
                        if (item.divider) {
                          return <div key={idx} className="my-1 border-t border-gray-50" />;
                        }
                        if (item.href) {
                          return (
                            <Link
                              key={idx}
                              href={item.href}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <item.icon className="w-4 h-4 text-gray-400" />
                              {item.label}
                            </Link>
                          );
                        }
                        return (
                          <button
                            key={idx}
                            onClick={item.onClick}
                            disabled={item.disabled}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                              item.disabled 
                                ? 'opacity-50 cursor-not-allowed' 
                                : item.danger 
                                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon className={`w-4 h-4 ${item.danger ? 'text-red-400' : 'text-gray-400'}`} />
                            {item.label}
                          </button>
                        );
                      })}

                      {isAdmin && (
                        <>
                          <div className="my-1 border-t border-gray-50" />
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Shield className="w-4 h-4 text-gray-400" />
                            {lang.adminDashboard}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={onShowLogin} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  {lang.signIn}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ============ MOBILE HEADER ============ */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image 
              src="/favicon.ico" 
              alt="Kaazbazar" 
              width={30} 
              height={30} 
              className="w-7 h-7 rounded-lg"
              priority
            />
            <span className="text-lg font-bold text-gray-900 tracking-tight">Kaazbazar</span>
            {isProvider && !checkingProvider && (
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-full font-medium flex items-center gap-0.5">
                <BadgeCheck className="w-2.5 h-2.5" />
              </span>
            )}
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            {/* Language Toggle - Prominent on mobile */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
              title={`Switch to ${language === 'english' ? 'Bengali' : 'English'}`}
            >
              <Globe className="w-5 h-5" />
            </button>
            
            {isAuthenticated ? (
              <>
                <NotificationBell />
                
                {/* Profile/Avatar Button */}
                <button
                  onClick={handleProfileClick}
                  className="p-1 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                >
                  {currentUser?.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className={`w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full items-center justify-center text-white text-sm font-bold shadow-sm ${
                    currentUser?.photoURL ? 'hidden' : 'flex'
                  }`}>
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>
              </>
            ) : (
              <button
                onClick={onShowLogin}
                className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all duration-200"
              >
                {lang.signIn}
              </button>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isScrolled={true}
            language={language}
          />
        </div>
      </div>

      {/* ============ MOBILE BOTTOM NAVIGATION ============ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] safe-area-bottom">
        <nav className="flex items-center justify-around h-14 px-1">
          {mobileNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.isActive;
            
            if (item.onClick) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`relative flex flex-col items-center justify-center w-full h-full min-w-0 py-1 transition-all duration-200 active:scale-95 ${
                    isActive ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  <div className="relative">
                    <Icon 
                      className="w-6 h-6 transition-all duration-200" 
                      strokeWidth={isActive ? 2.5 : 2} 
                    />
                    {item.badge && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium mt-0.5 leading-none ${
                    isActive ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-600 rounded-full" />
                  )}
                </button>
              );
            }
            
            return (
              <Link
                key={idx}
                href={item.href}
                className={`relative flex flex-col items-center justify-center w-full h-full min-w-0 py-1 transition-all duration-200 active:scale-95 ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  <Icon 
                    className="w-6 h-6 transition-all duration-200" 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </div>
                <span className={`text-[10px] font-medium mt-0.5 leading-none ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ============ MOBILE MORE MENU (Bottom Sheet) ============ */}
      {mobileMoreOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[60] flex items-end justify-center"
          onClick={() => setMobileMoreOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />
          <div 
            className="relative w-full bg-white rounded-t-2xl shadow-2xl animate-slide-up max-h-[70vh] overflow-y-auto pb-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center rounded-t-2xl">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>
            
            <div className="px-4 space-y-1">
              {/* User Info */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                  {currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{currentUser?.name || 'User'}</div>
                    <div className="text-xs text-gray-500 truncate">{currentUser?.email}</div>
                  </div>
                  {isProvider && (
                    <BadgeCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  )}
                </div>
              )}

              {/* Active Status Toggle */}
              {isAuthenticated && (
                <div className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-xl mb-2">
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {isActive ? lang.active : lang.inactive}
                    </span>
                  </div>
                  <button
                    onClick={toggleActiveStatus}
                    disabled={updatingStatus}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? 'bg-emerald-600' : 'bg-gray-300'
                    } ${updatingStatus ? 'opacity-50' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              )}

              {/* Messages - Prominent access */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    handleMessagesClick();
                    setMobileMoreOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors active:scale-[0.98]"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">{lang.messages}</span>
                  <span className="ml-auto">
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </span>
                </button>
              )}

              {/* Menu Items */}
              {isAuthenticated ? (
                <>
                  {userMenuItems.map((item, idx) => {
                    if (item.divider) return <div key={idx} className="my-1 border-t border-gray-100" />;
                    if (item.href) {
                      return (
                        <Link
                          key={idx}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
                          onClick={() => setMobileMoreOpen(false)}
                        >
                          <item.icon className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          item.onClick();
                          setMobileMoreOpen(false);
                        }}
                        disabled={item.disabled}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors active:scale-[0.98] ${
                          item.disabled 
                            ? 'opacity-50 cursor-not-allowed' 
                            : item.danger 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 ${item.danger ? 'text-red-400' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}

                  {isAdmin && (
                    <>
                      <div className="my-1 border-t border-gray-100" />
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
                        onClick={() => setMobileMoreOpen(false)}
                      >
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium">{lang.adminDashboard}</span>
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    onShowLogin?.();
                    setMobileMoreOpen(false);
                  }}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors active:scale-[0.98]"
                >
                  {lang.signIn}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ MOBILE USER MENU (Profile Quick Menu) ============ */}
      {showUserMenu && isAuthenticated && (
        <div 
          className="md:hidden fixed inset-0 z-[60] flex items-end justify-center"
          onClick={() => setShowUserMenu(false)}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" />
          <div 
            className="relative w-full bg-white rounded-t-2xl shadow-2xl animate-slide-up pb-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>
            
            <div className="px-4 space-y-1">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{currentUser?.name || 'User'}</div>
                  <div className="text-xs text-gray-500 truncate">{currentUser?.email}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <button
                onClick={() => {
                  handleDashboardClick();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
              >
                <LayoutDashboard className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">{lang.dashboard}</span>
              </button>

              <button
                onClick={() => {
                  handleMessagesClick();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">{lang.messages}</span>
              </button>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium">{lang.settings}</span>
              </Link>

              <div className="my-1 border-t border-gray-100" />

              <button
                onClick={() => {
                  handleLogoutClick();
                  setShowUserMenu(false);
                }}
                disabled={isLoggingOut}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors active:scale-[0.98] ${
                  isLoggingOut ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">{lang.loggingOut}</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5 text-red-400" />
                    <span className="text-sm font-medium">{lang.logout}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-14" />

      {/* Global Animation Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .safe-area-bottom {
          padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
        }
        /* Prevent body scroll when modal is open */
        body.modal-open {
          overflow: hidden;
        }
      `}</style>
    </>
  );
}