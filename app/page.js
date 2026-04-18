"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServicesPage from "@/components/ServicesPage";
import CategoryFilters from "@/components/CategoryFilters";
import UserDashboard from "@/components/UserDashboard";
import LoginModal from "@/components/LoginModal";
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
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
        {/* Hero Section - Fiverr Style */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Find the perfect service for your business
              </h1>
              <p className="text-xl mb-8 text-green-50">
                Connect with skilled professionals ready to help you grow
              </p>
              
              {/* Big Search Bar - Fiverr Style */}
              <div className="bg-white rounded-lg shadow-lg p-1 flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  placeholder="What service are you looking for?"
                  className="flex-1 px-6 py-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                  Search
                </button>
              </div>
              
              {/* Popular Searches */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="text-sm text-green-100">Popular:</span>
                {['Logo Design', 'WordPress', 'Data Entry', 'SEO', 'Social Media'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setSearchQuery(item)}
                    className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full transition"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section - Fiverr Style */}
        <section className="py-12 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">Verified Professionals</span>
              </div>
            </div>
          </div>
        </section>

        {/* User Dashboard Section - Shows first when logged in */}
        {currentUser && (
          <div className="container mx-auto px-4 py-8">
            <UserDashboard currentUser={currentUser} />
          </div>
        )}
        
        {/* Category Filters */}
        <div className="container mx-auto px-4 py-8">
          <CategoryFilters 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
        
        {/* Services Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {currentUser ? "Recommended for you" : "Popular services near you"}
            </h2>
            <button className="text-green-600 hover:text-green-700 font-semibold">
              View All →
            </button>
          </div>
          
          <ServicesPage 
            selectedCategory={selectedCategory}
            currentUser={currentUser}
            onShowLogin={() => setShowLoginModal(true)}
            searchQuery={searchQuery}
          />
        </div>

        {/* Features Section - Fiverr Style */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Why choose Kaazbazar?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
                <p className="text-gray-600">Your payments and information are always protected</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Professionals</h3>
                <p className="text-gray-600">Hand-picked experts ready to deliver excellence</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Get your projects done quickly and efficiently</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Fiverr Style */}
        <section className="bg-green-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8 text-green-100">
              Join thousands of satisfied customers on Kaazbazar
            </p>
            {!currentUser && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Sign Up Now
              </button>
            )}
          </div>
        </section>
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