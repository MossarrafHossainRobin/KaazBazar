// app/explore/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Filter, Star, MapPin, Clock, MessageCircle, Calendar, X } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 2000,
    minRating: 0,
    city: ""
  });

  const categories = [
    { id: "all", name: "All Services", icon: "🔍" },
    { id: "electrician", name: "Electrician", icon: "⚡" },
    { id: "plumber", name: "Plumber", icon: "🔧" },
    { id: "carpenter", name: "Carpenter", icon: "🪚" },
    { id: "painter", name: "Painter", icon: "🎨" },
    { id: "gardener", name: "Gardener", icon: "🌱" },
    { id: "cleaning", name: "Cleaning", icon: "🧹" },
    { id: "ac-repair", name: "AC Repair", icon: "❄️" },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, searchTerm, selectedCategory, filters]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/mongo/services');
      const result = await response.json();
      if (result.success) {
        setServices(result.data);
        setFilteredServices(result.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name?.toLowerCase().includes(term) ||
        s.category?.toLowerCase().includes(term) ||
        s.city?.toLowerCase().includes(term)
      );
    }

    // Price filter
    filtered = filtered.filter(s =>
      (s.hourlyRate || 500) >= filters.minPrice &&
      (s.hourlyRate || 500) <= filters.maxPrice
    );

    // Rating filter
    filtered = filtered.filter(s => (s.rating || 0) >= filters.minRating);

    // City filter
    if (filters.city) {
      filtered = filtered.filter(s =>
        s.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const resetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 2000,
      minRating: 0,
      city: ""
    });
    setSelectedCategory("all");
    setSearchTerm("");
  };

  const handleBookNow = (serviceId) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    router.push(`/booking/${serviceId}`);
  };

  const handleChat = (providerId) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    const conversationId = `${currentUser.uid}_${providerId}`;
    sessionStorage.setItem("activeConversationId", conversationId);
    router.push("/dashboard?tab=messages");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Explore Services</h1>
            <p className="text-gray-500 mt-1">Find the best professionals in your area</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat.id
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Filter Services</h3>
                <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (BDT)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value) || 2000})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4}>4 Stars & Up</option>
                    <option value={4.5}>4.5 Stars & Up</option>
                    <option value={4.8}>4.8 Stars & Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={resetFilters} className="px-4 py-2 text-gray-600 hover:text-gray-900">Reset</button>
                <button onClick={() => setFilterOpen(false)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Apply</button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">{filteredServices.length} services available</p>
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-500">No services found. Try adjusting your filters.</p>
              <button onClick={resetFilters} className="mt-4 text-green-600 hover:text-green-700">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{service.name}</h3>
                        <p className="text-sm text-gray-500">{service.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{service.rating || 4.5}</span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{service.city || "Dhaka"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{service.experience || "3"} years experience</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-xs text-gray-400">Starting from</p>
                      <p className="text-2xl font-bold text-green-600">৳{service.hourlyRate || 500}<span className="text-sm font-normal text-gray-500">/hr</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleChat(service.userId || service.id)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-green-600 hover:text-green-600 transition"
                      >
                        <MessageCircle className="w-4 h-4 inline mr-1" />
                        Chat
                      </button>
                      <button
                        onClick={() => handleBookNow(service.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                      >
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}