"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  MapPin,
  Phone,
  DollarSign,
  Clock,
  Send,
  MessageCircle,
  Star,
  CheckCircle,
  Briefcase,
  Info,
  ClipboardList,
  AlertTriangle,
  X,
  Zap,
} from "lucide-react";
import { MOCK_TECHNICIANS } from "@/app/data/technicians";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// --- 1. SHARED INPUT COMPONENT (MOVED OUTSIDE) ---
const FormInput = ({ id, label, type = "text", value, onChange, placeholder, error, rows }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block mb-1 font-medium">
        {label} {type !== "textarea" && "*"}
      </label>
      {type === "textarea" ? (
        <textarea
          id={id}
          rows={rows || 4}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          key={id} 
          className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
          }`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          key={id} 
          className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 ${
            error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
          }`}
        />
      )}
      {error && <p className="text-red-600 text-sm mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {error}</p>}
    </div>
);
// --- END: FORM INPUT COMPONENT ---


// --- 2. FLOATING CHAT WIDGET (MOVED OUTSIDE) ---
const FloatingChatWidget = ({ 
    technician, 
    isChatOpen, 
    setIsChatOpen, 
    messages, 
    newMessage, 
    setNewMessage, 
    handleSendMessage, 
    isTyping,
    messagesEndRef 
}) => {
    if (!technician) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isChatOpen ? (
                <div className="bg-white w-80 h-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
                    <div className="p-3 bg-indigo-600 text-white rounded-t-xl flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{technician.name}</h3>
                            <p className="text-xs opacity-80">Online</p>
                        </div>
                        <button onClick={() => setIsChatOpen(false)}><X className="w-4 h-4"/></button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                                <div 
                                    className={`p-2 rounded-xl text-xs max-w-[80%] 
                                    ${msg.sender === "me" ? "bg-green-500 text-white" : "bg-gray-300 text-gray-800"}`}
                                >
                                    <p>{msg.text}</p>
                                    <span className="text-[8px] block mt-1">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] p-2 rounded-xl text-sm shadow bg-gray-300 text-gray-800 rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse delay-75"></span>
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse delay-150"></span>
                                        <span className="h-2 w-2 bg-gray-500 rounded-full animate-pulse delay-300"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef}/>
                    </div>
                    <div className="p-3 border-t bg-white flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e)=>{if(e.key==="Enter") handleSendMessage();}}
                            placeholder="Type a message..."
                            className="flex-1 border border-gray-300 rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                        />
                        <button 
                            onClick={handleSendMessage} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full disabled:bg-indigo-400"
                            disabled={!newMessage.trim()}
                        >
                            <Send className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={()=>setIsChatOpen(true)} className="w-16 h-16 bg-indigo-600 rounded-full shadow-xl text-white flex items-center justify-center hover:bg-indigo-700 transition-transform transform hover:scale-105">
                    <MessageCircle className="w-8 h-8"/>
                </button>
            )}
        </div>
    );
}
// --- END: FLOATING CHAT WIDGET ---


// --- 3. PROFILE CONTENT (MOVED OUTSIDE) ---
const ProfileContent = ({ 
    technician, 
    activeTab, 
    setActiveTab, 
    hireRequest, 
    setHireRequest, 
    formErrors, 
    handleHireSubmit,
    isSubmitting,
    submissionSuccess
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left profile card */}
            <div className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="h-32 bg-indigo-600 flex items-center justify-center relative">
                    <img
                        src={technician.imageUrl}
                        alt={technician.name}
                        className="w-36 h-36 rounded-full border-4 border-white absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 object-cover shadow-xl"
                    />
                </div>
                <div className="p-6 pt-20 text-center">
                    <h1 className="text-3xl font-bold">{technician.name}</h1>
                    <p className="text-indigo-700 font-semibold mb-2">{technician.title}</p>
                    <p className="flex justify-center items-center gap-1 text-yellow-500 font-semibold">
                        ⭐ {technician.rating} <span>({technician.reviews} reviews)</span>
                    </p>
                    <p className="mt-3 text-gray-700">{technician.description}</p>
                    <p className="mt-3 font-medium"><MapPin className="inline w-4 h-4 mr-1"/> {technician.location}</p>
                    <p className="mt-1 font-medium"><DollarSign className="inline w-4 h-4 mr-1"/> ${technician.price}/hr</p>
                </div>
            </div>

            {/* Right tab + hire form */}
            <div className="lg:col-span-2 flex flex-col">
                <div className="bg-white rounded-xl shadow-2xl flex flex-col min-h-[500px] overflow-hidden">
                    <div className="p-1 border-b flex justify-around bg-gray-50">
                        <button
                            onClick={() => setActiveTab("hire")}
                            className={`flex-1 py-3 font-bold border-b-2 ${
                                activeTab === "hire" ? "text-indigo-600 border-indigo-600" : "text-gray-600 border-transparent hover:border-gray-300"
                            }`}
                        >
                            <ClipboardList className="inline w-5 h-5 mr-1"/> Hire
                        </button>
                        <button
                            onClick={() => setActiveTab("about")}
                            className={`flex-1 py-3 font-bold border-b-2 ${
                                activeTab === "about" ? "text-indigo-600 border-indigo-600" : "text-gray-600 border-transparent hover:border-gray-300"
                            }`}
                        >
                            <Info className="inline w-5 h-5 mr-1"/> About
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === "hire" && (
                            <>
                                {submissionSuccess && (
                                    <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5"/>
                                        <span className="font-semibold">Success!</span> Your request has been submitted and a chat started.
                                    </div>
                                )}
                                <form onSubmit={handleHireSubmit}>
                                    <FormInput
                                        id="category"
                                        label="Service Category"
                                        value={hireRequest.category}
                                        onChange={(e) => setHireRequest(prev => ({ ...prev, category: e.target.value }))}
                                        placeholder="e.g. Refrigerator Repair"
                                        error={formErrors.category}
                                    />
                                    <FormInput
                                        id="description"
                                        label="Description"
                                        type="textarea"
                                        value={hireRequest.description}
                                        onChange={(e) => setHireRequest(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Provide details of the issue"
                                        error={formErrors.description}
                                        rows={6}
                                    />
                                    <FormInput
                                        id="budget"
                                        label="Budget ($)"
                                        type="number"
                                        value={hireRequest.budget}
                                        onChange={(e) => setHireRequest(prev => ({ ...prev, budget: e.target.value }))}
                                        placeholder="Min $50"
                                        error={formErrors.budget}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className={`mt-4 w-full md:w-auto text-white px-5 py-2 rounded-lg font-bold transition-colors ${
                                            isSubmitting 
                                                ? 'bg-indigo-400 cursor-not-allowed' 
                                                : 'bg-indigo-600 hover:bg-indigo-700'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2 justify-center">
                                                <Zap className="w-4 h-4 animate-pulse"/> Submitting...
                                            </span>
                                        ) : (
                                            'Submit Hire Request'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                        {activeTab === "about" && (
                            <div>
                                <h3 className="text-xl font-bold mb-2">About {technician.name}</h3>
                                <p className="text-gray-700">{technician.description}</p>
                                <p className="mt-2 text-gray-700">Location: {technician.location}</p>
                                <p className="mt-1 text-gray-700">Price: ${technician.price}/hr</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END: PROFILE CONTENT ---


// --- 4. MAIN COMPONENT (State Holder) ---
export default function HirePage() {
  const { id } = useParams();
  const router = useRouter();
  
  // 1. ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hire");

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Hire Form
  const [hireRequest, setHireRequest] = useState({ category: "", description: "", budget: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // --- START: MOVED useCallbacks TO FIX HOOK ORDER ERROR ---

  // Form Validation
  const validateHireForm = useCallback(() => {
    const errors = {};
    if (!hireRequest.category.trim()) errors.category = "Service category is required";
    if (!hireRequest.description.trim() || hireRequest.description.length < 20)
      errors.description = "Description must be at least 20 characters";
    if (!hireRequest.budget || parseFloat(hireRequest.budget) <= 50)
      errors.budget = "Budget must be greater than $50";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [hireRequest]); 

  // Send Message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    setMessages((prev) => [
      ...prev,
      { sender: "me", text: newMessage, time: new Date().toLocaleTimeString() },
    ]);
    const messageToSend = newMessage; 
    setNewMessage("");
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "tech",
          text: `Thanks! I received your message: "${messageToSend.substring(0, 30)}..."`,
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }, 2000);
  }, [newMessage]); 

  // Hire Submit
  const handleHireSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validateHireForm()) return;

    setIsSubmitting(true);
    setSubmissionSuccess(false);

    // Simulate API submission delay
    setTimeout(() => {
        setIsSubmitting(false);

        setMessages((prev) => [
            ...prev,
            {
                sender: "me",
                text: `✅ Hire Request Submitted: ${hireRequest.category} - $${hireRequest.budget}`,
                time: new Date().toLocaleTimeString(),
            },
        ]);
    
        setHireRequest({ category: "", description: "", budget: "" });
        setFormErrors({});
        setSubmissionSuccess(true);
        setTimeout(() => setSubmissionSuccess(false), 5000); 

        setIsChatOpen(true);
    }, 1000);
  }, [hireRequest, validateHireForm]); 

  // --- END: MOVED useCallbacks ---

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!id) return;
    const tech = MOCK_TECHNICIANS.find((t) => parseInt(t.id) === parseInt(id));
    setTechnician(tech);
    setLoading(false);

    if (tech) {
      setMessages([
        {
          sender: "tech",
          text: `Hello! I am ${tech.name}. How can I assist you with your appliance repair today?`,
          time: new Date(Date.now() - 60000).toLocaleTimeString(),
        },
      ]);

      const chatTimer = setTimeout(() => setIsChatOpen(true), 1500);
      return () => clearTimeout(chatTimer);
    }
  }, [id]);

  useEffect(scrollToBottom, [messages, isTyping]);


  // 2. CONDITIONAL RENDERING AFTER ALL HOOKS
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!technician) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4">Technician not found</h2>
        <Link href="/services/appliance-repair" className="text-blue-600 underline">
          Go Back to Services
        </Link>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto">
        <ProfileContent 
            technician={technician}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hireRequest={hireRequest}
            setHireRequest={setHireRequest}
            formErrors={formErrors}
            handleHireSubmit={handleHireSubmit}
            isSubmitting={isSubmitting}
            submissionSuccess={submissionSuccess}
        />
      </main>

      {/* Floating Chat */}
      <FloatingChatWidget 
        technician={technician}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />

      <Footer />
    </div>
  );
}