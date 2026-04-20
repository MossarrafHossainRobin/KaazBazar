"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Star, 
  MapPin, 
  Clock, 
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Users,
  Calendar,
  Circle,
  XCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllServiceProviders } from "@/lib/firestoreService";
import { getOrCreateConversation } from "@/lib/chatService";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";

const categories = [
  { id: "all", name: "All", slug: "all" },
  { id: "electrician", name: "Electrician", slug: "electrician" },
  { id: "plumber", name: "Plumber", slug: "plumber" },
  { id: "carpenter", name: "Carpenter", slug: "carpenter" },
  { id: "gardener", name: "Gardener", slug: "gardener" },
  { id: "others", name: "Others", slug: "others" }
];

const ITEMS_PER_PAGE = 20;
const getCategoryBySlug = (slug) => {
  return categories.find(cat => cat.slug === slug) || categories[0];
};

// Skeleton Loader
const ProviderSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-100"></div>
    <div className="p-4">
      <div className="flex justify-center mb-3">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="w-28 h-5 bg-gray-200 rounded mx-auto mb-2"></div>
      <div className="w-20 h-4 bg-gray-200 rounded mx-auto mb-3"></div>
      <div className="flex justify-center gap-2 mb-3">
        <div className="w-14 h-3 bg-gray-200 rounded"></div>
        <div className="w-14 h-3 bg-gray-200 rounded"></div>
      </div>
      <div className="w-20 h-6 bg-gray-200 rounded mx-auto mb-4"></div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
        <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
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

  // Fetch active status for each provider from users collection
  const fetchActiveStatus = async (provider) => {
    try {
      const userRef = doc(db, "users", provider.userId || provider.id);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.isActive !== false;
      }
      return true;
    } catch (error) {
      console.error("Error fetching active status:", error);
      return true;
    }
  };

  useEffect(() => {
    fetchAndFilterProviders();
  }, [categorySlug]);

  useEffect(() => {
    applyFilters();
  }, [providers, filters]);

  const fetchAndFilterProviders = async () => {
    setLoading(true);
    const result = await getAllServiceProviders(null);
    if (result.success) {
      const providersWithStatus = await Promise.all(
        result.data.map(async (provider) => {
          const isActive = await fetchActiveStatus(provider);
          return { ...provider, isActive };
        })
      );
      setProviders(providersWithStatus);
      
      let filtered = [...providersWithStatus];
      if (categorySlug !== "all") {
        filtered = filtered.filter(p => 
          p.category?.toLowerCase() === categorySlug.toLowerCase()
        );
      }
      setFilteredProviders(filtered);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...providers];
    
    if (categorySlug !== "all") {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase() === categorySlug.toLowerCase()
      );
    }
    
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

  const handleChat = async (provider) => {
    if (!currentUser) {
      router.push("/Login");
      return;
    }
    
    try {
      const currentUserData = {
        name: currentUser.name,
        photoURL: currentUser.photoURL,
        email: currentUser.email
      };
      
      const providerData = {
        name: provider.name,
        photoURL: provider.photoURL,
        email: provider.email
      };
      
      const conversation = await getOrCreateConversation(
        currentUser.uid,
        provider.userId || provider.id,
        providerData,
        currentUserData
      );
      
      if (conversation && conversation.id) {
        localStorage.setItem("activeConversationId", conversation.id);
        router.push("/dashboard?tab=messages");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-600 mb-4 transition text-sm">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentCategory.name} Services</h1>
              <p className="text-gray-500 mt-1">
                Find the best {currentCategory.name.toLowerCase()} professionals in your area
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-full shadow-sm">
                <Users className="w-4 h-4" />
                <span>{filteredProviders.length} Providers</span>
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 pb-4 border-b border-gray-100">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                categorySlug === category.slug
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Filter Providers</h3>
              <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (BDT)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4 Stars & Up</option>
                  <option value={4.5}>4.5 Stars & Up</option>
                  <option value={4.8}>4.8 Stars & Up</option>
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
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
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
            <span className="font-semibold text-green-600">{filteredProviders.length}</span> professionals available
          </p>
          {filteredProviders.length > 0 && (
            <p className="text-xs text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Providers Grid - 5 cards in a row */}
        {filteredProviders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No professionals found</h3>
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
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
                >
                  {/* Profile Image Section - Centered */}
                  <div className="relative pt-6 pb-3 bg-gradient-to-b from-gray-50 to-white">
                    {/* Profile Picture - Centered Circle */}
                    <div className="flex justify-center">
                      {provider.photoURL ? (
                        <img 
                          src={provider.photoURL} 
                          alt={provider.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Active Status Badge - Top Right */}
                    <div className="absolute top-2 right-2">
                      {provider.isActive !== false ? (
                        <div className="flex items-center gap-1 bg-green-50 rounded-full px-2 py-0.5 shadow-sm border border-green-200">
                          <Circle className="w-2.5 h-2.5 text-green-500 fill-green-500 animate-pulse" />
                          <span className="text-xs font-medium text-green-600">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-red-50 rounded-full px-2 py-0.5 shadow-sm border border-red-200">
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-xs font-medium text-red-600">Inactive</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Rating Badge - Bottom Right */}
                    <div className="absolute bottom-2 right-2 bg-white rounded-full px-2 py-0.5 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-semibold text-gray-800">{provider.rating || 4.5}</span>
                        <span className="text-xs text-gray-500">({provider.totalBookings || 0})</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 pt-2 text-center">
                    {/* Provider Name */}
                    <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-green-600 transition-colors truncate">
                      {provider.name}
                    </h3>
                    
                    {/* Category */}
                    <p className="text-xs text-gray-500 mb-2">{provider.category}</p>

                    {/* Location & Experience */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-3">
                      <div className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{provider.city || "Dhaka"}</span>
                      </div>
                      <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
                      <div className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{provider.experience || "3"}y</span>
                      </div>
                    </div>

                    {/* Price - No "/hour" text */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Starting from</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-xl font-bold text-green-600">৳{provider.hourlyRate || 500}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleChat(provider)}
                        className="flex-1 px-2 py-1.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-medium hover:border-green-600 hover:text-green-600 transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Chat
                      </button>
                      <button
                        onClick={() => handleBookNow(provider)}
                        className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-xl text-xs font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {currentPage > 2 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    1
                  </button>
                )}
                
                {currentPage > 3 && <span className="px-3 py-2 text-gray-400">...</span>}
                
                {currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    {currentPage - 1}
                  </button>
                )}
                
                <button className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm shadow-md">
                  {currentPage}
                </button>
                
                {currentPage < totalPages && (
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    {currentPage + 1}
                  </button>
                )}
                
                {currentPage < totalPages - 2 && <span className="px-3 py-2 text-gray-400">...</span>}
                
                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition"
                  >
                    {totalPages}
                  </button>
                )}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
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