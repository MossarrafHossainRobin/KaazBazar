"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  MapPin,
  User,
  CheckCircle,
  Phone,
  Spade,
  Clock,
  DollarSign,
  ClipboardList,
  Info,
  MessageCircle,
  X,
  Star
} from "lucide-react";
import { getGardenerById } from '@/app/data/gardeners';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function GardenerHirePage() {
  const params = useParams();
  const { id } = params || {};

  const [profile, setProfile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("hire");
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    serviceType: '',
    projectSize: 'Small (Lawn/Hedges)',
    date: '',
    time: '',
    message: ''
  });

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    const data = getGardenerById(id);
    setProfile(data);
    if (data) {
      setMessages([
        { sender: "gardener", text: `Hi! I'm ${data.name}. How can I help with your garden today?`, time: new Date().toLocaleTimeString() }
      ]);
    }
  }, [id]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg">
          <Leaf className="w-16 h-16 text-lime-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gardener Not Found</h1>
          <p className="text-gray-600">The profile with ID: <strong>{id || "unknown"}</strong> could not be loaded.</p>
          <Link href="/services/gardeners" className="mt-4 inline-block text-lime-600 hover:underline">&larr; Back to Directory</Link>
        </div>
      </div>
    );
  }

  const dynamicColor = profile.color || "#4d7c0f";

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setMessages(prev => [
      ...prev,
      { sender: "me", text: `Booking Request Sent: ${formData.serviceType} - ${formData.projectSize}`, time: new Date().toLocaleTimeString() }
    ]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { sender: "me", text: newMessage, time: new Date().toLocaleTimeString() }]);
    setNewMessage("");
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: "gardener", text: `Thanks for your message: "${newMessage.substring(0, 30)}..."`, time: new Date().toLocaleTimeString() }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left profile card */}
          <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="h-32 bg-lime-600 flex items-center justify-center relative">
              <img src={profile.profilePic} alt={profile.name} className="w-36 h-36 rounded-full border-4 border-white absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 object-cover shadow-xl"/>
            </div>
            <div className="p-6 pt-20 text-center">
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-lime-700 font-semibold mb-2">{profile.title}</p>
              <p className="flex justify-center items-center gap-1 text-yellow-500 font-semibold">
                <Star className="w-4 h-4"/> {profile.rating || 5} ({profile.reviews || 0} reviews)
              </p>
              <p className="mt-3 text-gray-700">{profile.description}</p>
              <p className="mt-3 font-medium"><MapPin className="inline w-4 h-4 mr-1"/> {profile.location}</p>
              <p className="mt-1 font-medium"><DollarSign className="inline w-4 h-4 mr-1"/> ${profile.price}/hr</p>
            </div>
          </div>

          {/* Right tab + hire form */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white rounded-xl shadow-2xl flex flex-col min-h-[500px] overflow-hidden">
              <div className="p-1 border-b flex justify-around bg-gray-50">
                <button onClick={() => setActiveTab("hire")} className={`flex-1 py-3 font-bold border-b-2 ${activeTab==="hire" ? "text-lime-600 border-lime-600" : "text-gray-600 border-transparent hover:border-gray-300"}`}>
                  <ClipboardList className="inline w-5 h-5 mr-1"/> Hire
                </button>
                <button onClick={() => setActiveTab("about")} className={`flex-1 py-3 font-bold border-b-2 ${activeTab==="about" ? "text-lime-600 border-lime-600" : "text-gray-600 border-transparent hover:border-gray-300"}`}>
                  <Info className="inline w-5 h-5 mr-1"/> About
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {activeTab==="hire" && (
                  isSubmitted ? (
                    <div className="text-center py-16">
                      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4"/>
                      <h2 className="text-3xl font-bold text-gray-800 mb-3">Booking Request Sent!</h2>
                      <p className="text-lg text-gray-600">
                        <strong>{profile.name}</strong> will contact you within <strong>{profile.responseTime}</strong> at <strong>{formData.clientPhone}</strong>.
                      </p>
                      <Link href="/services/gardeners" className="mt-6 inline-block px-6 py-3 text-white font-semibold rounded-lg hover:brightness-110 transition-colors" style={{backgroundColor: dynamicColor}}>
                        Explore More Gardeners
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" id="clientName" value={formData.clientName} onChange={handleChange} placeholder="Full Name" required className="w-full p-3 border rounded-lg focus:ring-lime-500 focus:border-lime-500"/>
                        <input type="tel" id="clientPhone" value={formData.clientPhone} onChange={handleChange} placeholder="Phone Number" required className="w-full p-3 border rounded-lg focus:ring-lime-500 focus:border-lime-500"/>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select id="serviceType" value={formData.serviceType} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-lime-500 focus:border-lime-500">
                          <option value="" disabled>-- Select a Service Type --</option>
                          {profile.categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                        <select id="projectSize" value={formData.projectSize} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-lime-500 focus:border-lime-500">
                          <option>Small (Lawn/Hedges)</option>
                          <option>Medium (Full Garden Tidy)</option>
                          <option>Large (Landscaping / Tree Removal)</option>
                          <option>Recurring Maintenance Contract</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="date" id="date" value={formData.date} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-lime-500 focus:border-lime-500"/>
                        <input type="time" id="time" value={formData.time} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-lime-500 focus:border-lime-500"/>
                      </div>
                      <textarea id="message" rows="4" placeholder="Additional details" value={formData.message} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-lime-500 focus:border-lime-500"/>
                      <button type="submit" className="w-full flex items-center justify-center py-4 text-white text-xl font-bold rounded-xl" style={{backgroundColor: dynamicColor}}>
                        <Leaf className="w-6 h-6 mr-3"/> Send Quote Request
                      </button>
                    </form>
                  )
                )}

                {activeTab==="about" && (
                  <div>
                    <h3 className="text-xl font-bold mb-2">About {profile.name}</h3>
                    <p className="text-gray-700">{profile.description}</p>
                    <p className="mt-2 text-gray-700">Location: {profile.location}</p>
                    <p className="mt-1 text-gray-700">Price: ${profile.price}/hr</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {chatOpen && (
          <div className="w-80 bg-white rounded-xl shadow-xl flex flex-col overflow-hidden mb-4">
            <div className="bg-lime-600 text-white p-3 flex justify-between items-center">
              <span>Chat with {profile.name}</span>
              <button onClick={() => setChatOpen(false)}><X className="w-5 h-5"/></button>
            </div>
            <div className="p-3 h-60 overflow-y-auto flex flex-col gap-2">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender==="me"?"justify-end":"justify-start"}`}>
                  <div className={`px-3 py-2 rounded-xl ${msg.sender==="me"?"bg-lime-600 text-white":"bg-gray-200 text-gray-800"}`}>
                    {msg.text}
                    <div className="text-xs text-gray-500 mt-1 text-right">{msg.time}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
            <div className="p-3 border-t flex gap-2">
              <input type="text" placeholder="Type a message..." className="flex-1 p-2 border rounded-lg" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key==="Enter" && handleSendMessage()}/>
              <button onClick={handleSendMessage} className="bg-lime-600 p-2 rounded-lg text-white">Send</button>
            </div>
          </div>
        )}
        <button onClick={() => setChatOpen(prev => !prev)} className="w-16 h-16 bg-lime-600 rounded-full shadow-xl text-white flex items-center justify-center hover:bg-lime-700 transition-transform transform hover:scale-105">
          <MessageCircle className="w-8 h-8"/>
        </button>
      </div>

      <Footer />
    </div>
  );
}
