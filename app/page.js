"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesPage from "@/components/ServicesPage";
import CategoryFilters from "@/components/CategoryFilters";
import UserDashboard from "@/components/UserDashboard";
import LoginModal from "@/components/LoginModal";
import HeroSection from "@/components/HeroSection";
import CTA from "@/components/CTA";
import { auth, onAuthStateChanged, signOut } from "@/lib/firebase";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          listings: 3,
          sales: 8,
          messages: 5
        };
        setCurrentUser(userData);
        localStorage.setItem("kaazbazar_user", JSON.stringify(userData));
      } else {
        setCurrentUser(null);
        localStorage.removeItem("kaazbazar_user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setShowLoginModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onShowLogin={() => setShowLoginModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* User Dashboard Section */}
        {currentUser && (
          <div className="container mx-auto px-4 py-8">
            <UserDashboard currentUser={currentUser} />
          </div>
        )}
        
        {/* Category Filters */}
        <div className="container mx-auto px-4 py-6">
          <CategoryFilters 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
        
        {/* Services Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-black">
              {currentUser ? "Recommended for you" : "Popular services near you"}
            </h2>
            <button className="text-gray-600 hover:text-black font-medium text-sm">
              View all →
            </button>
          </div>
          
          <ServicesPage 
            selectedCategory={selectedCategory}
            currentUser={currentUser}
            onShowLogin={() => setShowLoginModal(true)}
            searchQuery={searchQuery}
          />
        </div>

        {/* Features Section */}
        <section className="bg-gray-50 py-12 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-black mb-8">
              Why Kaazbazar?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">Secure transactions</h3>
                <p className="text-gray-600 text-sm">Your payments and information are completely secure.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">Skilled professionals</h3>
                <p className="text-gray-600 text-sm">Selected experts will work for you</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-1">Fast service</h3>
                <p className="text-gray-600 text-sm">Get your work done quickly and accurately.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Component - শুধু নন-লগইন ইউজারের জন্য দেখাবে */}
        {!currentUser && (
          <CTA onJoinClick={() => setShowLoginModal(true)} />
        )}
      </main>
      
      <Footer />
      
      {showLoginModal && (
        <LoginModal 
          show={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}