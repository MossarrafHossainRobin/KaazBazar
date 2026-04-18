"use client";
import { useState, useEffect } from "react";
import { Star, MapPin, Clock, MessageCircle, Info, TrendingUp } from "lucide-react";

const servicesData = [
  { id: 1, name: "John Electrician", category: "Electrician", price: "$50", rating: 4.8, location: "Dhaka", experience: "5 years", image: "⚡", available: true, orders: 234, level: "Level 2" },
  { id: 2, name: "Mike Plumber", category: "Plumber", price: "$45", rating: 4.9, location: "Dhaka", experience: "7 years", image: "🔧", available: true, orders: 189, level: "Level 2" },
  { id: 3, name: "David Carpenter", category: "Carpenter", price: "$40", rating: 4.7, location: "Chittagong", experience: "4 years", image: "🪚", available: false, orders: 56, level: "Level 1" },
  { id: 4, name: "Sarah Gardener", category: "Gardener", price: "$35", rating: 4.9, location: "Sylhet", experience: "6 years", image: "🌱", available: true, orders: 312, level: "Top Rated" },
  { id: 5, name: "Tech Solutions", category: "Others", price: "$60", rating: 4.8, location: "Dhaka", experience: "8 years", image: "💻", available: true, orders: 567, level: "Top Rated" },
  { id: 6, name: "Robert Electrician", category: "Electrician", price: "$55", rating: 4.6, location: "Khulna", experience: "3 years", image: "⚡", available: true, orders: 123, level: "Level 1" },
  { id: 7, name: "Alice Plumber", category: "Plumber", price: "$48", rating: 4.9, location: "Dhaka", experience: "5 years", image: "🔧", available: true, orders: 245, level: "Level 2" },
  { id: 8, name: "Tom Carpenter", category: "Carpenter", price: "$42", rating: 4.7, location: "Rajshahi", experience: "6 years", image: "🪚", available: true, orders: 178, level: "Level 2" },
  { id: 9, name: "Green Garden", category: "Gardener", price: "$38", rating: 4.8, location: "Dhaka", experience: "4 years", image: "🌱", available: true, orders: 92, level: "Level 1" },
  { id: 10, name: "Home Services", category: "Others", price: "$70", rating: 4.5, location: "Chittagong", experience: "10 years", image: "🏠", available: true, orders: 445, level: "Top Rated" }
];

export default function ServicesPage({ selectedCategory, currentUser, onShowLogin, searchQuery = "" }) {
  const [services, setServices] = useState(servicesData);

  const handleViewDetails = (serviceName) => {
    if (!currentUser) {
      onShowLogin();
    } else {
      alert(`📋 Showing details for: ${serviceName}\n\nContact: ${serviceName}@example.com\nPhone: +880 1XXX XXXXXX\nExperience: 5+ years\nLocation: Dhaka, Bangladesh`);
    }
  };

  const handleChat = (serviceName) => {
    if (!currentUser) {
      onShowLogin();
    } else {
      alert(`💬 Starting chat with ${serviceName}\n\nAs a logged-in user, you can now discuss your requirements directly!`);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filteredServices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-500 text-lg">No services found matching your criteria</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or category filter</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredServices.map((service) => (
        <div key={service.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          {/* Service Image/Icon */}
          <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-7xl">
            {service.image}
            {/* Level Badge */}
            <div className="absolute top-3 left-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                service.level === 'Top Rated' ? 'bg-yellow-500 text-white' :
                service.level === 'Level 2' ? 'bg-green-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {service.level}
              </span>
            </div>
            {/* Quick Action */}
            <button className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition">
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div className="p-4">
            {/* Seller Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                  {service.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{service.name}</p>
                  <p className="text-xs text-gray-500">{service.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold text-sm">{service.rating}</span>
                <span className="text-xs text-gray-400">({service.orders})</span>
              </div>
            </div>
            
            {/* Service Title */}
            <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
              I will provide professional {service.category.toLowerCase()} services
            </h3>
            
            {/* Service Features */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{service.experience} exp</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{service.orders}+ orders</span>
              </div>
            </div>
            
            {/* Price and Action */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">STARTING AT</p>
                <p className="text-xl font-bold text-green-600">{service.price}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(service.name)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:border-green-600 hover:text-green-600 transition"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleChat(service.name)}
                  className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Heart icon component
function Heart(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}