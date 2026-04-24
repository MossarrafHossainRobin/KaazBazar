"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  XCircle,
  Heart,
  Search
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAllServiceProviders } from "@/lib/firestoreService";
import { getOrCreateConversation } from "@/lib/chatService";
import { db } from "@/lib/firebaseClient";
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs,
  query,
  where
} from "firebase/firestore";

const categories = [
  { id: "all", name: "All", slug: "all" },
  { id: "electrician", name: "Electrician", slug: "electrician" },
  { id: "plumber", name: "Plumber", slug: "plumber" },
  { id: "carpenter", name: "Carpenter", slug: "carpenter" },
  { id: "gardener", name: "Gardener", slug: "gardener" },
  { id: "painter", name: "Painter", slug: "painter" },
  { id: "cleaning", name: "Cleaning", slug: "cleaning" },
  { id: "ac-repair", name: "AC Repair", slug: "ac-repair" },
  { id: "others", name: "Others", slug: "others" }
];

const ITEMS_PER_PAGE = 12;

// Cache for user profiles and ratings
const userProfileCache = new Map();
const ratingsCache = new Map();

export default function ServiceCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedItems, setSavedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 2000,
    minRating: 0,
    sortBy: "rating",
    city: ""
  });
  
  const categorySlug = params?.category || "all";
  const currentCategory = categories.find(c => c.slug === categorySlug) || categories[0];
  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProviders = filteredProviders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Safe search handler
  const handleSearchChange = (e) => {
    const value = e.target.value || "";
    setSearchTerm(value);
  };

  // Fetch real ratings for a provider
  const fetchProviderRatings = async (providerId) => {
    if (ratingsCache.has(providerId)) {
      return ratingsCache.get(providerId);
    }
    
    try {
      const ratingsRef = collection(db, "ratings");
      const q = query(ratingsRef, where("providerId", "==", providerId));
      const ratingsSnap = await getDocs(q);
      
      let totalRating = 0;
      let reviewCount = 0;
      
      ratingsSnap.forEach(doc => {
        const rating = doc.data().rating;
        totalRating += rating;
        reviewCount++;
      });
      
      const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 4.5;
      const result = {
        rating: parseFloat(averageRating),
        reviewCount: reviewCount
      };
      
      ratingsCache.set(providerId, result);
      return result;
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return { rating: 4.5, reviewCount: 0 };
    }
  };

  // Fetch saved items for current user
  useEffect(() => {
    if (currentUser) {
      fetchSavedItems();
    }
  }, [currentUser]);

  const fetchSavedItems = async () => {
    try {
      const savedRef = collection(db, "users", currentUser.uid, "savedItems");
      const savedSnap = await getDocs(savedRef);
      const saved = new Set(savedSnap.docs.map(doc => doc.id));
      setSavedItems(saved);
    } catch (error) {
      console.error("Error fetching saved items:", error);
    }
  };

  // Toggle save item
  const toggleSaveItem = async (providerId) => {
    if (!currentUser) {
      router.push("/Login");
      return;
    }

    const wasSaved = savedItems.has(providerId);
    if (wasSaved) {
      setSavedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(providerId);
        return newSet;
      });
    } else {
      setSavedItems(prev => new Set([...prev, providerId]));
    }

    try {
      const savedRef = doc(db, "users", currentUser.uid, "savedItems", providerId);
      if (wasSaved) {
        await deleteDoc(savedRef);
      } else {
        await setDoc(savedRef, {
          providerId,
          savedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      if (wasSaved) {
        setSavedItems(prev => new Set([...prev, providerId]));
      } else {
        setSavedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(providerId);
          return newSet;
        });
      }
      console.error("Error toggling save:", error);
    }
  };

  // Fetch user profile with caching
  const fetchUserProfile = useCallback(async (userId) => {
    if (userProfileCache.has(userId)) {
      return userProfileCache.get(userId);
    }
    
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const profile = {
          isActive: userData.isActive !== false,
          photoURL: userData.photoURL,
          phone: userData.phone,
          name: userData.name
        };
        userProfileCache.set(userId, profile);
        return profile;
      }
      return { isActive: true };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return { isActive: true };
    }
  }, []);

  // Fetch service providers with real ratings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getAllServiceProviders(null);
        if (result.success) {
          const providersWithDetails = await Promise.all(
            result.data.map(async (provider) => {
              const userId = provider.userId || provider.id;
              const userProfile = await fetchUserProfile(userId);
              const ratings = await fetchProviderRatings(provider.id);
              return { 
                ...provider, 
                isActive: userProfile.isActive,
                userPhoto: userProfile.photoURL,
                userPhone: userProfile.phone,
                rating: ratings.rating,
                reviewCount: ratings.reviewCount
              };
            })
          );
          setProviders(providersWithDetails);
          applyFilters(providersWithDetails);
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUserProfile]);

  // Apply filters with search
  const applyFilters = useCallback((providersData = providers) => {
    let filtered = [...providersData];
    
    // Category filter
    if (categorySlug !== "all") {
      filtered = filtered.filter(p => 
        p.category?.toLowerCase() === categorySlug.toLowerCase()
      );
    }
    
    // Search filter - searches by name, category, city
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term)
      );
    }
    
    // Price filter
    filtered = filtered.filter(p => 
      (p.hourlyRate || 500) >= filters.minPrice && 
      (p.hourlyRate || 500) <= filters.maxPrice
    );
    
    // Rating filter
    filtered = filtered.filter(p => (p.rating || 0) >= filters.minRating);
    
    // City filter
    if (filters.city && filters.city.trim()) {
      filtered = filtered.filter(p => 
        p.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }
    
    // Sorting
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
  }, [providers, categorySlug, searchTerm, filters]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (!loading && providers.length > 0) {
      applyFilters();
    }
  }, [searchTerm, filters, categorySlug, providers.length, loading, applyFilters]);

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
    setSearchTerm("");
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
        photoURL: provider.userPhoto,
        email: provider.userEmail
      };
      
      const conversation = await getOrCreateConversation(
        currentUser.uid,
        provider.userId || provider.id,
        providerData,
        currentUserData
      );
      
      if (conversation && conversation.id) {
        sessionStorage.setItem("activeConversationId", conversation.id);
        router.push("/dashboard?tab=messages");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const handleBookNow = (provider) => {
    if (!currentUser) {
      router.push("/Login");n
      return;
    }
    router.push(`/booking/${provider.id}`);
  };

  const ProviderSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-28 bg-gray-100"></div>
      <div className="p-4">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="w-28 h-5 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="w-32 h-3 bg-gray-200 rounded mx-auto mb-3"></div>
        <div className="flex justify-center gap-2 mb-3">
          <div className="w-14 h-3 bg-gray-200 rounded"></div>
          <div className="w-14 h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="w-24 h-6 bg-gray-200 rounded mx-auto mb-4"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 h-9 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <ProviderSkeleton key={i} />
              ))}
            </div>
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{currentCategory.name} Services</h1>
                <p className="text-gray-500 mt-1">
                  Find the best professionals in your area
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

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, category, or location..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 pb-4 border-b border-gray-100">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                <button onClick={resetFilters} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Reset Filters</button>
                <button onClick={() => setFilterOpen(false)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Apply Filters</button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-5 flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-green-600">{filteredProviders.length}</span> professionals available
            </p>
            {filteredProviders.length > 0 && (
              <p className="text-xs text-gray-400">Page {currentPage} of {totalPages}</p>
            )}
          </div>

          {/* Providers Grid */}
          {filteredProviders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No professionals found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
              <button onClick={resetFilters} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {currentProviders.map((provider) => {
                  const isSaved = savedItems.has(provider.userId || provider.id);
                  return (
                    <div key={provider.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
                      {/* Cover Area */}
                      <div className="relative h-28 bg-gradient-to-r from-green-500 to-green-600">
                        <button
                          onClick={() => toggleSaveItem(provider.userId || provider.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                        </button>
                      </div>

                      {/* Profile Image */}
                      <div className="relative px-4">
                        <div className="absolute -top-10 left-4">
                          {provider.userPhoto ? (
                            <img 
                              src={provider.userPhoto} 
                              alt={provider.name}
                              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=22c55e&color=fff`;
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                              <span className="text-2xl font-bold text-green-600">{provider.name?.charAt(0) || "P"}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 pt-12">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{provider.name}</h3>
                            <p className="text-xs text-gray-500">{provider.category}</p>
                          </div>
                          {/* Real Rating with Review Count */}
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-semibold text-gray-800">{provider.rating || 4.5}</span>
                            <span className="text-xs text-gray-400">({provider.reviewCount || 0})</span>
                          </div>
                        </div>

                        {/* Location & Experience */}
                        <div className="flex items-center justify-between text-gray-500 text-xs mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{provider.city || "Dhaka"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{provider.experience || "3"} years</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-green-600">৳{provider.hourlyRate || 500}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-3">
                          {provider.isActive !== false ? (
                            <div className="inline-flex items-center gap-1 bg-green-50 rounded-full px-2 py-0.5">
                              <Circle className="w-2 h-2 text-green-500 fill-green-500 animate-pulse" />
                              <span className="text-xs font-medium text-green-600">Available</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-red-50 rounded-full px-2 py-0.5">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span className="text-xs font-medium text-red-600">Unavailable</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleChat(provider)}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:border-green-600 hover:text-green-600 transition-all duration-200 flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-4 h-4" /> Chat
                          </button>
                          <button
                            onClick={() => handleBookNow(provider)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Calendar className="w-4 h-4" /> Book
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-10 flex justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm transition ${
                          currentPage === pageNum
                            ? "bg-green-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}