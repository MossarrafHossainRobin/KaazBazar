"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Star, 
  MapPin, 
  Clock, 
  Briefcase, 
  Award,
  Shield,
  ChevronLeft,
  MessageCircle,
  ChevronRight,
  Filter,
  X,
  Loader2,
  TrendingUp,
  Users,
  ThumbsUp,
  CheckCircle,
  Phone,
  Heart
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllServiceProviders } from "@/lib/firestoreService";
import { getOrCreateConversation } from "@/lib/chatService";

// Categories data
const categories = [
  { id: "all", name: "All", icon: "📋", slug: "all" },
  { id: "electrician", name: "Electrician", icon: "⚡", slug: "electrician" },
  { id: "plumber", name: "Plumber", icon: "🔧", slug: "plumber" },
  { id: "carpenter", name: "Carpenter", icon: "🪚", slug: "carpenter" },
  { id: "gardener", name: "Gardener", icon: "🌱", slug: "gardener" },
  { id: "others", name: "Others", icon: "📦", slug: "others" }
];

const ITEMS_PER_PAGE = 20;
const getCategoryBySlug = (slug) => {
  return categories.find(cat => cat.slug === slug) || categories[0];
};

// Skeleton Loader Component
const ProviderSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-24 h-3 bg-gray-200 rounded mt-2"></div>
        </div>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
      <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="w-20 h-6 bg-gray-200 rounded"></div>
        <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export default function ServiceCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 2000,
    minRating: 0,
    sortBy: "rating",
    city: ""
  });
  
  const categorySlug = params?.category || "all";
  const currentCategory = getCategoryBySlug(categorySlug);
  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProviders = filteredProviders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    fetchProviders();
  }, [categorySlug]);

  useEffect(() => {
    applyFilters();
  }, [providers, filters]);

  const fetchProviders = async () => {
    setLoading(true);
    const categoryId = categorySlug === "all" ? null : categorySlug;
    const result = await getAllServiceProviders(categoryId);
    if (result.success) {
      setProviders(result.data);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...providers];
    
    filtered = filtered.filter(p => 
      (p.hourlyRate || 500) >= filters.minPrice && 
      (p.hourlyRate || 500) <= filters.maxPrice
    );
    
    filtered = filtered.filter(p => (p.rating || 0) >= filters.minRating);
    
    if (filters.city) {
      filtered = filtered.filter(p => 
        p.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    
    switch(filters.sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "price_low":
        filtered.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
        break;
      case "price_high":
        filtered.sort((a, b) => (b.hourlyRate || 0) - (a.hourlyRate || 0));
        break;
      case "experience":
        filtered.sort((a, b) => parseInt(b.experience || 0) - parseInt(a.experience || 0));
        break;
      default:
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    
    setFilteredProviders(filtered);
    setCurrentPage(1);
  };

  const handleCategoryChange = (slug) => {
    router.push(`/services/${slug}`);
  };

  const getCategoryIcon = (categoryName) => {
    const cat = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
    return cat?.icon || "🔧";
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 2000,
      minRating: 0,
      sortBy: "rating",
      city: ""
    });
  };

  // Fixed Chat handler
  const handleChat = async (provider) => {
    if (!currentUser) {
      router.push("/Login");
      return;
    }
    
    try {
      // Prepare current user data
      const currentUserData = {
        name: currentUser.name,
        photoURL: currentUser.photoURL,
        email: currentUser.email
      };
      
      // Prepare provider data
      const providerData = {
        name: provider.name,
        photoURL: provider.photoURL,
        email: provider.email
      };
      
      // Create or get existing conversation with 4 parameters
      const conversation = await getOrCreateConversation(
        currentUser.uid,
        provider.userId || provider.id,
        providerData,
        currentUserData
      );
      
      if (conversation && conversation.id) {
        // Store conversation ID in localStorage
        localStorage.setItem("activeConversationId", conversation.id);
        // Redirect to dashboard with messages tab
        router.push("/dashboard?tab=messages");
      } else {
        console.error("Failed to create/get conversation");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // Book Now handler
  const handleBookNow = (provider) => {
    if (!currentUser) {
      router.push("/Login");
      return;
    }
    router.push(`/booking/${provider.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-64 h-4 bg-gray-200 rounded mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {[...Array(10)].map((_, i) => (
              <ProviderSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 mb-4 transition text-sm">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{currentCategory.icon}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentCategory.name} Services</h1>
                <p className="text-gray-500 mt-1">
                  Find the best {currentCategory.name.toLowerCase()} professionals in your area
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                <Users className="w-4 h-4" />
                <span>{filteredProviders.length} Providers</span>
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="border-b border-gray-200 mb-6 pb-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  categorySlug === category.slug
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="bg-gray-50 rounded-xl p-5 mb-6 animate-fadeIn border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Filter Providers</h3>
              <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (৳)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value) || 2000})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={4.8}>4.8+ Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="rating">Top Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-5 flex justify-between items-center flex-wrap gap-2">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-green-600">{filteredProviders.length}</span> services available
          </p>
          {filteredProviders.length > 0 && (
            <p className="text-xs text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Providers Grid */}
        {filteredProviders.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No service providers found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {currentProviders.map((provider, index) => (
                <div 
                  key={provider.id} 
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gray-100">
                    {provider.photoURL ? (
                      <img 
                        src={provider.photoURL} 
                        alt={provider.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                        <span className="text-5xl font-bold text-green-600">
                          {provider.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {/* Level Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="text-xs font-semibold bg-white px-2 py-1 rounded-full shadow-sm">
                        {provider.topRated ? "⭐ Top Rated" : provider.verified ? "✓ Verified" : "Level 1"}
                      </span>
                    </div>
                    {/* Save Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 transition">
                      <Heart className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Seller Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {provider.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{provider.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium">{provider.rating || 4.5}</span>
                          <span className="text-xs text-gray-400">({provider.totalBookings || 0})</span>
                        </div>
                      </div>
                    </div>

                    {/* Service Title */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      I will provide professional {provider.category?.toLowerCase()} services
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                      <MapPin className="w-3 h-3" />
                      <span>{provider.city || "Dhaka"}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">STARTING AT</p>
                        <p className="text-lg font-bold text-green-600">৳{provider.hourlyRate || 500}</p>
                      </div>
                      <button
                        onClick={() => handleChat(provider)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 transition flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {currentPage > 2 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    1
                  </button>
                )}
                
                {currentPage > 3 && <span className="px-2 py-2 text-gray-400">...</span>}
                
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    {currentPage - 1}
                  </button>
                )}
                
                <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">
                  {currentPage}
                </button>
                
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    {currentPage + 1}
                  </button>
                )}
                
                {currentPage < totalPages - 2 && <span className="px-2 py-2 text-gray-400">...</span>}
                
                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    {totalPages}
                  </button>
                )}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}