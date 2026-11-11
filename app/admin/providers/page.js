// app/admin/providers/page.js
"use client";
import { useState, useEffect } from "react";
import { Search, Star, MapPin, Clock, Shield, UserCheck, UserX, Eye } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from "firebase/firestore";

export default function ProvidersManagement() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "serviceProviders"));
      const providersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProviders(providersData);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProviderStatus = async (providerId, isActive) => {
    try {
      const providerRef = doc(db, "serviceProviders", providerId);
      await updateDoc(providerRef, { isActive });
      setProviders(providers.map(p => p.id === providerId ? { ...p, isActive } : p));
    } catch (error) {
      console.error("Error updating provider status:", error);
    }
  };

  const deleteProvider = async (providerId) => {
    if (confirm("Are you sure you want to delete this provider?")) {
      try {
        await deleteDoc(doc(db, "serviceProviders", providerId));
        setProviders(providers.filter(p => p.id !== providerId));
      } catch (error) {
        console.error("Error deleting provider:", error);
      }
    }
  };

  const filteredProviders = providers.filter(provider =>
    provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Service Providers</h1>
        <p className="text-gray-500 mt-1">Manage all service providers on your platform</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, category or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No service providers found
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition border border-gray-100">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {provider.photoURL ? (
                      <img src={provider.photoURL} alt={provider.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-lg">{provider.name?.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">{provider.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{provider.category}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{provider.rating || 4.5}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateProviderStatus(provider.id, !provider.isActive)}
                    className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                      provider.isActive !== false 
                        ? "bg-green-100 text-green-600" 
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {provider.isActive !== false ? (
                      <><UserCheck className="w-3 h-3" /> Active</>
                    ) : (
                      <><UserX className="w-3 h-3" /> Inactive</>
                    )}
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{provider.city}, {provider.area}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{provider.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>{provider.verified ? "Verified" : "Not Verified"}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedProvider(provider);
                      setShowModal(true);
                    }}
                    className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => deleteProvider(provider.id)}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Provider Details Modal */}
      {showModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Provider Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedProvider.photoURL ? (
                  <img src={selectedProvider.photoURL} alt={selectedProvider.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-green-600 font-bold">{selectedProvider.name?.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{selectedProvider.name}</p>
                  <p className="text-sm text-gray-500">{selectedProvider.email}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm"><strong>Category:</strong> {selectedProvider.category}</p>
                <p className="text-sm mt-2"><strong>Experience:</strong> {selectedProvider.experience}</p>
                <p className="text-sm mt-2"><strong>Hourly Rate:</strong> ৳{selectedProvider.hourlyRate}</p>
                <p className="text-sm mt-2"><strong>Location:</strong> {selectedProvider.city}, {selectedProvider.area}</p>
                <p className="text-sm mt-2"><strong>Services:</strong> {selectedProvider.services?.join(", ")}</p>
                <p className="text-sm mt-2"><strong>Total Bookings:</strong> {selectedProvider.totalBookings || 0}</p>
                <p className="text-sm mt-2"><strong>Completed Jobs:</strong> {selectedProvider.completedJobs || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}