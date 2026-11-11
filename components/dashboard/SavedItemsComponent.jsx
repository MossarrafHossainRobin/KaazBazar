"use client";
import { useState, useEffect } from "react";
import { Heart, Trash2, Star, MapPin, ShoppingBag, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSavedItems, removeSavedItem } from "@/lib/firestoreService";

export default function SavedItemsComponent() {
  const { currentUser } = useAuth();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchSavedItems();
    }
  }, [currentUser]);

  const fetchSavedItems = async () => {
    setLoading(true);
    const result = await getSavedItems(currentUser.uid);
    if (result.success) {
      setSavedItems(result.data);
    }
    setLoading(false);
  };

  const handleRemoveItem = async (itemId) => {
    const result = await removeSavedItem(currentUser.uid, itemId);
    if (result.success) {
      setSavedItems(savedItems.filter(item => item.id !== itemId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Saved Items</h1>
            <p className="text-gray-500 text-sm mt-1">{savedItems.length} items saved</p>
          </div>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800">No saved items</h3>
          <p className="text-gray-500 text-sm mt-1">Start saving services you're interested in</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {savedItems.map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item.id)} 
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Saved on {new Date(item.savedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-lg font-bold text-green-600">৳{item.price}</p>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}