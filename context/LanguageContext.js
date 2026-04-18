"use client";
import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

// All translations
const translations = {
  english: {
    // Navbar
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
    
    // Hero Section
    heroTitle: "Find the perfect service for your needs",
    heroSubtitle: "Connect with skilled professionals ready to help you",
    searchButton: "Search",
    serviceTypes: "Service Types:",
    popularSearches: "Popular Searches:",
    
    // Categories
    electrician: "Electrician",
    plumber: "Plumber",
    carpenter: "Carpenter",
    gardener: "Gardener",
    painter: "Painter",
    handyman: "Handyman",
    cleaner: "Cleaner",
    acTechnician: "AC Technician",
    
    // Trust Section
    securePayments: "Secure Payments",
    support247: "24/7 Support",
    verifiedPros: "Verified Professionals",
    moneyBack: "Money Back Guarantee",
    
    // Dashboard
    welcomeBack: "Welcome back",
    activeListings: "Active Listings",
    totalJobs: "Total Jobs",
    messages: "Messages",
    goToDashboard: "Go to Dashboard",
    
    // Services Section
    recommendedForYou: "Recommended for you",
    popularNearYou: "Popular services near you",
    viewAll: "View All",
    details: "Details",
    chat: "Chat",
    available: "Available",
    busy: "Busy",
    startingAt: "STARTING AT",
    
    // Features Section
    whyChoose: "Why choose Kaazbazar?",
    secureTransactions: "Secure Transactions",
    secureTransactionsDesc: "Your payments and information are always protected",
    qualityPros: "Quality Professionals",
    qualityProsDesc: "Hand-picked experts ready to deliver excellence",
    fastDelivery: "Fast Delivery",
    fastDeliveryDesc: "Get your projects done quickly and efficiently",
    
    // CTA Section
    readyToStart: "Ready to get started?",
    joinNow: "Join thousands of satisfied customers on Kaazbazar",
    signUpNow: "Sign Up Now",
    
    // Login Modal
    loginRequired: "Login Required",
    loginMessage: "Please login to view details or chat with service providers!",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    login: "Login",
    signUp: "Sign Up",
    orContinueWith: "Or continue with",
    continueWithGoogle: "Continue with Google",
    continueWithFacebook: "Continue with Facebook",
    noAccount: "Don't have an account?",
    alreadyAccount: "Already have an account?",
    joinHere: "Join here",
    termsAgreement: "By joining, you agree to the Kaazbazar Terms of Service",

     // CTA Section
    readyToStart: "Ready to get started?",
    joinNowText: "Join thousands of satisfied customers on Kaazbazar",
    signUpNow: "Join now",
    
    // Loading
    loading: "Loading..."
  },
  bengali: {
    // Navbar
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
    
    // Hero Section
    heroTitle: "আপনার প্রয়োজনীয় সেবা খুঁজুন",
    heroSubtitle: "দক্ষ পেশাদারদের সাথে সংযোগ করুন যারা আপনাকে সাহায্য করতে প্রস্তুত",
    searchButton: "খুঁজুন",
    serviceTypes: "সেবার ধরণ:",
    popularSearches: "জনপ্রিয় সার্চ:",
    
    // Categories
    electrician: "ইলেকট্রিশিয়ান",
    plumber: "প্লাম্বার",
    carpenter: "ছুতার",
    gardener: "মালী",
    painter: "পেইন্টার",
    handyman: "ফিটিং মিস্ত্রি",
    cleaner: "ক্লিনার",
    acTechnician: "এসি মিস্ত্রি",
    
    // Trust Section
    securePayments: "নিরাপদ পেমেন্ট",
    support247: "২৪/৭ সাপোর্ট",
    verifiedPros: "ভেরিফাইড প্রফেশনাল",
    moneyBack: "টাকা ফেরত গ্যারান্টি",
    
    // Dashboard
    welcomeBack: "স্বাগতম",
    activeListings: "এক্টিভ লিস্টিং",
    totalJobs: "মোট কাজ",
    messages: "বার্তা",
    goToDashboard: "ড্যাশবোর্ডে যান",
    
    // Services Section
    recommendedForYou: "আপনার জন্য সুপারিশকৃত",
    popularNearYou: "আপনার এলাকায় জনপ্রিয় সেবা",
    viewAll: "সব দেখুন",
    details: "বিস্তারিত",
    chat: "চ্যাট",
    available: "এভেইলেবল",
    busy: "ব্যস্ত",
    startingAt: "শুরু হচ্ছে",
    
    // Features Section
    whyChoose: "কেন কাজবাজার?",
    secureTransactions: "নিরাপদ লেনদেন",
    secureTransactionsDesc: "আপনার পেমেন্ট এবং তথ্য সম্পূর্ণ সুরক্ষিত",
    qualityPros: "দক্ষ পেশাদার",
    qualityProsDesc: "বাছাই করা বিশেষজ্ঞরা আপনার জন্য কাজ করবেন",
    fastDelivery: "দ্রুত সেবা",
    fastDeliveryDesc: "আপনার কাজ দ্রুত এবং নির্ভুলভাবে সম্পন্ন করুন",
    
    // CTA Section
    readyToStart: "শুরু করতে প্রস্তুত?",
    joinNow: "কাজবাজারে হাজারো সন্তুষ্ট গ্রাহকের সাথে যোগ দিন",
    signUpNow: "এখনই জয়েন করুন",
    
    // Login Modal
    loginRequired: "লগইন প্রয়োজন",
    loginMessage: "দয়া করে লগইন করুন বিস্তারিত দেখতে বা সেবাদাতাদের সাথে চ্যাট করতে!",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
    login: "লগইন",
    signUp: "সাইন আপ",
    orContinueWith: "অথবা কন্টিনিউ করুন",
    continueWithGoogle: "গুগল দিয়ে কন্টিনিউ করুন",
    continueWithFacebook: "ফেসবুক দিয়ে কন্টিনিউ করুন",
    noAccount: "কোনো একাউন্ট নেই?",
    alreadyAccount: "ইতিমধ্যে একাউন্ট আছে?",
    joinHere: "জয়েন করুন",
    termsAgreement: "জয়েন করার মাধ্যমে, আপনি কাজবাজারের টার্মস অফ সার্ভিসে সম্মত হচ্ছেন",

        // CTA Section
    readyToStart: "শুরু করতে প্রস্তুত?",
    joinNowText: "কাজবাজারে হাজারো সন্তুষ্ট গ্রাহকের সাথে যোগ দিন",
    signUpNow: "এখনই জয়েন করুন",
    
    // Loading
    loading: "লোড হচ্ছে..."
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("bengali"); // Default Bengali

  useEffect(() => {
    const savedLanguage = localStorage.getItem("kaazbazar_language");
    if (savedLanguage && (savedLanguage === "english" || savedLanguage === "bengali")) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === "english" ? "bengali" : "english";
    setLanguage(newLanguage);
    localStorage.setItem("kaazbazar_language", newLanguage);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}