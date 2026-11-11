"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { Users, User, Wifi, WifiOff } from "lucide-react";

export default function LivePeopleCounter() {
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Real-time listener for online users
    const onlineUsersRef = collection(db, "users");
    const q = query(onlineUsersRef, where("isOnline", "==", true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const onlineUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOnlineCount(onlineUsers.length);
      
      // Get recent 5 online users
      setRecentUsers(onlineUsers.slice(0, 5));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching online users:", error);
      setLoading(false);
    });

    // Get total users count
    const fetchTotalUsers = async () => {
      try {
        const allUsersRef = collection(db, "users");
        const allUsersSnap = await getDocs(allUsersRef);
        setTotalUsers(allUsersSnap.size);
      } catch (error) {
        console.error("Error fetching total users:", error);
      }
    };
    
    fetchTotalUsers();

    return () => unsubscribe();
  }, []);

  // Format relative time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Just now";
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diff = now - lastSeenDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-24">
      {/* Main Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 px-4 py-2.5"
      >
        <div className="relative">
          <Users className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
        </div>
        <span className="font-medium text-sm">{onlineCount} online now</span>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></div>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-14 right-0 mb-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-sm">Live People Connected</h3>
                <p className="text-xs opacity-90">Real-time active users</p>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-300" />
                <span className="text-2xl font-bold">{onlineCount}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 border-b border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{totalUsers}</p>
              <p className="text-xs text-gray-500">Total Members</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
              <p className="text-xs text-gray-500">Online Now</p>
            </div>
          </div>

          {/* Online Users List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-gray-400 mt-2">Loading...</p>
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="p-8 text-center">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active users</p>
                <p className="text-xs text-gray-400">Be the first to connect!</p>
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
                  <div className="relative">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">
                          {user.name?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{user.name || "Anonymous"}</p>
                    <p className="text-xs text-gray-400">{user.city || "Online"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-green-600 font-medium">Online</span>
                    <p className="text-[10px] text-gray-400">Active now</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              <Wifi className="w-3 h-3 inline mr-1" />
              Real-time updates | {onlineCount} people active
            </p>
          </div>
        </div>
      )}
    </div>
  );
}