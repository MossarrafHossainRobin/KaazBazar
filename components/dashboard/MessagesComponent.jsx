"use client";
import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  Search, 
  Send, 
  ArrowLeft,
  User,
  CheckCheck,
  Clock,
  MoreVertical,
  Phone,
  Video
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  getUserConversations, 
  listenToMessages, 
  sendMessage, 
  markMessagesAsRead,
  updateUserStatus
} from "@/lib/chatService";
import { sendMessageNotification, requestNotificationPermission } from "@/lib/notificationService";

export default function MessagesComponent() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sending, setSending] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const previousMessagesRef = useRef([]);

  // Request notification permission on mount
  useEffect(() => {
    const initNotifications = async () => {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
    };
    initNotifications();
  }, []);

  // Load conversations
  useEffect(() => {
    if (currentUser) {
      loadConversations();
      updateUserStatus(currentUser.uid, true);
      return () => {
        updateUserStatus(currentUser.uid, false);
      };
    }
  }, [currentUser]);

  const loadConversations = async () => {
    setLoading(true);
    const result = await getUserConversations(currentUser.uid);
    if (result.success) {
      const formattedConvos = result.data.map(conv => {
        const otherParticipantId = conv.participants?.find(p => p !== currentUser.uid);
        const otherUserData = conv.participantsData?.[otherParticipantId] || {};
        
        return {
          id: conv.id,
          name: otherUserData.name || "User",
          avatar: otherUserData.photoURL,
          lastMessage: conv.lastMessage || "No messages yet",
          time: conv.lastMessageTime ? new Date(conv.lastMessageTime.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "New",
          unread: conv.unreadCount?.[currentUser.uid] || 0,
          online: otherUserData.isOnline || false,
          lastSeen: otherUserData.lastSeen,
          userId: otherParticipantId
        };
      });
      setConversations(formattedConvos);
    }
    setLoading(false);
  };

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat && selectedChat.userId) {
      // Mark messages as read
      markMessagesAsRead(selectedChat.id, currentUser.uid);
      
      // Listen to real-time messages
      const unsubscribe = listenToMessages(selectedChat.id, (newMessages) => {
        // Check for new messages
        const previousMessages = previousMessagesRef.current;
        const lastMessage = newMessages[newMessages.length - 1];
        const previousLastMessage = previousMessages[previousMessages.length - 1];
        
        // If there's a new message from other user
        if (lastMessage && 
            lastMessage.senderId !== currentUser.uid && 
            (!previousLastMessage || previousLastMessage.id !== lastMessage.id)) {
          
          // Send notification
          sendMessageNotification(
            currentUser.uid,
            selectedChat.name,
            lastMessage.text,
            selectedChat.id
          );
          
          // Play notification sound
          playNotificationSound();
        }
        
        setMessages(newMessages);
        previousMessagesRef.current = newMessages;
        
        // Mark as read when new messages arrive
        markMessagesAsRead(selectedChat.id, currentUser.uid);
      });
      
      return () => unsubscribe();
    }
  }, [selectedChat, currentUser]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle active conversation from localStorage
  useEffect(() => {
    const activeConversationId = localStorage.getItem("activeConversationId");
    if (activeConversationId && conversations.length > 0) {
      const activeConv = conversations.find(c => c.id === activeConversationId);
      if (activeConv) {
        setSelectedChat(activeConv);
        localStorage.removeItem("activeConversationId");
      }
    }
  }, [conversations]);

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(e => console.log("Audio play failed:", e));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    if (!selectedChat || !selectedChat.userId) {
      console.error("No selected chat or userId");
      return;
    }
    
    setSending(true);
    const messageData = {
      text: newMessage,
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderPhoto: currentUser.photoURL || "",
      receiverId: selectedChat.userId,
      timestamp: new Date(),
      read: false,
      delivered: true
    };
    
    const result = await sendMessage(selectedChat.id, messageData);
    if (result.success) {
      setNewMessage("");
    } else {
      console.error("Failed to send message:", result.error);
    }
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-120px)]">
      <div className="flex h-full">
        {/* Conversations List - Left Side */}
        <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-gray-200`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <h1 className="text-xl font-bold text-gray-800">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">You have {conversations.filter(c => c.unread > 0).length} unread messages</p>
            {!notificationsEnabled && (
              <p className="text-xs text-yellow-600 mt-2">
                ⚡ Notifications disabled. Allow notifications to get message alerts.
              </p>
            )}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none text-sm"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition border-b border-gray-100 text-left ${
                    selectedChat?.id === conv.id ? 'bg-gray-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  {conv.avatar ? (
                    <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">{conv.name.charAt(0)}</span>
                    </div>
                  )}
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-gray-800 truncate">{conv.name}</p>
                      <p className="text-xs text-gray-400 flex-shrink-0">{conv.time}</p>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {conv.online ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          <span className="text-xs text-green-600">Online</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">{conv.lastSeen || "Offline"}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Unread Badge */}
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-medium">{conv.unread}</span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area - Right Side */}
        {selectedChat ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                {selectedChat.avatar ? (
                  <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{selectedChat.name.charAt(0)}</span>
                  </div>
                )}
                
                <div>
                  <p className="font-semibold text-gray-800">{selectedChat.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedChat.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex ${msg.senderId === currentUser.uid ? "justify-end" : "justify-start"} animate-fadeIn`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.senderId === currentUser.uid
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-800 shadow-sm border border-gray-100"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                      <div className={`text-xs mt-1 flex items-center gap-1 ${msg.senderId === currentUser.uid ? "text-gray-400" : "text-gray-400"}`}>
                        <span>
                          {msg.timestamp?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 
                           new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.senderId === currentUser.uid && (
                          <>
                            {msg.read ? (
                              <CheckCheck className="w-3 h-3 text-blue-500" />
                            ) : msg.delivered ? (
                              <CheckCheck className="w-3 h-3 text-gray-500" />
                            ) : (
                              <Clock className="w-3 h-3 text-gray-500" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800">Select a conversation</h3>
              <p className="text-sm text-gray-500 mt-1">Choose a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}