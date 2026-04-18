"use client";
import { useState } from "react";
import { Star, MapPin, Clock, MessageCircle, Info } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const servicesData = [
  { id: 1, name: "Rahim Electrician", category: "Electrician", price: "৳500", rating: 4.8, location: "Dhaka", experience: "5 years", available: true, orders: 234 },
  { id: 2, name: "Karim Plumber", category: "Plumber", price: "৳450", rating: 4.9, location: "Dhaka", experience: "7 years", available: true, orders: 189 },
  { id: 3, name: "Salam Carpenter", category: "Carpenter", price: "৳400", rating: 4.7, location: "Chittagong", experience: "4 years", available: false, orders: 56 },
  { id: 4, name: "Rafiq Gardener", category: "Gardener", price: "৳350", rating: 4.9, location: "Sylhet", experience: "6 years", available: true, orders: 312 },
  { id: 5, name: "Jabbar Painter", category: "Painter", price: "৳600", rating: 4.8, location: "Dhaka", experience: "8 years", available: true, orders: 567 },
  { id: 6, name: "Shahid Handyman", category: "Handyman", price: "৳550", rating: 4.6, location: "Khulna", experience: "3 years", available: true, orders: 123 }
];

export default function ServicesPage({ selectedCategory, currentUser, onShowLogin, searchQuery = "" }) {
  const [services] = useState(servicesData);
  const { t } = useLanguage();

  const handleViewDetails = (serviceName) => {
    if (!currentUser) {
      onShowLogin();
    } else {
      alert(`${t.details} for: ${serviceName}`);
    }
  };

  const handleChat = (serviceName) => {
    if (!currentUser) {
      onShowLogin();
    } else {
      alert(`${t.chat} with ${serviceName}`);
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
        <p className="text-gray-500 text-lg">কোন সেবা পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredServices.map((service) => (
        <div key={service.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-black">{service.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                service.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {service.available ? t.available : t.busy}
              </span>
            </div>
            
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{service.location}</span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold ml-1">{service.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({service.experience})</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">ফুল-টাইম</span>
              </div>
            </div>
            
            <div className="text-xl font-bold text-black mb-4">
              {service.price} <span className="text-sm font-normal text-gray-500">/ঘন্টা</span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleViewDetails(service.name)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm"
              >
                <Info className="w-4 h-4" /> {t.details}
              </button>
              <button
                onClick={() => handleChat(service.name)}
                className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4" /> {t.chat}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}