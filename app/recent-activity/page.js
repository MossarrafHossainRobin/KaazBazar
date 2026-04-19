"use client";
import Link from "next/link";  // ← এই লাইন যোগ করুন
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, ShoppingBag, Star, MessageCircle, Heart, UserPlus, Package, CheckCircle, XCircle } from "lucide-react";
import { getUserActivities } from "@/lib/firestoreService";

export default function RecentActivityPage() {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (currentUser) {
      fetchActivities();
    }
  }, [currentUser]);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    const result = await getUserActivities(currentUser.uid, 30);
    if (result.success) {
      setActivities(result.data);
    }
    setLoadingActivities(false);
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case "order": return { icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-100" };
      case "review": return { icon: Star, color: "text-yellow-600", bg: "bg-yellow-100" };
      case "message": return { icon: MessageCircle, color: "text-purple-600", bg: "bg-purple-100" };
      case "saved": return { icon: Heart, color: "text-red-600", bg: "bg-red-100" };
      case "profile": return { icon: UserPlus, color: "text-gray-600", bg: "bg-gray-100" };
      case "order_completed": return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" };
      case "order_cancelled": return { icon: XCircle, color: "text-red-600", bg: "bg-red-100" };
      default: return { icon: Package, color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-gray-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Recent Activity</h1>
                <p className="text-gray-500 text-sm mt-1">Your latest actions and updates</p>
              </div>
            </div>
          </div>

          {loadingActivities ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800">No activity yet</h3>
              <p className="text-gray-500 text-sm mt-1">Your activities will appear here</p>
              <Link href="/" className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium">
                Browse Services →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {activities.map((activity) => {
                const { icon: Icon, color, bg } = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-800">{activity.action}</p>
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}