"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Star, MapPin, Clock, Trash2, Calendar, MessageCircle } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  getDoc 
} from "firebase/firestore";

export default function SavedPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [savedProviders, setSavedProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchSavedProviders();
    }
  }, [currentUser]);

  const fetchSavedProviders = async () => {
    try {
      const savedRef = collection(db, "users", currentUser.uid, "savedItems");
      const savedSnap = await getDocs(savedRef);
      const providerIds = savedSnap.docs.map(doc => doc.id);
      
      // Fetch provider details from serviceProviders collection
      const providers = [];
      for (const id of providerIds) {
        const providerRef = doc(db, "serviceProviders", id);
        const providerSnap = await getDoc(providerRef);
        if (providerSnap.exists()) {
          providers.push({ id, ...providerSnap.data() });
        }
      }
      setSavedProviders(providers);
    } catch (error) {
      console.error("Error fetching saved providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (providerId) => {
    try {
      await deleteDoc(doc(db, "users", currentUser.uid, "savedItems", providerId));
      setSavedProviders(prev => prev.filter(p => p.id !== providerId));
      alert("Removed from saved");
    } catch (error) {
      console.error("Error removing saved:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">Saved Services</h1>
            </div>
            <p className="text-gray-500 mt-1">Providers you've saved for later</p>
          </div>

          {savedProviders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No saved services</h3>
              <p className="text-gray-500 mb-4">Save providers you're interested in to see them here</p>
              <button onClick={() => router.push("/explore")} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Explore Services
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProviders.map((provider) => (
                <div key={provider.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        {provider.photoURL ? (
                          <img src={provider.photoURL} alt={provider.name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-green-600">{provider.name?.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{provider.name}</h3>
                          <p className="text-sm text-gray-500">{provider.category}</p>
                        </div>
                      </div>
                      <button onClick={() => removeSaved(provider.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm">{provider.rating || 4.5}</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.city || "Dhaka"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{provider.experience || "3"} years experience</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-4">৳{provider.hourlyRate || 500}<span className="text-sm font-normal text-gray-500">/hr</span></p>
                    <button
                      onClick={() => router.push(`/booking/${provider.id}`)}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                    >
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Book Now
                    </button>
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