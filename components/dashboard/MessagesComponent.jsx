"use client";
import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  Search, 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  ArrowLeft,
  User,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  Smile,
  Paperclip,
  Mic
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { 
  db,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from "@/lib/firebase";

export default function MessagesComponent() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState({});

  // Sample conversations data (in production, fetch from Firebase)
  useEffect(() => {
    // Simulate loading conversations
    const loadConversations = async () => {
      setLoading(true);
      // In production, fetch from Firestore
      const sampleConversations = [
        {
          id: "1",
          name: "John Electrician",
          avatar: null,
          lastMessage: "I'll be there at 3 PM",
          time: "10:30 AM",
          unread: 2,
          online: true,
          lastSeen: "Online",
          phone: "+880123456789",
          email: "john@example.com"
        },
        {
          id: "2",
          name: "Mike Plumber",
          avatar: null,
          lastMessage: "Thanks for your booking!",
          time: "Yesterday",
          unread: 0,
          online: false,
          lastSeen: "Last seen 2 hours ago",
          phone: "+880987654321",
          email: "mike@example.com"
        },
        {
          id: "3",
          name: "David Carpenter",
          avatar: null,
          lastMessage: "Please confirm your address",
          time: "Yesterday",
          unread: 1,
          online: false,
          lastSeen: "Last seen yesterday",
          phone: "+880555555555",
          email: "david@example.com"
        },
        {
          id: "4",
          name: "Sarah Gardener",
          avatar: null,
          lastMessage: "Your garden work is completed",
          time: "Dec 15, 2024",
          unread: 0,
          online: true,
          lastSeen: "Online",
          phone: "+880444444444",
          email: "sarah@example.com"
        }
      ];
      setConversations(sampleConversations);
      setLoading(false);
    };

    loadConversations();
  }, [currentUser]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      // Simulate loading messages
      const sampleMessages = [
        {
          id: "1",
          text: "Hello, I need electrical service",
          sender: "user",
          time: "10:00 AM",
          status: "read"
        },
        {
          id: "2",
          text: "Sure! What seems to be the problem?",
          sender: "other",
          time: "10:05 AM",
          status: "read"
        },
        {
          id: "3",
          text: "My lights are flickering and sometimes go off",
          sender: "user",
          time: "10:06 AM",
          status: "read"
        },
        {
          id: "4",
          text: "I can come check it out. What's your address?",
          sender: "other",
          time: "10:10 AM",
          status: "read"
        },
        {
          id: "5",
          text: "123 Green Road, Dhaka",
          sender: "user",
          time: "10:12 AM",
          status: "delivered"
        },
        {
          id: "6",
          text: "I'll be there at 3 PM today",
          sender: "other",
          time: "10:30 AM",
          status: "delivered"
        }
      ];
      setMessages(sampleMessages);
      
      // Mark as read
      if (selectedChat.unread > 0) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedChat.id ? { ...conv, unread: 0 } : conv
          )
        );
      }
    }
  }, [selectedChat]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent"
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage("");
    
    // Simulate reply after 1 second (in production, this would be from Firebase)
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for your message! I'll get back to you shortly.",
        sender: "other",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "read"
      };
      setMessages(prev => [...prev, reply]);
      
      // Update last message in conversation list
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedChat?.id
            ? { ...conv, lastMessage: newMessage, time: "Just now" }
            : conv
        )
      );
    }, 1000);
    
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

  const getStatusIcon = (status) => {
    switch(status) {
      case "read": return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case "delivered": return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "sent": return <CheckCheck className="w-3 h-3 text-gray-400" />;
      default: return <Clock className="w-3 h-3 text-gray-400" />;
    }
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
        {/* Conversations List - Left Side */}
        <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r border-gray-200`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <h1 className="text-xl font-bold text-gray-800">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">You have {conversations.filter(c => c.unread > 0).length} unread messages</p>
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
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
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
                    selectedChat?.id === conv.id ? 'bg-green-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  {conv.avatar ? (
                    <img src={conv.avatar} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center flex-shrink-0">
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
                        <span className="text-xs text-gray-400">{conv.lastSeen}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Unread Badge */}
                  {conv.unread > 0 && (
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{selectedChat.name.charAt(0)}</span>
                  </div>
                )}
                
                <div>
                  <p className="font-semibold text-gray-800">{selectedChat.name}</p>
                  <p className="text-xs text-green-600">
                    {selectedChat.online ? 'Online' : selectedChat.lastSeen}
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
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.sender === "user"
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender === "user" ? "text-green-200" : "text-gray-400"}`}>
                      <span className="text-xs">{msg.time}</span>
                      {msg.sender === "user" && getStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <ImageIcon className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition md:hidden">
                  <Mic className="w-5 h-5 text-gray-500" />
                </button>
                
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows="1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none text-sm"
                    style={{ maxHeight: "100px" }}
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-green-600 hover:bg-green-700 rounded-full transition disabled:opacity-50"
                >
                  <Send className="w-5 h-5 text-white" />
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