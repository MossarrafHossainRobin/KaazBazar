"use client";
import { useState, useEffect } from "react";
import { Camera, Mail, Phone, MapPin, Calendar, Edit2, Save, X, User, Briefcase, Globe } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile, getUserProfile, addActivity } from "@/lib/firestoreService";

export default function ProfileComponent() {
  const { currentUser, setCurrentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    bio: "",
    profession: ""
  });

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    const result = await getUserProfile(currentUser.uid);
    if (result.success) {
      setUserData(result.data);
      setFormData({
        name: result.data.name || "",
        phone: result.data.phone || "",
        address: result.data.address || "",
        city: result.data.city || "",
        bio: result.data.bio || "",
        profession: result.data.profession || ""
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUserProfile(currentUser.uid, formData);
      await addActivity(currentUser.uid, {
        type: "profile",
        action: "Updated profile information",
        timestamp: new Date().toISOString()
      });
      setCurrentUser({ ...currentUser, ...formData });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
    setLoading(false);
  };

  const infoItems = [
    { icon: Mail, label: "Email", value: currentUser?.email },
    { icon: Phone, label: "Phone", value: formData.phone || "Not added" },
    { icon: MapPin, label: "Address", value: formData.address ? `${formData.address}, ${formData.city}` : "Not added" },
    { icon: Briefcase, label: "Profession", value: formData.profession || "Not specified" },
    { icon: Calendar, label: "Member Since", value: new Date(currentUser?.createdAt).toLocaleDateString() },
    { icon: Globe, label: "Language", value: "Bengali / English" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Cover Photo */}
      <div className="h-32 bg-gradient-to-r from-green-600 to-green-700 relative"></div>
      
      {/* Profile Photo */}
      <div className="relative px-6">
        <div className="flex justify-between items-end -mt-12 mb-6">
          <div className="relative">
            {currentUser?.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.name}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            <span className="text-sm">{isEditing ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6 pt-0">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+8801XXXXXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
                placeholder="e.g., Electrician, Plumber, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-800">{formData.name || currentUser?.name}</h2>
              {formData.bio && <p className="text-gray-600 mt-1">{formData.bio}</p>}
            </div>
            {infoItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="text-gray-800">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}