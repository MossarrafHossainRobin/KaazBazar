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
  ThumbsUp
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getAllServiceProviders } from "@/lib/firestoreService";

// Categories data
const categories = [
  { id: "all", name: "All", icon: "📋", slug: "all", color: "bg-gray-600" },
  { id: "electrician", name: "Electrician", icon: "⚡", slug: "electrician", color: "bg-yellow-600" },
  { id: "plumber", name: "Plumber", icon: "🔧", slug: "plumber", color: "bg-blue-600" },
  { id: "carpenter", name: "Carpenter", icon: "🪚", slug: "carpenter", color: "bg-orange-600" },
  { id: "gardener", name: "Gardener", icon: "🌱", slug: "gardener", color: "bg-green-600" },
  { id: "others", name: "Others", icon: "📦", slug: "others", color: "bg-purple-600" }
];

const ITEMS_PER_PAGE = 6;

const getCategoryBySlug = (slug) => {
  return categories.find(cat => cat.slug === slug) || categories[0];
};

// Skeleton Loader Component
const ProviderSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="h-28 bg-gray-300"></div>
    <div className="p-4 pt-10">
      <div className="flex justify-between items-start">
        <div>
          <div className="w-32 h-5 bg-gray-300 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded mt-2"></div>
        </div>
        <div className="text-right">
          <div className="w-16 h-6 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="w-40 h-4 bg-gray-200 rounded"></div>
        <div className="w-32 h-4 bg-gray-200 rounded"></div>
        <div className="w-36 h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="flex-1 h-9 bg-gray-300 rounded-lg"></div>
        <div className="flex-1 h-9 bg-gray-200 rounded-lg"></div>
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
    
    // Price filter
    filtered = filtered.filter(p => 
      (p.hourlyRate || 500) >= filters.minPrice && 
      (p.hourlyRate || 500) <= filters.maxPrice
    );
    
    // Rating filter
    filtered = filtered.filter(p => (p.rating || 0) >= filters.minRating);
    
    // City filter
    if (filters.city) {
      filtered = filtered.filter(p => 
        p.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    
    // Sort
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

  const getCategoryColor = (categoryName) => {
    const cat = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase());
    return cat?.color || "bg-gray-600";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProviderSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-4 transition">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 ${getCategoryColor(currentCategory.name)} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                {currentCategory.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{currentCategory.name} Services</h1>
                <p className="text-gray-500 mt-1">
                  Find the best {currentCategory.name.toLowerCase()} professionals in your area
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-lg shadow-sm">
                <Users className="w-4 h-4" />
                <span>{filteredProviders.length} Providers</span>
              </div>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  categorySlug === category.slug
                    ? `${category.color} text-white shadow-md`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Filter Providers</h3>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value) || 2000})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
        <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
          <p className="text-gray-600">
            Found <span className="font-semibold text-green-600">{filteredProviders.length}</span> service providers
          </p>
          {filteredProviders.length > 0 && (
            <p className="text-sm text-gray-400">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredProviders.length)} of {filteredProviders.length}
            </p>
          )}
        </div>

        {/* Providers Grid */}
        {filteredProviders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProviders.map((provider, index) => (
                <div 
                  key={provider.id} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Provider Header with Cover Image */}
                  <div className={`relative h-32 bg-gradient-to-r ${getCategoryColor(provider.category)} to-green-700`}>
                    {/* Profile Image */}
                    <div className="absolute -bottom-8 left-4">
                      {provider.photoURL ? (
                        <img 
                          src={provider.photoURL} 
                          alt={provider.name}
                          className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-md">
                          <span className="text-2xl font-bold text-green-600">
                            {provider.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
                      <span className="text-xs font-medium text-gray-700">
                        {getCategoryIcon(provider.category)} {provider.category}
                      </span>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium text-gray-700">{provider.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="p-4 pt-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 hover:text-green-600 transition">
                          {provider.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{provider.rating || 4.5}</span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{provider.totalBookings || 0}+ bookings</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">৳{provider.hourlyRate || 500}</p>
                        <p className="text-xs text-gray-400">per hour</p>
                      </div>
                    </div>

                    {/* Location & Experience */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-sm">{provider.city || "Dhaka"}, {provider.area || "Uttara"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm">{provider.experience || "3"} years experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span className="text-sm">{provider.completedJobs || 0}+ jobs completed</span>
                      </div>
                    </div>

                    {/* Services Offered */}
                    {provider.services && provider.services.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {provider.services.slice(0, 2).map((service, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {service}
                          </span>
                        ))}
                        {provider.services.length > 2 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{provider.services.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {provider.verified && (
                        <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          <Shield className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {provider.topRated && (
                        <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full">
                          <Award className="w-3 h-3" /> Top Rated
                        </span>
                      )}
                      {(provider.rating || 0) >= 4.8 && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                          <ThumbsUp className="w-3 h-3" /> Highly Rated
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition transform hover:scale-[1.02]">
                        Book Now
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-1">
                        <MessageCircle className="w-4 h-4" /> Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show limited pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm transition ${
                          currentPage === page
                            ? "bg-green-600 text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 py-2">...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
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