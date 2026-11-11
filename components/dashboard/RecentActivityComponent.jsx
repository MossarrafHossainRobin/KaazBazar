"use client";
import { useState, useEffect } from "react";
import { Clock, ShoppingBag, Star, MessageCircle, Heart, UserPlus, Package, CheckCircle, XCircle, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserActivities } from "@/lib/firestoreService";

export default function RecentActivityComponent() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (currentUser) {
      fetchActivities();
    }
  }, [currentUser]);

  const fetchActivities = async () => {
    setLoading(true);
    const result = await getUserActivities(currentUser.uid, 50);
    if (result.success) {
      setActivities(result.data);
    }
    setLoading(false);
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case "order": return { icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100", label: "Order" };
      case "review": return { icon: Star, color: "text-yellow-600", bg: "bg-yellow-100", label: "Review" };
      case "message": return { icon: MessageCircle, color: "text-purple-600", bg: "bg-purple-100", label: "Message" };
      case "saved": return { icon: Heart, color: "text-red-600", bg: "bg-red-100", label: "Saved" };
      case "profile": return { icon: UserPlus, color: "text-gray-600", bg: "bg-gray-100", label: "Profile" };
      case "order_completed": return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Completed" };
      case "order_cancelled": return { icon: XCircle, color: "text-red-600", bg: "bg-red-100", label: "Cancelled" };
      default: return { icon: Package, color: "text-gray-600", bg: "bg-gray-100", label: "Activity" };
    }
  };

  const filteredActivities = filter === "all" 
    ? activities 
    : activities.filter(a => a.type === filter || a.type.includes(filter));

  const activityTypes = [
    { id: "all", label: "All", count: activities.length },
    { id: "order", label: "Orders", count: activities.filter(a => a.type === "order" || a.type === "order_completed" || a.type === "order_cancelled").length },
    { id: "profile", label: "Profile", count: activities.filter(a => a.type === "profile").length },
    { id: "saved", label: "Saved", count: activities.filter(a => a.type === "saved").length },
  ];

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Recent Activity</h1>
              <p className="text-gray-500 text-sm mt-1">Your latest actions and updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Type Filters */}
      <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200 bg-gray-50">
        {activityTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setFilter(type.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === type.id 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {type.label} ({type.count})
          </button>
        ))}
      </div>

      {/* Activities List */}
      <div className="divide-y divide-gray-200">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800">No activity yet</h3>
            <p className="text-gray-500 text-sm mt-1">Your activities will appear here</p>
          </div>
        ) : (
          filteredActivities.map((activity) => {
            const { icon: Icon, color, bg, label } = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{label}</span>
                          <p className="font-medium text-gray-800">{activity.action}</p>
                        </div>
                        {activity.serviceName && (
                          <p className="text-sm text-gray-600 mt-1">{activity.serviceName}</p>
                        )}
                        {activity.amount && (
                          <p className="text-sm font-semibold text-green-600 mt-1">৳{activity.amount}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}