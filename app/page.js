"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesPage from "@/components/ServicesPage";
import ServiceCards from "@/components/ServiceCards";
import LoginModal from "@/components/LoginModal";
import HeroSection from "@/components/HeroSection";
import WhyKaazbazar from "@/components/WhyKaazbazar";
import CTA from "@/components/CTA";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { currentUser, loading, logout, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = (userData) => {
    setShowLoginModal(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
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
        <HeroSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Service Cards - visible to everyone */}
        <ServiceCards />
        
        <div className="container mx-auto px-4 pb-16">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-black">
              {currentUser ? "Recommended for you" : "Popular services near you"}
            </h2>
        
          </div>
          
          <ServicesPage 
            selectedCategory="all"
            currentUser={currentUser}
            onShowLogin={() => setShowLoginModal(true)}
            searchQuery={searchQuery}
          />
        </div>

        <WhyKaazbazar />

        {!currentUser && (
          <CTA onJoinClick={() => setShowLoginModal(true)} />
        )}
      </main>
      
      <Footer />
      
      <LoginModal 
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}