"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
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
  Search,
  Navigation,
  Crosshair
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

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-gray-400">Loading map...</div>
    </div>
  )
});

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

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
  
  // Location states
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 2000,
    minRating: 0,
    sortBy: "rating",
    city: "",
    nearYou: false,
    maxDistance: 10 // km
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

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation not supported in this browser");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(location);
        setLocationLoading(false);
        setShowLocationPrompt(false);
        // Auto-enable "Near You" filter when location is obtained
        setFilters(prev => ({ ...prev, nearYou: true, sortBy: "nearest" }));
        setShowMap(true); // Show map when location is found
      },
      (err) => {
        console.error("Geolocation error:", err);
        let errorMsg = "Unable to fetch your location.";
        if (err.code === 1) {
          errorMsg = "Location access denied. Please enable location in your browser settings.";
        } else if (err.code === 2) {
          errorMsg = "Location unavailable. Please try again.";
        } else if (err.code === 3) {
          errorMsg = "Location request timed out. Please try again.";
        }
        setLocationError(errorMsg);
        setLocationLoading(false);
        setShowLocationPrompt(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  // Check if location was previously denied
  useEffect(() => {
    if (typeof window !== "undefined" && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          setLocationError("Location access is blocked. Please enable it in your browser settings.");
          setShowLocationPrompt(true);
        }
      }).catch(() => {
        // Permissions API not supported, ignore
      });
    }
  }, []);

  // Toggle "Near You" filter
  const toggleNearYou = () => {
    if (filters.nearYou) {
      // Disable Near You
      setFilters(prev => ({ ...prev, nearYou: false, sortBy: "rating" }));
      return;
    }
    
    if (!userLocation) {
      getUserLocation();
      return;
    }
    
    setFilters(prev => ({ ...prev, nearYou: true, sortBy: "nearest" }));
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
          name: userData.name,
          latitude: userData.latitude || null,
          longitude: userData.longitude || null
        };
        userProfileCache.set(userId, profile);
        return profile;
      }
      return { isActive: true, latitude: null, longitude: null };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return { isActive: true, latitude: null, longitude: null };
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
                latitude: userProfile.latitude || provider.latitude || null,
                longitude: userProfile.longitude || provider.longitude || null,
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

  // Apply filters with search and location
  const applyFilters = useCallback((providersData = providers) => {
    if (!providersData || providersData.length === 0) {
      setFilteredProviders([]);
      return;
    }

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
    
    // Near You filter - calculate distances
    if (filters.nearYou && userLocation) {
      // Calculate distance for all providers
      filtered = filtered.map(p => ({
        ...p,
        distance: calculateDistance(
          userLocation[0], userLocation[1],
          p.latitude, p.longitude
        )
      }));

      // Sort by distance first
      filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

      // Check if any providers are within range
      const withinRange = filtered.filter(p => p.distance <= filters.maxDistance);
      
      if (withinRange.length === 0 && filtered.length > 0) {
        // Show closest 5 providers even if they're out of range
        filtered = filtered.slice(0, 5).map(p => ({
          ...p,
          _outOfRange: true
        }));
      } else {
        filtered = withinRange;
      }
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
      case "nearest":
        if (filters.nearYou && userLocation) {
          filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        } else {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
        break;
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
        if (filters.nearYou && userLocation) {
          filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        } else {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
    }
    
    setFilteredProviders(filtered);
    setCurrentPage(1);
  }, [providers, categorySlug, searchTerm, filters, userLocation]);

  // Apply filters when dependencies change
  useEffect(() => {
    if (!loading && providers.length > 0) {
      applyFilters();
    }
  }, [searchTerm, filters, categorySlug, providers.length, loading, applyFilters, userLocation]);

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
      city: "",
      nearYou: false,
      maxDistance: 10
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
      router.push("/Login");
      return;
    }
    router.push(`/booking/${provider.id}`);
  };

  // Get distance label
  const getDistanceLabel = (distance) => {
    if (distance === undefined || distance === null || !isFinite(distance)) return "";
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
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
            {/* Skeleton Header */}
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
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
      <main className="flex-grow py-4 md:py-8">
        <div className="container mx-auto px-3 md:px-4">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{currentCategory.name} Services</h1>
                <p className="text-gray-500 text-sm md:text-base mt-1">
                  Find the best professionals in your area
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {/* Near You Button */}
                <button
                  onClick={toggleNearYou}
                  disabled={locationLoading}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full shadow-sm transition-all duration-200 text-xs md:text-sm font-medium ${
                    filters.nearYou && userLocation
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                      : "bg-white text-gray-700 hover:shadow-md hover:bg-gray-50 border border-gray-200"
                  } ${locationLoading ? "opacity-50 cursor-wait" : ""}`}
                >
                  {locationLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Locating...</span>
                    </>
                  ) : (
                    <>
                      <Crosshair className={`w-3.5 h-3.5 md:w-4 md:h-4 ${filters.nearYou && userLocation ? "text-white" : "text-green-600"}`} />
                      <span className="hidden sm:inline">
                        {filters.nearYou && userLocation ? "Near You ✓" : "Near You"}
                      </span>
                    </>
                  )}
                </button>

                {/* Map Toggle Button */}
                <button
                  onClick={() => {
                    setShowMap(!showMap);
                    if (!showMap && !userLocation) {
                      getUserLocation();
                    }
                  }}
                  className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full shadow-sm transition-all duration-200 text-xs md:text-sm font-medium ${
                    showMap
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                      : "bg-white text-gray-700 hover:shadow-md hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{showMap ? "Hide Map" : "Show Map"}</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 bg-white px-2.5 md:px-3 py-2 rounded-full shadow-sm border border-gray-200">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="font-medium text-gray-700">{filteredProviders.length}</span>
                  <span className="hidden sm:inline">Providers</span>
                </div>

                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition text-xs md:text-sm font-medium border border-gray-200"
                >
                  <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Location Permission Prompt */}
          {showLocationPrompt && !userLocation && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crosshair className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Enable Location Access</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {locationError || "Allow location access to find service providers near you. Your location is only used to show nearby professionals."}
                    </p>
                    {locationError && locationError.includes("denied") && (
                      <p className="text-xs text-amber-700 mt-2 bg-amber-100 px-3 py-1.5 rounded-lg">
                        📍 To enable: Go to your browser settings → Privacy → Location → Allow
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowLocationPrompt(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={getUserLocation}
                    disabled={locationLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {locationLoading ? "Detecting..." : "Enable Location"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Map Section - Collapsible */}
          {showMap && (
            <div className="mb-6 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-3 md:p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                    <span className="text-sm md:text-base font-medium text-gray-700">
                      {userLocation 
                        ? "Your Location & Nearby Providers" 
                        : "Enable location to see nearby providers"}
                    </span>
                  </div>
                  {!userLocation && (
                    <button
                      onClick={getUserLocation}
                      disabled={locationLoading}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 w-full sm:w-auto justify-center"
                    >
                      <Crosshair className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      {locationLoading ? "Detecting Your Location..." : "Detect My Location"}
                    </button>
                  )}
                </div>
                <MapComponent 
                  userLocation={userLocation}
                  providers={filters.nearYou && userLocation ? filteredProviders : providers}
                />
                {locationError && !showLocationPrompt && (
                  <div className="p-3 bg-red-50 border-t border-red-100">
                    <p className="text-xs md:text-sm text-red-600 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      {locationError}
                    </p>
                  </div>
                )}
                {filters.nearYou && userLocation && (
                  <div className="p-3 bg-green-50 border-t border-green-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="text-xs md:text-sm text-green-700 flex items-center gap-2">
                      <Circle className="w-3 h-3 fill-green-500 text-green-500 animate-pulse" />
                      Showing providers within {filters.maxDistance}km of your location
                    </p>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, maxDistance: Math.min(prev.maxDistance + 10, 50) }))}
                      className="text-xs text-green-600 hover:text-green-700 font-medium underline"
                    >
                      Expand search area
                    </button>
                  </div>
                )}
                {filters.nearYou && userLocation && filteredProviders.some(p => p._outOfRange) && (
                  <div className="p-3 bg-amber-50 border-t border-amber-100">
                    <p className="text-xs md:text-sm text-amber-700 flex items-center gap-2">
                      <span>⚠️</span>
                      Some providers are outside your {filters.maxDistance}km range. Showing the closest available.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-4 md:mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, category, or location..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white text-sm md:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters - Horizontal Scroll on Mobile */}
          <div className="flex flex-nowrap gap-2 mb-4 md:mb-6 pb-4 border-b border-gray-100 overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0 md:flex-wrap md:justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  categorySlug === category.slug
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6 border border-gray-100 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Filter Providers</h3>
                <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Price Range (BDT)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: parseInt(e.target.value) || 0})}
                      className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value) || 2000})}
                      className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                    className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4}>4 Stars & Up</option>
                    <option value={4.5}>4.5 Stars & Up</option>
                    <option value={4.8}>4.8 Stars & Up</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Location (City)</label>
                  <input
                    type="text"
                    placeholder="Enter city name"
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                    className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    className="w-full px-2 md:px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm"
                  >
                    {(filters.nearYou && userLocation) && (
                      <option value="nearest">📍 Nearest First</option>
                    )}
                    <option value="rating">⭐ Top Rated</option>
                    <option value="price_low">💰 Price: Low to High</option>
                    <option value="price_high">💵 Price: High to Low</option>
                    <option value="experience">🏆 Most Experienced</option>
                  </select>
                </div>
              </div>

              {/* Distance Slider - Only shown when Near You is active */}
              {filters.nearYou && userLocation && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Maximum Distance: <span className="text-green-600 font-bold">{filters.maxDistance} km</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="flex justify-between text-[10px] md:text-xs text-gray-400 mt-1">
                    <span>1 km</span>
                    <span>10 km</span>
                    <span>25 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              )}

              <div className="mt-4 md:mt-5 flex flex-col sm:flex-row justify-end gap-2">
                <button 
                  onClick={resetFilters} 
                  className="px-4 py-2 text-xs md:text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition order-2 sm:order-1"
                >
                  Reset All Filters
                </button>
                <button 
                  onClick={() => setFilterOpen(false)} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-green-700 transition order-1 sm:order-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-4 md:mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p className="text-xs md:text-sm text-gray-500">
              <span className="font-semibold text-green-600 text-sm md:text-base">{filteredProviders.length}</span> professional{filteredProviders.length !== 1 ? 's' : ''} available
              {filters.nearYou && userLocation && (
                <span className="text-gray-400 ml-1">near you</span>
              )}
              {searchTerm && (
                <span className="text-gray-400 ml-1">for &quot;{searchTerm}&quot;</span>
              )}
            </p>
            {filteredProviders.length > 0 && (
              <p className="text-[10px] md:text-xs text-gray-400">
                Page {currentPage} of {totalPages}
                {filters.sortBy === "nearest" && " • Sorted by distance"}
              </p>
            )}
          </div>

          {/* Providers Grid */}
          {filteredProviders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 text-center">
              <div className="text-5xl md:text-6xl mb-4">🔍</div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No professionals found</h3>
              <p className="text-sm md:text-base text-gray-500 mb-6 max-w-md mx-auto">
                {filters.nearYou && userLocation
                  ? `No providers found within ${filters.maxDistance}km of your location. Try expanding the search area or disabling "Near You".`
                  : "Try adjusting your filters or search term to find more professionals."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {filters.nearYou && userLocation && (
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, maxDistance: Math.min(prev.maxDistance + 10, 50) }))}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    📍 Expand to {Math.min(filters.maxDistance + 10, 50)}km
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (filters.nearYou) {
                      setFilters(prev => ({ ...prev, nearYou: false, sortBy: "rating" }));
                    } else {
                      resetFilters();
                    }
                  }} 
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  {filters.nearYou ? "Show All Providers" : "Clear All Filters"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {currentProviders.map((provider) => {
                  const isSaved = savedItems.has(provider.userId || provider.id);
                  return (
                    <div key={provider.id} className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
                      {/* Cover Area */}
                      <div className="relative h-24 md:h-28 bg-gradient-to-r from-green-500 to-green-600">
                        {/* Save Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveItem(provider.userId || provider.id);
                          }}
                          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
                          title={isSaved ? "Remove from saved" : "Save provider"}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                        </button>

                        {/* Distance Badge */}
                        {filters.nearYou && userLocation && provider.distance !== undefined && (
                          <div className={`absolute top-3 left-3 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm ${
                            provider._outOfRange 
                              ? 'bg-amber-100/90 text-amber-800 border border-amber-300' 
                              : 'bg-white/90 text-gray-700 border border-white/50'
                          }`}>
                            <Navigation className={`w-3 h-3 ${provider._outOfRange ? 'text-amber-600' : 'text-green-600'}`} />
                            <span className="text-[10px] md:text-xs font-semibold">
                              {getDistanceLabel(provider.distance)}
                              {provider._outOfRange && (
                                <span className="text-amber-600 ml-0.5">(far)</span>
                              )}
                            </span>
                          </div>
                        )}

                        {/* Out of Range Warning */}
                        {provider._outOfRange && (
                          <div className="absolute bottom-2 left-3 right-3">
                            <div className="bg-amber-100/90 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] text-amber-800 text-center">
                              Outside {filters.maxDistance}km range
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Profile Image */}
                      <div className="relative px-4">
                        <div className="absolute -top-10 left-4">
                          {provider.userPhoto ? (
                            <img 
                              src={provider.userPhoto} 
                              alt={provider.name}
                              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-white shadow-md"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name || 'P')}&background=22c55e&color=fff&size=80`;
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                              <span className="text-xl md:text-2xl font-bold text-green-600">{provider.name?.charAt(0) || "P"}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 md:p-4 pt-10 md:pt-12">
                        <div className="flex justify-between items-start mb-2">
                          <div className="min-w-0 flex-1 mr-2">
                            <h3 className="font-bold text-gray-900 text-sm md:text-lg truncate">{provider.name}</h3>
                            <p className="text-[10px] md:text-xs text-gray-500 capitalize">{provider.category || "Service"}</p>
                          </div>
                          {/* Rating */}
                          <div className="flex items-center gap-1 bg-yellow-50 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] md:text-xs font-semibold text-gray-800">{provider.rating || 4.5}</span>
                            <span className="text-[10px] md:text-xs text-gray-400">({provider.reviewCount || 0})</span>
                          </div>
                        </div>

                        {/* Location & Experience */}
                        <div className="flex items-center justify-between text-gray-500 text-[10px] md:text-xs mb-2 md:mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{provider.city || "Dhaka"}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            <span>{provider.experience || "3"} yr{provider.experience > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-3 md:mb-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl md:text-2xl font-bold text-green-600">৳{provider.hourlyRate || 500}</span>
                            <span className="text-[10px] md:text-xs text-gray-400">/hr</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-3">
                          {provider.isActive !== false ? (
                            <div className="inline-flex items-center gap-1 bg-green-50 rounded-full px-2 py-0.5 border border-green-100">
                              <Circle className="w-1.5 h-1.5 md:w-2 md:h-2 text-green-500 fill-green-500 animate-pulse" />
                              <span className="text-[10px] md:text-xs font-medium text-green-600">Available</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 bg-red-50 rounded-full px-2 py-0.5 border border-red-100">
                              <XCircle className="w-3 h-3 text-red-500" />
                              <span className="text-[10px] md:text-xs font-medium text-red-600">Unavailable</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleChat(provider)}
                            className="flex-1 px-2 md:px-3 py-2 border border-gray-300 text-gray-700 rounded-xl text-[10px] md:text-sm font-medium hover:border-green-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200 flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                            <span>Chat</span>
                          </button>
                          <button
                            onClick={() => handleBookNow(provider)}
                            className="flex-1 px-2 md:px-3 py-2 bg-green-600 text-white rounded-xl text-[10px] md:text-sm font-medium hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
                            <span>Book</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 md:mt-10 flex justify-center gap-1.5 md:gap-2 flex-wrap">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-2.5 md:px-3 py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2.5 md:px-3 py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
                        className={`px-2.5 md:px-3.5 py-2 rounded-lg text-[10px] md:text-sm font-medium transition ${
                          currentPage === pageNum
                            ? "bg-green-600 text-white shadow-md"
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
                    className="px-2.5 md:px-3 py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2.5 md:px-3 py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition font-medium"
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
      
      {/* Animations and Global Styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(-8px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Hide scrollbar for category filter on mobile */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Custom range slider styling */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: #e5e7eb;
          border-radius: 5px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #16a34a;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #16a34a;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}