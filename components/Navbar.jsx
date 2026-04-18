"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, User, LogOut, Menu, X, Briefcase, MessageCircle, Home } from "lucide-react";

export default function Navbar({ currentUser, onLogout, onShowLogin, searchQuery, setSearchQuery }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-600">
              Kaazbazar
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              Local
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-green-600 transition flex items-center gap-1">
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link href="/services" className="text-gray-600 hover:text-green-600 transition flex items-center gap-1">
              <Briefcase className="w-4 h-4" /> Services
            </Link>
            {currentUser && (
              <Link href="/messages" className="text-gray-600 hover:text-green-600 transition flex items-center gap-1">
                <MessageCircle className="w-4 h-4" /> Messages
              </Link>
            )}
          </div>
          
          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 focus:outline-none">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-gray-700">{currentUser.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block border border-gray-100">
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                    <User className="inline w-4 h-4 mr-2" /> Profile
                  </Link>
                  <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                    My Orders
                  </Link>
                  <hr className="my-1" />
                  <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50">
                    <LogOut className="inline w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onShowLogin}
                  className="text-gray-600 hover:text-green-600 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={onShowLogin}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Join
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <Link href="/" className="block py-2 text-gray-600 hover:text-green-600">
              Home
            </Link>
            <Link href="/services" className="block py-2 text-gray-600 hover:text-green-600">
              Services
            </Link>
            {currentUser && (
              <Link href="/messages" className="block py-2 text-gray-600 hover:text-green-600">
                Messages
              </Link>
            )}
            {currentUser ? (
              <>
                <Link href="/profile" className="block py-2 text-gray-600">
                  Profile
                </Link>
                <Link href="/orders" className="block py-2 text-gray-600">
                  My Orders
                </Link>
                <button onClick={onLogout} className="block w-full text-left py-2 text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={onShowLogin} className="block w-full text-left py-2 text-green-600 font-semibold">
                  Sign In
                </button>
                <button onClick={onShowLogin} className="block w-full text-left py-2 bg-green-600 text-white px-4 rounded-lg mt-2">
                  Join Now
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}