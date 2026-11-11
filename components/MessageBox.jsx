"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X, ChevronRight, User, Clock, CheckCheck, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseClient";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  writeBatch,
  getDoc
} from "firebase/firestore";

export default function MessageBox() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const boxRef = useRef(null);

  // Fetch user profile data
  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          name: userData.name || "User",
          photoURL: userData.photoURL || null,
          email: userData.email || "",
          isOnline: userData.isOnline || false,
          isActive: userData.isActive || false,
        };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
    return null;
  };

  useEffect(() => {
    if (!currentUser) return;

    // Fetch conversations in real-time with user profiles
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participants", "array-contains", currentUser.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const convos = [];
      let totalUnread = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const unread = data.unreadCount?.[currentUser.uid] || 0;
        totalUnread += unread;
        
        // Get other participant ID
        const otherParticipantId = data.participants?.find(p => p !== currentUser.uid);
        
        // Fetch user profile for the other participant
        let userProfile = null;
        if (otherParticipantId) {
          userProfile = await fetchUserProfile(otherParticipantId);
        }
        
        convos.push({
          id: doc.id,
          ...data,
          unreadCount: unread,
          otherParticipantId: otherParticipantId,
          otherParticipantName: userProfile?.name || "User",
          otherParticipantPhoto: userProfile?.photoURL || null,
          otherParticipantOnline: userProfile?.isOnline || false,
          otherParticipantActive: userProfile?.isActive || false,
        });
      }

      setConversations(convos.slice(0, 5)); // Show only last 5 conversations
      setUnreadCount(totalUnread);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Directly open specific conversation in dashboard messages tab
  const handleOpenConversation = (conversationId) => {
    setIsOpen(false);
    // ✅ FIXED: Use sessionStorage (matches MessagesComponent)
    sessionStorage.setItem("activeConversationId", conversationId);
    // Navigate to dashboard messages tab
    router.push("/dashboard?tab=messages");
  };

  // Mark all messages as read
  const handleMarkAllAsRead = async () => {
    if (markingAllRead || conversations.length === 0) return;
    
    setMarkingAllRead(true);
    try {
      const batch = writeBatch(db);
      
      for (const conv of conversations) {
        if (conv.unreadCount > 0) {
          const conversationRef = doc(db, "conversations", conv.id);
          batch.update(conversationRef, {
            [`unreadCount.${currentUser.uid}`]: 0
          });
          
          // Also mark individual messages as read
          const messagesRef = collection(db, "conversations", conv.id, "messages");
          const q = query(messagesRef, where("read", "==", false), where("receiverId", "==", currentUser.uid));
          const snapshot = await getDocs(q);
          
          snapshot.forEach((docSnap) => {
            batch.update(docSnap.ref, { read: true });
          });
        }
      }
      
      await batch.commit();
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
      return "Just now";
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getProfileImageUrl = (profile) => {
    if (profile?.photoURL) {
      return profile.photoURL;
    }
    return null;
  };

  return (
    <div className="relative" ref={boxRef}>
      {/* Message Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <MessageCircle className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Message Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
            <div>
              <h3 className="font-semibold text-gray-800">Messages</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllRead}
                  className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-green-50 transition"
                >
                  {markingAllRead ? (
                    <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CheckCheck className="w-3 h-3" />
                  )}
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="max-h-[440px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a conversation with a service provider</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const profileImage = getProfileImageUrl({
                  photoURL: conv.otherParticipantPhoto
                });
                const isUserOnline = conv.otherParticipantOnline && conv.otherParticipantActive;
                const isUserInactive = !conv.otherParticipantActive;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleOpenConversation(conv.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar with Profile Picture */}
                      <div className="relative flex-shrink-0">
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt={conv.otherParticipantName}
                            className="w-12 h-12 rounded-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.otherParticipantName)}&background=22c55e&color=fff`;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {conv.otherParticipantName?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        {/* Status Indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5">
                          {isUserOnline ? (
                            <div className="w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white animate-pulse" />
                          ) : isUserInactive ? (
                            <div className="w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center">
                              <span className="text-[8px] text-white">✕</span>
                            </div>
                          ) : (
                            <div className="w-3.5 h-3.5 bg-gray-400 rounded-full ring-2 ring-white" />
                          )}
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {conv.otherParticipantName}
                          </p>
                          {conv.lastMessageTime && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {formatTime(conv.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage || "No messages yet"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {isUserOnline ? (
                            <span className="text-[10px] text-green-600 font-medium">● Online</span>
                          ) : isUserInactive ? (
                            <span className="text-[10px] text-red-500 font-medium">✕ Inactive</span>
                          ) : (
                            <span className="text-[10px] text-gray-400">○ Offline</span>
                          )}
                        </div>
                      </div>

                      {/* Unread Badge */}
                      {conv.unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                            {conv.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {conversations.length > 0 && (
            <div className="border-t border-gray-100 p-3 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/dashboard?tab=messages");
                }}
                className="w-full flex items-center justify-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium py-1.5 rounded-lg hover:bg-green-50 transition"
              >
                View All Messages
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}