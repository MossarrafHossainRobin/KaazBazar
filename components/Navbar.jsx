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

const translations = {
  english: {
    explore: "Explore",
    services: "Services",
    becomeProvider: "Become a Provider",
    signIn: "Sign In",
    home: "Home",
    logout: "Logout",
    loggingOut: "Logging out...",
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
    referralCopied: "Referral link copied to clipboard!",
    viewAllMessages: "View All Messages",
    signInPrompt: "Sign in to access all features",
    switchLanguage: "Switch Language"
  },
  bengali: {
    explore: "এক্সপ্লোর",
    services: "সেবা",
    becomeProvider: "প্রোভাইডার হোন",
    signIn: "সাইন ইন",
    home: "হোম",
    logout: "লগআউট",
    loggingOut: "লগআউট হচ্ছে...",
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
    referralCopied: "রেফারেল লিঙ্ক কপি করা হয়েছে!",
    viewAllMessages: "সব বার্তা দেখুন",
    signInPrompt: "সমস্ত বৈশিষ্ট্য অ্যাক্সেস করতে সাইন ইন করুন",
    switchLanguage: "ভাষা পরিবর্তন করুন"
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
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const logoutInProgressRef = useRef(false);
  const scrollTickingRef = useRef(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguage();
  const { currentUser, logout, isAuthenticated, setCurrentUser, signIn } = useAuth();
  const { isAdmin, refreshAdminStatus } = useAdminAuth();

  const lang = translations[language];

  // ─── Data Fetching ───────────────────────────────
  useEffect(() => {
    if (currentUser) {
      fetchUserStatus();
      refreshAdminStatus();
      checkIfProvider();
    } else {
      setCheckingProvider(false);
      setIsActive(true);
    }
  }, [currentUser, refreshAdminStatus]);

  const fetchUserStatus = useCallback(async () => {
    if (!currentUser) return;
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

  // ─── Active Status Toggle ────────────────────────
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

  // ─── Scroll Handler ──────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollTickingRef.current) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          scrollTickingRef.current = false;
        });
        scrollTickingRef.current = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ─── Click Outside Handlers ──────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // ─── Close menus on route change ─────────────────
  useEffect(() => {
    setMobileMoreOpen(false);
    setMobileProfileOpen(false);
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  // ─── Logout ──────────────────────────────────────
  const handleLogoutClick = useCallback(async () => {
    if (isLoggingOut || logoutInProgressRef.current) return;
    
    logoutInProgressRef.current = true;
    setIsLoggingOut(true);
    setShowUserMenu(false);
    setMobileMoreOpen(false);
    setMobileProfileOpen(false);
    setIsMenuOpen(false);
    
    try {
      await logout();
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      logoutInProgressRef.current = false;
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logout, router]);

  useEffect(() => {
    return () => { logoutInProgressRef.current = false; };
  }, []);

  // ─── Navigation Handlers ─────────────────────────
  const handleReferFriend = useCallback(() => {
    if (!currentUser) return;
    const shareUrl = `${window.location.origin}/?ref=${currentUser.uid}`;
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
    setMobileProfileOpen(false);
    setIsMenuOpen(false);
  }, [router]);

  const handleDashboardClick = useCallback(() => {
    router.push("/dashboard");
    setShowUserMenu(false);
    setMobileMoreOpen(false);
    setMobileProfileOpen(false);
    setIsMenuOpen(false);
  }, [router]);

  const handleExploreClick = useCallback(() => {
    router.push("/explore");
    setMobileMoreOpen(false);
    setIsMenuOpen(false);
  }, [router]);

  // FIXED: Handle Sign In - Direct click handler to prevent popup blocking
  const handleSignInClick = useCallback((e) => {
    // Prevent any default behavior
    e.preventDefault();
    e.stopPropagation();
    
    // Close any open menus
    setShowUserMenu(false);
    setMobileMoreOpen(false);
    setMobileProfileOpen(false);
    setIsMenuOpen(false);
    
    // Call the onShowLogin immediately in the same event loop
    // This ensures the popup is triggered by direct user interaction
    if (onShowLogin) {
      // Use setTimeout with 0 delay to ensure the menus close first
      // but still within the user interaction context
      onShowLogin();
    }
  }, [onShowLogin]);

  // ─── Desktop Nav Links ───────────────────────────
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

  // ─── User Menu Items ─────────────────────────────
  const getUserMenuItems = useCallback(() => {
    const commonItems = [
      { label: lang.referFriend, icon: Gift, onClick: handleReferFriend },
      { label: lang.settings, href: "/settings", icon: Settings },
      { divider: true },
      { 
        label: isLoggingOut ? lang.loggingOut : lang.logout, 
        icon: LogOut, 
        onClick: handleLogoutClick, 
        danger: true, 
        disabled: isLoggingOut 
      }
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

  const desktopNavLinks = useMemo(() => getNavLinks(), [getNavLinks]);
  const userMenuItems = useMemo(() => getUserMenuItems(), [getUserMenuItems]);

  // ─── Mobile Bottom Nav Items ─────────────────────
  const mobileNavItems = useMemo(() => {
    const items = [
      { label: lang.home, icon: Home, href: "/", isActive: pathname === "/" },
      { label: lang.services, icon: Compass, onClick: handleExploreClick, isActive: pathname.startsWith("/explore") }
    ];

    if (isAuthenticated) {
      items.push({
        label: lang.messages,
        icon: MessageCircle,
        onClick: handleMessagesClick,
        isActive: pathname === "/dashboard" && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'messages',
        badge: true
      });
      items.push({
        label: lang.dashboard,
        icon: LayoutDashboard,
        onClick: handleDashboardClick,
        isActive: pathname.startsWith("/dashboard") && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') !== 'messages'
      });
    }

    items.push({
      label: lang.menu,
      icon: MoreHorizontal,
      onClick: () => setMobileMoreOpen(true),
      isActive: mobileMoreOpen
    });

    return items;
  }, [lang, pathname, handleExploreClick, handleDashboardClick, mobileMoreOpen, isAuthenticated]);

  // ─── Mobile More Menu Items ──────────────────────
  const mobileMoreMenuItems = useMemo(() => {
    if (!isAuthenticated) return [];
    
    const items = [
      { label: lang.dashboard, icon: LayoutDashboard, onClick: handleDashboardClick },
      { label: lang.messages, icon: MessageCircle, onClick: handleMessagesClick },
    ];

    if (isProvider) {
      items.push(
        { label: lang.myServices, href: "/provider/services", icon: Package },
        { label: lang.orders, href: "/provider/orders", icon: ShoppingBag },
        { label: lang.earnings, href: "/provider/earnings", icon: DollarSign }
      );
    } else {
      items.push(
        { label: lang.explore, href: "/explore", icon: Sparkles },
        { label: lang.myBookings, href: "/bookings", icon: Heart },
        { label: lang.saved, href: "/saved", icon: Heart }
      );
    }

    items.push(
      { label: lang.referFriend, icon: Gift, onClick: handleReferFriend },
      { label: lang.settings, href: "/settings", icon: Settings },
      { divider: true },
      { label: isLoggingOut ? lang.loggingOut : lang.logout, icon: LogOut, onClick: handleLogoutClick, danger: true, disabled: isLoggingOut }
    );

    if (isAdmin) {
      items.push({ divider: true }, { label: lang.adminDashboard, href: "/admin", icon: Shield });
    }

    return items;
  }, [isAuthenticated, isProvider, isAdmin, isLoggingOut, lang, handleDashboardClick, handleMessagesClick, handleReferFriend, handleLogoutClick]);

  return (
    <>
      {/* ============================================================ */}
      {/* DESKTOP NAVBAR                                               */}
      {/* ============================================================ */}
      <nav className={`hidden md:block sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-gray-100/40 border-b-0' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            
            {/* ── Logo ─────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <Image src="/favicon.ico" alt="Kaazbazar Logo" fill className="object-contain" priority />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors tracking-tight">Kaazbazar</span>
                {isProvider && !checkingProvider && (
                  <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium border border-emerald-100">
                    <BadgeCheck className="w-3 h-3" />{lang.providerBadge}
                  </span>
                )}
              </div>
            </Link>

            {/* ── Search Bar ──────────────────────────── */}
            <div className="flex-1 max-w-xl mx-8 lg:mx-12">
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} isScrolled={isScrolled} language={language} />
            </div>

            {/* ── Right Side Actions ──────────────────── */}
            <div className="flex items-center gap-1">
              {desktopNavLinks.map((link, idx) => (
                <Link key={idx} href={link.href} className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-50 ${link.highlight ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' : 'text-gray-600 hover:text-gray-900'}`}>
                  <span className="flex items-center gap-1.5">{link.icon && <link.icon className="w-4 h-4" />}{link.label}</span>
                </Link>
              ))}
              
              <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200" title={lang.switchLanguage}>
                <Globe className="w-4 h-4" /><span className="hidden lg:inline">{language === "english" ? "EN" : "BN"}</span>
              </button>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  
                  {/* MessageBox - renders its own button and dropdown */}
                  <MessageBox />
                  
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  {/* Profile Avatar + Status + User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                      <div className="relative">
                        <div className="relative">
                          {currentUser?.photoURL ? (
                            <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm group-hover:ring-gray-300 transition-all" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                          ) : null}
                          <div className={`w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-all ${currentUser?.photoURL ? 'hidden' : 'flex'}`}>
                            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5">
                            {isActive ? (
                              <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>
                            ) : (
                              <div className="w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center"><XCircle className="w-2 h-2 text-white" /></div>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown Menu */}
                    <div className={`absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 transition-all duration-200 origin-top-right ${showUserMenu ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none'}`}>
                      <div className="px-4 py-3 border-b border-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isActive ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                            <span className="text-sm font-medium text-gray-700">{isActive ? lang.active : lang.inactive}</span>
                          </div>
                          <button onClick={toggleActiveStatus} disabled={updatingStatus} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${isActive ? 'bg-emerald-600' : 'bg-gray-300'} ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{isActive ? lang.visibleToCustomers : lang.hiddenFromCustomers}</p>
                      </div>

                      {userMenuItems.map((item, idx) => {
                        if (item.divider) return <div key={idx} className="my-1 border-t border-gray-50" />;
                        if (item.href) return <Link key={idx} href={item.href} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150" onClick={() => setShowUserMenu(false)}><item.icon className="w-4 h-4 text-gray-400" />{item.label}</Link>;
                        return <button key={idx} onClick={item.onClick} disabled={item.disabled} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${item.disabled ? 'opacity-50 cursor-not-allowed' : item.danger ? 'text-red-600 hover:bg-red-50 hover:text-red-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}><item.icon className={`w-4 h-4 ${item.danger ? 'text-red-400' : 'text-gray-400'}`} />{item.label}</button>;
                      })}

                      {isAdmin && (
                        <>
                          <div className="my-1 border-t border-gray-50" />
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150" onClick={() => setShowUserMenu(false)}><Shield className="w-4 h-4 text-gray-400" />{lang.adminDashboard}</Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // FIXED: Sign In Button - Direct onClick handler, no wrapper functions
                <button 
                  type="button"
                  onClick={handleSignInClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all duration-200 shadow-sm"
                >
                  {lang.signIn}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* MOBILE HEADER                                                */}
      {/* ============================================================ */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/favicon.ico" alt="Kaazbazar" width={30} height={30} className="w-7 h-7 rounded-lg" priority />
            <span className="text-lg font-bold text-gray-900 tracking-tight">Kaazbazar</span>
            {isProvider && !checkingProvider && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-full font-medium flex items-center gap-0.5"><BadgeCheck className="w-2.5 h-2.5" /></span>}
          </Link>

          <div className="flex items-center gap-1">
            <button onClick={toggleLanguage} className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200" title={lang.switchLanguage}><Globe className="w-5 h-5" /></button>
            
            {isAuthenticated ? (
              <>
                <MessageBox />
                <NotificationBell />
                
                <button onClick={() => setMobileProfileOpen(true)} className="relative p-1 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200">
                  {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                  <div className={`w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full items-center justify-center text-white text-sm font-bold shadow-sm ${currentUser?.photoURL ? 'hidden' : 'flex'}`}>{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</div>
                  <div className="absolute bottom-0 right-0">{isActive ? <div className="w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" /> : <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center"><XCircle className="w-1.5 h-1.5 text-white" /></div>}</div>
                </button>
              </>
            ) : (
              // FIXED: Mobile Sign In Button - Direct onClick handler
              <button
                type="button"
                onClick={handleSignInClick}
                className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all duration-200"
              >
                {lang.signIn}
              </button>
            )}
          </div>
        </div>
        
        <div className="px-4 pb-3">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} isScrolled={true} language={language} />
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM NAVIGATION                                     */}
      {/* ============================================================ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        <nav className="flex items-center justify-around h-14 px-1">
          {mobileNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.isActive;
            if (item.onClick) {
              return (
                <button key={idx} onClick={item.onClick} className={`relative flex flex-col items-center justify-center w-full h-full min-w-0 py-1 transition-all duration-200 active:scale-95 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className="relative">
                    <Icon className="w-6 h-6 transition-all duration-200" strokeWidth={isActive ? 2.5 : 2} />
                    {item.badge && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />}
                  </div>
                  <span className={`text-[10px] font-medium mt-0.5 leading-none ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>{item.label}</span>
                  {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
              );
            }
            return (
              <Link key={idx} href={item.href} className={`relative flex flex-col items-center justify-center w-full h-full min-w-0 py-1 transition-all duration-200 active:scale-95 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className="relative"><Icon className="w-6 h-6 transition-all duration-200" strokeWidth={isActive ? 2.5 : 2} /></div>
                <span className={`text-[10px] font-medium mt-0.5 leading-none ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>{item.label}</span>
                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-600 rounded-full" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ============================================================ */}
      {/* MOBILE MORE MENU (Bottom Sheet)                              */}
      {/* ============================================================ */}
      {mobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-[70] flex items-end justify-center" onClick={() => setMobileMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }} />
          <div className="relative w-full bg-white rounded-t-2xl shadow-2xl overflow-y-auto" style={{ maxHeight: '80vh', animation: 'slideDown 0.3s ease-out', paddingBottom: 'calc(env(safe-area-inset-bottom, 8px) + 80px)' }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center z-10"><div className="w-10 h-1.5 bg-gray-300 rounded-full" /></div>
            <div className="px-4 space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                    <div className="relative">
                      {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Avatar" className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-lg font-bold">{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</div>}
                      <div className="absolute -bottom-0.5 -right-0.5">{isActive ? <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" /> : <div className="w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center"><XCircle className="w-2 h-2 text-white" /></div>}</div>
                    </div>
                    <div className="flex-1 min-w-0"><div className="font-semibold text-gray-900 truncate">{currentUser?.name || 'User'}</div><div className="text-xs text-gray-500 truncate">{currentUser?.email}</div></div>
                    {isProvider && <BadgeCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-xl mb-2">
                    <div className="flex items-center gap-2">{isActive ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}<span className="text-sm font-medium text-gray-700">{isActive ? lang.active : lang.inactive}</span></div>
                    <button onClick={toggleActiveStatus} disabled={updatingStatus} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-600' : 'bg-gray-300'} ${updatingStatus ? 'opacity-50' : ''}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} /></button>
                  </div>
                  <button onClick={() => { handleMessagesClick(); setMobileMoreOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors active:scale-[0.98]"><MessageCircle className="w-5 h-5" /><span className="text-sm font-semibold">{lang.messages}</span><ChevronDown className="w-4 h-4 -rotate-90 ml-auto" /></button>
                  {mobileMoreMenuItems.map((item, idx) => {
                    if (item.divider) return <div key={idx} className="my-1 border-t border-gray-100" />;
                    if (item.href) return <Link key={idx} href={item.href} className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]" onClick={() => setMobileMoreOpen(false)}><item.icon className="w-5 h-5 text-gray-400" /><span className="text-sm font-medium">{item.label}</span></Link>;
                    return <button key={idx} onClick={() => { item.onClick(); setMobileMoreOpen(false); }} disabled={item.disabled} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors active:scale-[0.98] ${item.disabled ? 'opacity-50 cursor-not-allowed' : item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}><item.icon className={`w-5 h-5 ${item.danger ? 'text-red-400' : 'text-gray-400'}`} /><span className="text-sm font-medium">{item.label}</span></button>;
                  })}
                </>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <p className="text-gray-500 text-sm">{lang.signInPrompt}</p>
                  {/* FIXED: Sign In button in mobile menu - Direct handler */}
                  <button
                    type="button"
                    onClick={handleSignInClick}
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors active:scale-[0.98]"
                  >
                    {lang.signIn}
                  </button>
                </div>
              )}
              <div className="my-1 border-t border-gray-100" />
              <button onClick={toggleLanguage} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"><Globe className="w-5 h-5 text-gray-400" /><span className="text-sm font-medium">{lang.switchLanguage}</span></button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MOBILE PROFILE PANEL (Bottom Sheet)                          */}
      {/* ============================================================ */}
      {mobileProfileOpen && isAuthenticated && (
        <div className="md:hidden fixed inset-0 z-[70] flex items-end justify-center" onClick={() => setMobileProfileOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }} />
          <div className="relative w-full bg-white rounded-t-2xl shadow-2xl" style={{ animation: 'slideDown 0.3s ease-out', paddingBottom: 'calc(env(safe-area-inset-bottom, 8px) + 80px)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1.5 bg-gray-300 rounded-full" /></div>
            <div className="px-4 space-y-1">
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                <div className="relative">
                  {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Avatar" className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-lg font-bold">{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</div>}
                  <div className="absolute -bottom-0.5 -right-0.5">{isActive ? <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white" /> : <div className="w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center"><XCircle className="w-2 h-2 text-white" /></div>}</div>
                </div>
                <div className="flex-1 min-w-0"><div className="font-semibold text-gray-900 truncate">{currentUser?.name || 'User'}</div><div className="text-xs text-gray-500 truncate">{currentUser?.email}</div></div>
              </div>
              <div className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-xl mb-2">
                <div className="flex items-center gap-2">{isActive ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}<span className="text-sm font-medium text-gray-700">{isActive ? lang.active : lang.inactive}</span></div>
                <button onClick={toggleActiveStatus} disabled={updatingStatus} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-emerald-600' : 'bg-gray-300'} ${updatingStatus ? 'opacity-50' : ''}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} /></button>
              </div>
              <Link href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]" onClick={() => setMobileProfileOpen(false)}><Settings className="w-5 h-5 text-gray-400" /><span className="text-sm font-medium">{lang.settings}</span></Link>
              <div className="my-1 border-t border-gray-100" />
              <button onClick={() => { handleLogoutClick(); setMobileProfileOpen(false); }} disabled={isLoggingOut} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors active:scale-[0.98] ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}>
                {isLoggingOut ? <><div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /><span className="text-sm font-medium">{lang.loggingOut}</span></> : <><LogOut className="w-5 h-5 text-red-400" /><span className="text-sm font-medium">{lang.logout}</span></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-14" />
    </>
  );
}