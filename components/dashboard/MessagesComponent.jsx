"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  MessageCircle, 
  Search, 
  Send, 
  ArrowLeft,
  CheckCheck,
  Clock,
  Phone,
  Video,
  MoreVertical,
  User
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseClient";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  doc,
  updateDoc,
  addDoc,
  getDoc,
  writeBatch,
  setDoc,
  limit
} from "firebase/firestore";
import { sendMessageNotification, requestNotificationPermission } from "@/lib/notificationService";

export default function MessagesComponent() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [userProfiles, setUserProfiles] = useState({});
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastMessageDoc, setLastMessageDoc] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const unsubscribersRef = useRef([]);
  const isScrollingRef = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    const initNotifications = async () => {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
    };
    initNotifications();
    
    // Update user online status
    if (currentUser) {
      updateUserOnlineStatus(true);
      
      const statusListener = setInterval(() => {
        updateUserOnlineStatus(true);
      }, 30000);
      
      return () => {
        updateUserOnlineStatus(false);
        clearInterval(statusListener);
        unsubscribersRef.current.forEach(unsub => {
          if (typeof unsub === 'function') unsub();
        });
      };
    }
  }, [currentUser]);

  const updateUserOnlineStatus = async (isOnline) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        isOnline: isOnline,
        lastSeen: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  };

  // Fetch user profile with error handling
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
          lastSeen: userData.lastSeen,
          isActive: userData.isActive || false
        };
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Try to get from currentUser email as fallback
      if (userId === currentUser?.uid && currentUser?.email) {
        return {
          name: currentUser.displayName || currentUser.email.split('@')[0],
          photoURL: currentUser.photoURL || null,
          email: currentUser.email,
          isOnline: true,
          lastSeen: new Date().toISOString(),
          isActive: true
        };
      }
    }
    return null;
  };

  // Load conversations with real-time updates
  useEffect(() => {
    if (!currentUser) return;

    const loadConversations = async () => {
      setLoading(true);
      try {
        const conversationsRef = collection(db, "conversations");
        const q = query(
          conversationsRef,
          where("participants", "array-contains", currentUser.uid),
          orderBy("lastMessageTime", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const convos = [];
          const userStatuses = {};
          const profiles = {};
          
          for (const docSnap of snapshot.docs) {
            const convData = docSnap.data();
            const otherParticipantId = convData.participants?.find(p => p !== currentUser.uid);
            
            if (otherParticipantId) {
              // Fetch user profile
              let userData = profiles[otherParticipantId];
              if (!userData) {
                userData = await fetchUserProfile(otherParticipantId);
              }
              
              if (userData) {
                profiles[otherParticipantId] = {
                  name: userData.name,
                  photoURL: userData.photoURL,
                  email: userData.email
                };
                
                userStatuses[otherParticipantId] = {
                  isOnline: userData.isOnline,
                  lastSeen: userData.lastSeen,
                  isActive: userData.isActive
                };
                
                convos.push({
                  id: docSnap.id,
                  name: userData.name,
                  avatar: userData.photoURL,
                  email: userData.email,
                  lastMessage: convData.lastMessage || "No messages yet",
                  lastMessageTime: convData.lastMessageTime,
                  time: convData.lastMessageTime?.toDate?.() ? 
                    formatTime(convData.lastMessageTime.toDate()) : "New",
                  unread: convData.unreadCount?.[currentUser.uid] || 0,
                  userId: otherParticipantId
                });
              }
            }
          }
          
          setUserProfiles(profiles);
          setOnlineStatus(userStatuses);
          setConversations(convos);
          setLoading(false);
        }, (error) => {
          console.error("Error in conversations listener:", error);
          setLoading(false);
        });
        
        unsubscribersRef.current.push(unsubscribe);
      } catch (error) {
        console.error("Error loading conversations:", error);
        setLoading(false);
      }
    };

    loadConversations();
  }, [currentUser]);

  // Load messages with pagination
  const loadMessages = useCallback(async (conversationId, isLoadMore = false) => {
    if (!conversationId) return;
    
    try {
      const messagesRef = collection(db, "conversations", conversationId, "messages");
      let q;
      
      if (isLoadMore && lastMessageDoc) {
        q = query(messagesRef, orderBy("timestamp", "desc"), startAfter(lastMessageDoc), limit(30));
      } else {
        q = query(messagesRef, orderBy("timestamp", "desc"), limit(50));
      }
      
      const snapshot = await getDocs(q);
      const msgs = [];
      let lastDoc = null;
      
      snapshot.forEach((docSnap) => {
        const msgData = docSnap.data();
        msgs.unshift({
          id: docSnap.id,
          ...msgData,
          timestamp: msgData.timestamp?.toDate?.() || new Date(msgData.timestamp)
        });
        lastDoc = docSnap;
      });
      
      if (isLoadMore) {
        setMessages(prev => [...msgs, ...prev]);
      } else {
        setMessages(msgs);
      }
      
      setLastMessageDoc(lastDoc);
      setHasMoreMessages(snapshot.size === 50);
      
      if (!isLoadMore) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 100);
      }
      
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, [lastMessageDoc]);

  // Real-time messages listener for selected chat
  useEffect(() => {
    if (!selectedChat || !selectedChat.id) return;

    loadMessages(selectedChat.id, false);
    
    const messagesRef = collection(db, "conversations", selectedChat.id, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const msgData = change.doc.data();
          const newMsg = {
            id: change.doc.id,
            ...msgData,
            timestamp: msgData.timestamp?.toDate?.() || new Date(msgData.timestamp)
          };
          
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          if (newMsg.senderId !== currentUser?.uid && selectedChat.id) {
            markMessagesAsRead(selectedChat.id);
          }
          
          if (!isScrollingRef.current) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        }
      });
    });
    
    unsubscribersRef.current.push(unsubscribe);
    
    if (selectedChat.id) {
      markMessagesAsRead(selectedChat.id);
    }
    
    return () => unsubscribe();
  }, [selectedChat, currentUser]);

  // Listen to other user's typing status
  useEffect(() => {
    if (!selectedChat || !selectedChat.userId) return;
    
    const typingRef = doc(db, "conversations", selectedChat.id, "typing", selectedChat.userId);
    const unsubscribe = onSnapshot(typingRef, (docSnap) => {
      if (docSnap.exists()) {
        setOtherUserTyping(docSnap.data().isTyping || false);
      } else {
        setOtherUserTyping(false);
      }
    });
    
    unsubscribersRef.current.push(unsubscribe);
    return () => unsubscribe();
  }, [selectedChat]);

  // Handle scroll to load more messages
  const handleScroll = useCallback(async (e) => {
    const container = e.target;
    if (container.scrollTop === 0 && !loadingMore && hasMoreMessages && selectedChat) {
      isScrollingRef.current = true;
      setLoadingMore(true);
      
      const previousScrollHeight = container.scrollHeight;
      await loadMessages(selectedChat.id, true);
      
      setTimeout(() => {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - previousScrollHeight;
        isScrollingRef.current = false;
        setLoadingMore(false);
      }, 100);
    }
  }, [loadingMore, hasMoreMessages, selectedChat, loadMessages]);

  const formatTime = (date) => {
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

  const markMessagesAsRead = async (conversationId) => {
    if (!conversationId || !currentUser) return;
    
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${currentUser.uid}`]: 0
      });
      
      const messagesRef = collection(db, "conversations", conversationId, "messages");
      const q = query(messagesRef, where("read", "==", false), where("receiverId", "==", currentUser.uid));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.update(docSnap.ref, { read: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!selectedChat || !selectedChat.userId) return;
    
    const messageText = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const tempMessage = {
      id: tempId,
      text: messageText,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.name || "User",
      senderPhoto: currentUser.photoURL || "",
      receiverId: selectedChat.userId,
      timestamp: new Date(),
      read: false,
      delivered: true,
      isTemp: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    
    try {
      const messagesRef = collection(db, "conversations", selectedChat.id, "messages");
      const messageData = {
        text: messageText,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.name || "User",
        senderPhoto: currentUser.photoURL || "",
        receiverId: selectedChat.userId,
        timestamp: new Date(),
        read: false,
        delivered: true
      };
      
      const docRef = await addDoc(messagesRef, messageData);
      
      const conversationRef = doc(db, "conversations", selectedChat.id);
      await updateDoc(conversationRef, {
        lastMessage: messageText,
        lastMessageTime: new Date(),
        [`unreadCount.${selectedChat.userId}`]: (conversations.find(c => c.id === selectedChat.id)?.unreadCount || 0) + 1
      });
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, id: docRef.id, isTemp: false } : msg
      ));
      
      if (notificationsEnabled) {
        sendMessageNotification(
          currentUser.uid,
          selectedChat.name,
          messageText,
          selectedChat.id
        );
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setNewMessage(messageText);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!selectedChat) return;
    
    if (e.target.value.trim()) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      updateTypingStatus(true);
      
      typingTimeoutRef.current = setTimeout(() => {
        updateTypingStatus(false);
      }, 1000);
    } else {
      updateTypingStatus(false);
    }
  };

  const updateTypingStatus = async (isTyping) => {
    if (!selectedChat || !selectedChat.userId) return;
    
    try {
      const typingRef = doc(db, "conversations", selectedChat.id, "typing", currentUser.uid);
      await setDoc(typingRef, {
        isTyping: isTyping,
        userId: currentUser.uid,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error updating typing status:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowMobileMenu(false);
    setHasMoreMessages(true);
    setLastMessageDoc(null);
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv =>
      conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return "Offline";
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

  const getMessageStatus = (msg) => {
    if (msg.senderId !== currentUser?.uid) return null;
    if (msg.read) return { icon: CheckCheck, color: "text-blue-500", title: "Read" };
    if (msg.delivered) return { icon: CheckCheck, color: "text-gray-500", title: "Delivered" };
    return { icon: Clock, color: "text-gray-400", title: "Sent" };
  };

  // Helper function to get profile image URL
  const getProfileImageUrl = (profile) => {
    if (profile?.photoURL) {
      return profile.photoURL;
    }
    // Fallback to Google profile picture based on email
    if (profile?.email) {
      return `https://www.gravatar.com/avatar/${btoa(profile.email)}?d=identicon&s=96`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-120px)]">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className={`${selectedChat && !showMobileMenu ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-gray-200 bg-white`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white sticky top-0 z-10">
            <h1 className="text-xl font-bold text-gray-800">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {conversations.filter(c => c.unread > 0).length > 0 
                ? `${conversations.filter(c => c.unread > 0).length} unread message${conversations.filter(c => c.unread > 0).length > 1 ? 's' : ''}`
                : "All caught up!"}
            </p>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 sticky top-[73px] bg-white z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-gray-50"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const profile = userProfiles[conv.userId] || {};
                const status = onlineStatus[conv.userId] || {};
                const profileImage = getProfileImageUrl(profile);
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectChat(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-all border-b border-gray-100 text-left ${
                      selectedChat?.id === conv.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                    }`}
                  >
                    {/* Avatar with Profile Picture */}
                    <div className="relative flex-shrink-0">
                      {profileImage ? (
                        <img 
                          src={profileImage} 
                          alt={conv.name} 
                          className="w-12 h-12 rounded-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=22c55e&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{conv.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      {status.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white animate-pulse"></span>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold text-gray-800 truncate">{conv.name}</p>
                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{conv.time}</p>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {status.isOnline ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-green-600 font-medium">Online</span>
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {status.lastSeen ? 
                              `Last seen ${formatLastSeen(status.lastSeen)}` : "Offline"}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Unread Badge */}
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">{conv.unread}</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div className={`${!selectedChat || showMobileMenu ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedChat(null);
                    setShowMobileMenu(true);
                  }}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="relative">
                  {(() => {
                    const profile = userProfiles[selectedChat.userId] || {};
                    const profileImage = getProfileImageUrl(profile);
                    
                    if (profileImage) {
                      return (
                        <img 
                          src={profileImage} 
                          alt={selectedChat.name} 
                          className="w-10 h-10 rounded-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=22c55e&color=fff`;
                          }}
                        />
                      );
                    }
                    return (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{selectedChat.name.charAt(0).toUpperCase()}</span>
                      </div>
                    );
                  })()}
                  {onlineStatus[selectedChat.userId]?.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white animate-pulse"></span>
                  )}
                </div>
                
                <div>
                  <p className="font-semibold text-gray-800">{selectedChat.name}</p>
                  <p className="text-xs">
                    {onlineStatus[selectedChat.userId]?.isOnline ? (
                      <span className="text-green-600 font-medium">Online</span>
                    ) : otherUserTyping ? (
                      <span className="text-gray-500 italic">Typing...</span>
                    ) : (
                      <span className="text-gray-400">
                        {onlineStatus[selectedChat.userId]?.lastSeen ? 
                          `Last seen ${formatLastSeen(onlineStatus[selectedChat.userId].lastSeen)}` : "Offline"}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white"
              onScroll={handleScroll}
              ref={messagesContainerRef}
            >
              {loadingMore && (
                <div className="flex justify-center py-2">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === currentUser?.uid;
                  const status = getMessageStatus(msg);
                  const StatusIcon = status?.icon;
                  
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-fadeIn`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isOwn
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-800 shadow-sm border border-gray-100"
                        }`}
                      >
                        <p className="text-sm break-words leading-relaxed">{msg.text}</p>
                        <div className={`text-xs mt-1.5 flex items-center gap-1 justify-end ${isOwn ? "text-green-100" : "text-gray-400"}`}>
                          <span>
                            {msg.timestamp?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || 
                             new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && StatusIcon && !msg.isTemp && (
                            <span title={status?.title}>
                              <StatusIcon className={`w-3 h-3 ${status?.color}`} />
                            </span>
                          )}
                          {msg.isTemp && (
                            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2 items-end">
                <textarea
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm resize-none max-h-32 min-h-[44px] bg-gray-50"
                  style={{ overflowY: 'auto' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-b from-gray-50 to-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Select a conversation</h3>
              <p className="text-sm text-gray-500 mt-1">Choose a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}