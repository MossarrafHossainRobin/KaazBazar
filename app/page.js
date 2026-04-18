"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesPage from "@/components/ServicesPage";
import CategoryFilters from "@/components/CategoryFilters";
import UserDashboard from "@/components/UserDashboard";
import LoginModal from "@/components/LoginModal";
import HeroSection from "@/components/HeroSection";
import WhyKaazbazar from "@/components/WhyKaazbazar";
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

        {/* Why Kaazbazar Component */}
        <WhyKaazbazar />

        {/* CTA Component - শুধু নন-লগইন ইউজারের জন্য */}
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