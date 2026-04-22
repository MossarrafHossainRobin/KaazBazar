"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X, ChevronRight, User, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, onSnapshot, orderBy, limit } from "firebase/firestore";

export default function MessageBox() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch conversations in real-time
    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participants", "array-contains", currentUser.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = [];
      let totalUnread = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        const unread = data.unreadCount?.[currentUser.uid] || 0;
        totalUnread += unread;
        
        convos.push({
          id: doc.id,
          ...data,
          unreadCount: unread
        });
      });

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

  const handleOpenMessage = (conversationId, otherParticipantName) => {
    setIsOpen(false);
    // Navigate to dashboard messages tab with conversation ID
    router.push(`/dashboard?tab=messages&conversation=${conversationId}`);
  };

  const getOtherParticipant = (participants) => {
    return participants?.find(p => p !== currentUser?.uid) || "";
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
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
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Message Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
            <h3 className="font-semibold text-gray-800">Messages</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Messages List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a conversation with a service provider</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const otherParticipantId = getOtherParticipant(conv.participants);
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleOpenMessage(conv.id, conv.otherParticipantName)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                          {conv.otherParticipantName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        {conv.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {conv.otherParticipantName || "User"}
                          </p>
                          {conv.lastMessageTime && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {formatTime(conv.lastMessageTime)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.lastMessage || "No messages yet"}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {conv.unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-red-500 text-white text-xs rounded-full">
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
                className="w-full flex items-center justify-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
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