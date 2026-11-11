// components/NotificationBell.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck, Package, UserPlus, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ShoppingBag, Truck, Home } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseClient";
import { 
  collection, query, where, orderBy, limit, onSnapshot, 
  getDocs, updateDoc, doc, addDoc, serverTimestamp, getDoc 
} from "firebase/firestore";

export default function NotificationBell() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const userCache = useRef({}); // Cache for user profiles

  // Fetch user profile (with caching)
  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    if (userCache.current[userId]) return userCache.current[userId];
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const profile = {
          name: data.name || "User",
          photoURL: data.photoURL || null,
          isActive: data.isActive !== false,
          isOnline: data.isOnline || false,
        };
        userCache.current[userId] = profile;
        return profile;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
    return { name: "User", photoURL: null, isActive: true, isOnline: false };
  };

  // Enrich notification with sender details
  const enrichNotification = async (notification) => {
    let senderId = null;
    // Determine sender based on notification type
    if (notification.type === "order_placed" || notification.type === "new_order") {
      senderId = notification.customerId || notification.userId;
    } else if (notification.type === "order_confirmed") {
      senderId = notification.providerId;
    } else if (notification.type === "order_cancelled") {
      senderId = notification.cancelledBy === "customer" ? notification.customerId : notification.providerId;
    } else if (notification.type === "order_completed") {
      senderId = notification.customerId;
    } else {
      senderId = notification.userId; // fallback
    }
    if (senderId) {
      const profile = await fetchUserProfile(senderId);
      notification.senderName = profile.name;
      notification.senderPhoto = profile.photoURL;
      notification.senderActive = profile.isActive;
      notification.senderOnline = profile.isOnline;
    }
    return notification;
  };

  useEffect(() => {
    if (!currentUser) return;

    const allowedTypes = [
      "order_placed", "order_confirmed", "order_cancelled", 
      "order_completed", "order_pending", "new_order", "booking"
    ];

    // Listen to nested notifications (user's own collection)
    const nestedNotificationsRef = collection(db, "users", currentUser.uid, "notifications");
    const qNested = query(nestedNotificationsRef, orderBy("createdAt", "desc"), limit(50));

    const unsubscribeNested = onSnapshot(qNested, async (snapshot) => {
      let notificationsData = [];
      for (const docSnap of snapshot.docs) {
        const notif = { id: docSnap.id, ...docSnap.data(), source: "nested" };
        // Exclude message notifications
        if (notif.type === "message") continue;
        if (allowedTypes.includes(notif.type)) {
          notificationsData.push(await enrichNotification(notif));
        }
      }

      // Also fetch from root notifications collection (if any)
      const rootNotificationsRef = collection(db, "notifications");
      const qRoot = query(
        rootNotificationsRef,
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const rootSnapshot = await getDocs(qRoot);
      for (const docSnap of rootSnapshot.docs) {
        const notif = { id: docSnap.id, ...docSnap.data(), source: "root" };
        if (notif.type === "message") continue;
        if (allowedTypes.includes(notif.type)) {
          // Avoid duplicates (by composite key if present)
          if (!notificationsData.some(n => n.id === notif.id && n.source === notif.source)) {
            notificationsData.push(await enrichNotification(notif));
          }
        }
      }

      // Sort by createdAt descending
      notificationsData.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return timeB - timeA;
      });

      setNotifications(notificationsData.slice(0, 50));
      const unread = notificationsData.filter(n => !n.read).length;
      setUnreadCount(unread);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to notifications:", error);
      setLoading(false);
    });

    return () => unsubscribeNested();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notification) => {
    try {
      if (notification.source === "nested") {
        const notificationRef = doc(db, "users", currentUser.uid, "notifications", notification.id);
        await updateDoc(notificationRef, { read: true });
      } else {
        const notificationRef = doc(db, "notifications", notification.id);
        await updateDoc(notificationRef, { read: true });
      }
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(async (notification) => {
        if (notification.source === "nested") {
          const notificationRef = doc(db, "users", currentUser.uid, "notifications", notification.id);
          return updateDoc(notificationRef, { read: true });
        } else {
          const notificationRef = doc(db, "notifications", notification.id);
          return updateDoc(notificationRef, { read: true });
        }
      });
      await Promise.all(updatePromises);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case "order_placed": return <ShoppingBag className="w-5 h-5 text-green-600" />;
      case "order_confirmed": return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "order_cancelled": return <XCircle className="w-5 h-5 text-red-600" />;
      case "order_completed": return <Truck className="w-5 h-5 text-purple-600" />;
      case "order_pending": return <Clock className="w-5 h-5 text-yellow-600" />;
      case "new_order": return <Package className="w-5 h-5 text-orange-600" />;
      case "booking": return <Calendar className="w-5 h-5 text-purple-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationTitle = (type) => {
    switch(type) {
      case "order_placed": return "🛍️ Order Placed";
      case "order_confirmed": return "✅ Order Confirmed";
      case "order_cancelled": return "❌ Order Cancelled";
      case "order_completed": return "🎉 Order Completed";
      case "order_pending": return "⏳ Order Pending";
      case "new_order": return "📦 New Order Received";
      default: return "Notification";
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-green-50 to-white">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 transition"
              >
                <CheckCheck className="w-3 h-3" /> Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">We'll notify you about your orders</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const senderPhoto = notification.senderPhoto;
                const senderName = notification.senderName || "User";
                const isActive = notification.senderActive;
                const isOnline = notification.senderOnline;

                return (
                  <Link
                    key={notification.id}
                    href={notification.link || (notification.orderId ? `/my-orders` : "#")}
                    onClick={() => {
                      if (!notification.read) handleMarkAsRead(notification);
                      setIsOpen(false);
                    }}
                    className={`block p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${
                      !notification.read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Profile Picture */}
                      <div className="relative flex-shrink-0">
                        {senderPhoto ? (
                          <img
                            src={senderPhoto}
                            alt={senderName}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=22c55e&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {senderName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {/* Active/Online Status Dot */}
                        <div className="absolute -bottom-0.5 -right-0.5">
                          {isOnline && isActive ? (
                            <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-white animate-pulse" />
                          ) : !isActive ? (
                            <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                              <span className="text-[8px] text-white">✕</span>
                            </div>
                          ) : (
                            <div className="w-3 h-3 bg-gray-400 rounded-full ring-2 ring-white" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-gray-800 text-sm">
                            {getNotificationTitle(notification.type)}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-gray-400 text-xs">{formatTime(notification.createdAt)}</span>
                          {notification.orderId && (
                            <>
                              <span className="text-gray-300 text-xs">•</span>
                              <span className="text-xs text-gray-400 font-mono">
                                #{notification.orderId.slice(-8)}
                              </span>
                            </>
                          )}
                          <span className="text-gray-300 text-xs">•</span>
                          <span className="text-xs text-gray-500">by {senderName}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-green-600 hover:text-green-700 transition"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}