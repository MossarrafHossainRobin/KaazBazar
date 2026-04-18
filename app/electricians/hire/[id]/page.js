"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  User,
  MapPin,
  Phone,
  DollarSign,
  Clock,
  Send,
  MessageCircle,
  Info,
  Star,
  ClipboardList,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  X,
  Zap,
} from "lucide-react";
import { getElectricianById } from "@/app/data/electricians";
import Footer from "@/components/Footer"; 
import Navbar from "@/components/Navbar";

// Mock Data Enhancements (for demonstration)
const MOCK_PROFILE_DATA = {
    rating: 4.8,
    reviewCount: 185,
    projectsCompleted: 450,
    experienceYears: 12,
    skills: ["Smart Home Setup", "Commercial Wiring", "Panel Upgrades", "Emergency Repair"],
    coverImageUrl: "https://source.unsplash.com/random/800x200?electrician,blueprint" 
};

// --- 1. SHARED INPUT COMPONENT (MOVED OUTSIDE) ---
const FormInput = ({ id, label, type = "text", placeholder, value, onChange, isRequired, error, rows }) => (
    <div className={type === "textarea" ? "md:col-span-2" : ""}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full border rounded-lg p-3 text-base focus:outline-none focus:ring-2 transition-shadow 
                        ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 hover:border-indigo-400'}`}
        />
      ) : (
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            // Add key prop to ensure consistent input element identity
            key={id} 
            className={`w-full border rounded-lg p-3 text-base focus:outline-none focus:ring-2 transition-shadow 
                        ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 hover:border-indigo-400'}`}
        />
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3"/> {error}
        </p>
      )}
    </div>
);
// --- END: FORM INPUT COMPONENT ---


// --- 2. FLOATING CHAT WIDGET COMPONENT (MOVED OUTSIDE) ---
const FloatingChatWidget = ({ 
    profile, 
    isChatOpen, 
    setIsChatOpen, 
    messages, 
    isTyping,
    newMessage,
    setNewMessage,
    handleSendMessage,
    messagesEndRef 
}) => {
    return (
        <div className="fixed bottom-6 right-6 z-50 transition-transform duration-500 ease-out">
            
            {isChatOpen && (
                <div className="bg-white w-80 h-[400px] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden border border-gray-200">
                    
                    {/* Chat Header */}
                    <div className="p-3 bg-indigo-600 text-white rounded-t-xl flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2">
                            <img
                                src={profile.imageUrl || "/default-profile.png"}
                                alt={profile.name}
                                className="w-8 h-8 rounded-full border border-white"
                            />
                            <div>
                                <h3 className="font-bold text-sm leading-none">{profile.name}</h3>
                                <p className="text-[10px] opacity-80">Online | {profile.responseTime} response</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsChatOpen(false)} 
                            className="p-1 rounded-full hover:bg-indigo-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    key={index} // Key for the message bubble container itself
                                    className={`max-w-[85%] p-2 rounded-xl text-xs shadow-sm 
                                    ${msg.sender === "me"
                                        ? "bg-green-500 text-white rounded-br-none" 
                                        : "bg-gray-300 text-gray-800 rounded-bl-none"
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap break-all">{msg.text}</p>
                                    <span className={`block text-[8px] mt-1 ${msg.sender === "me" ? 'text-white/70' : 'text-gray-600'} text-right`}>
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
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
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 border-t bg-white flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleSendMessage();
                            }}
                            placeholder="Message..."
                            className="flex-1 border border-gray-300 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus 
                        />
                        <button
                            onClick={handleSendMessage}
                            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all disabled:bg-indigo-400"
                            disabled={!newMessage.trim()}
                            title="Send Message"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Chat Button */}
            {!isChatOpen && (
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="w-16 h-16 bg-indigo-600 rounded-full shadow-xl text-white flex items-center justify-center hover:bg-indigo-700 transition-all transform hover:scale-105"
                    title="Open Live Chat"
                >
                    <MessageCircle className="w-8 h-8" />
                </button>
            )}
        </div>
    );
}
// --- END: FLOATING CHAT WIDGET COMPONENT ---


// --- 3. MAIN PROFILE CONTENT COMPONENT (MOVED OUTSIDE) ---
// This component now takes only necessary props, isolating it from the main component's state changes
const ProfileContent = ({ 
    profile, 
    loading, 
    id, 
    router,
    activeTab, 
    setActiveTab, 
    hireRequest, 
    setHireRequest, 
    formErrors, 
    handleHireSubmit,
    isSubmitting,
    submissionSuccess
}) => {
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
                    <div className="lg:col-span-1 h-[600px] bg-white rounded-xl shadow-lg"></div>
                    <div className="lg:col-span-2 h-[600px] bg-white rounded-xl shadow-lg"></div>
                </div>
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                 <div className="text-center bg-white p-10 rounded-xl shadow-2xl transition-all w-full max-w-md">
                    <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Profile Not Found
                    </h1>
                    <p className="text-gray-600">
                        The profile with ID **{id || "unknown"}** could not be loaded.
                    </p>
                    <button
                        onClick={() => router.push("/services/electricians")}
                        className="mt-6 inline-block py-2 px-4 border border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        &larr; Back to Service Directory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 relative">

            {/* 1. Left Profile Card (Remains the same) */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-2xl transition-all duration-500 overflow-hidden relative flex flex-col">
                    
                    {/* Header Area */}
                    <div 
                        className="h-32 relative bg-center bg-cover" 
                        style={{ backgroundImage: `url(${profile.coverImageUrl})` }}
                    >
                        <div className="absolute inset-0 bg-indigo-900 opacity-70"></div> 
                        <img
                        src={profile.imageUrl || "/default-profile.png"}
                        alt={profile.name}
                        className="w-36 h-36 rounded-full border-6 border-white ring-4 ring-white absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 object-cover shadow-2xl transition-transform hover:scale-[1.05]"
                        />
                    </div>

                    {/* Main Info */}
                    <div className="p-6 pt-20 text-center">
                        <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
                        <p className="text-md text-indigo-700 font-semibold mb-3">{profile.title}</p>
                        
                        {/* Metrics Bar */}
                        <div className="flex justify-around items-center border-t border-b py-3 mt-4 mb-4">
                            <div className="text-center transition-transform hover:scale-105">
                                <p className="text-xl font-bold text-gray-900 flex justify-center items-center gap-1">
                                    {profile.rating} <Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/>
                                </p>
                                <p className="text-xs text-gray-500">({profile.reviewCount} Reviews)</p>
                            </div>
                            <div className="text-center transition-transform hover:scale-105 border-l border-r px-4">
                                <p className="text-xl font-bold text-gray-900 flex justify-center items-center gap-1">
                                    {profile.projectsCompleted}+ <CheckCircle className="w-4 h-4 text-green-600"/>
                                </p>
                                <p className="text-xs text-gray-500">Projects Done</p>
                            </div>
                            <div className="text-center transition-transform hover:scale-105">
                                <p className="text-xl font-bold text-gray-900 flex justify-center items-center gap-1">
                                    {profile.experienceYears} <Briefcase className="w-4 h-4 text-orange-500"/>
                                </p>
                                <p className="text-xs text-gray-500">Years Exp.</p>
                            </div>
                        </div>
                        
                        {/* Contact and Pricing Details */}
                        <div className="space-y-3 text-sm text-gray-700 pt-3">
                            <div className="flex items-center justify-center space-x-3 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                              <MapPin className="w-4 h-4 text-indigo-500" />
                              <span className="font-medium">{profile.location}</span>
                            </div>
                            <div className="flex items-center justify-center space-x-3 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-lg text-green-700">${profile.price} / hr</span>
                            </div>
                            <div className="flex items-center justify-center space-x-3 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                              <Clock className="w-4 h-4 text-purple-600" />
                              <span className="font-medium">Avg. Response: {profile.responseTime}</span>
                            </div>
                            {profile.phone && (
                              <a href={`tel:${profile.phone}`} className="flex items-center justify-center space-x-3 p-2 rounded-lg text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span>Contact Directly</span>
                              </a>
                            )}
                        </div>
                    </div>

                    {/* Skills Tags Section */}
                    <div className="p-6 border-t mt-auto">
                        <h3 className="text-sm font-bold text-gray-700 mb-2 text-left">Specializations</h3>
                        <div className="flex flex-wrap gap-2 text-left">
                            {profile.skills.map((skill, index) => (
                                <span key={index} className="inline-flex items-center px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full transition-shadow hover:shadow-md cursor-default">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Right Side: Tabbed Content (Hire Form/Info) */}
            <div className="lg:col-span-2 flex flex-col">
                <div className="bg-white rounded-xl shadow-2xl flex flex-col min-h-[500px] overflow-hidden">
                    
                    {/* Tab Navigation */}
                    <div className="p-1 border-b flex justify-around bg-gray-50">
                        <button
                            onClick={() => setActiveTab("hire")}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold transition-all duration-300 text-sm border-b-2
                            ${activeTab === 'hire' 
                                ? 'text-indigo-600 border-indigo-600' 
                                : 'text-gray-600 border-transparent hover:border-gray-300'}`
                            }
                        >
                            <ClipboardList className="w-5 h-5" /> Project Request Form
                        </button>
                        <button
                            onClick={() => setActiveTab("about")}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 font-bold transition-all duration-300 text-sm border-b-2
                            ${activeTab === 'about' 
                                ? 'text-indigo-600 border-indigo-600' 
                                : 'text-gray-600 border-transparent hover:border-gray-300'}`
                            }
                        >
                            <Info className="w-5 h-5" /> About {profile.name}
                        </button>
                    </div>

                    {/* Tab Content Container */}
                    <div className="flex-1 overflow-hidden">

                        {/* Hire Form Tab */}
                        {activeTab === 'hire' && (
                            <div className="p-6 h-full overflow-y-auto">
                                <h2 className="text-2xl font-bold text-gray-900 mb-5">
                                    Submit a Detailed Project Request
                                </h2>

                                {submissionSuccess && (
                                    <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5"/>
                                        <span className="font-semibold">Success!</span> Your request has been submitted and a chat started.
                                    </div>
                                )}

                                <form onSubmit={handleHireSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    
                                    <FormInput
                                        id="category"
                                        label="Service Category"
                                        placeholder="e.g. Panel Upgrade, New Light Fixture"
                                        value={hireRequest.category}
                                        onChange={(e) => setHireRequest(prev => ({ ...prev, category: e.target.value }))}
                                        isRequired
                                        error={formErrors.category}
                                    />

                                    <FormInput
                                        id="description"
                                        label="Detailed Description"
                                        type="textarea"
                                        placeholder="Describe location, urgency, access, and specific requirements."
                                        value={hireRequest.description}
                                        onChange={(e) => setHireRequest(prev => ({ ...prev, description: e.target.value }))}
                                        isRequired
                                        error={formErrors.description}
                                        rows={6}
                                    />
                                    
                                    <FormInput
                                        id="budget"
                                        label="Your Budget ($)"
                                        type="number"
                                        placeholder="Enter realistic budget estimate (min $50)"
                                        value={hireRequest.budget}
                                        onChange={(e) => setHireRequest(prev => ({ ...prev, budget: e.target.value }))}
                                        isRequired
                                        error={formErrors.budget}
                                    />

                                    <div className="flex items-end justify-end md:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting} 
                                            className={`py-3 px-6 text-white font-bold rounded-lg transition-all shadow-lg text-lg w-full md:w-auto 
                                                ${isSubmitting 
                                                    ? 'bg-indigo-400 cursor-not-allowed' 
                                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'}`
                                            }
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2 justify-center">
                                                    <Zap className="w-4 h-4 animate-pulse"/> Submitting...
                                                </span>
                                            ) : (
                                                'Submit Request'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        {/* About Tab Content */}
                        {activeTab === 'about' && (
                            <div className="p-6 h-full overflow-y-auto">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Bio</h3>
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    **{profile.name}** is a highly-rated Master Electrician with **{profile.experienceYears} years** of experience specializing in residential and light commercial projects. He is dedicated to safety, efficiency, and delivering smart home solutions. With over **{profile.projectsCompleted} completed jobs**, you can trust his expertise for everything from minor repairs to full panel upgrades.
                                </p>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Service Guarantees</h3>
                                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                    <li>100% Satisfaction Guarantee on all work.</li>
                                    <li>Fully Licensed and Insured for your protection.</li>
                                    <li>Transparent, upfront pricing (Starting at **${profile.price}/hr**).</li>
                                    <li>Emergency 24/7 service available upon request.</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
// --- END: PROFILE CONTENT COMPONENT ---


// --- 4. MAIN COMPONENT (State Holder) ---
export default function ElectricianProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); 
  
  const [activeTab, setActiveTab] = useState("hire"); 
  const [isChatOpen, setIsChatOpen] = useState(false); 

  const [messages, setMessages] = useState([
    { sender: "electrician", text: `Hello! I'm ready to discuss your project. How can I help?`, time: new Date(Date.now() - 60000).toLocaleTimeString() },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const [hireRequest, setHireRequest] = useState({
    category: "",
    description: "",
    budget: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isTyping, setIsTyping] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [submissionSuccess, setSubmissionSuccess] = useState(false); 

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!id) {
        setLoading(false);
        return;
    }
    async function fetchProfileData() {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const data = getElectricianById(id);
        
        setProfile({ ...data, ...MOCK_PROFILE_DATA });
        setLoading(false);
    }
    fetchProfileData();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]); 

  useEffect(() => {
    if (profile) {
        const timer = setTimeout(() => {
            setIsChatOpen(true);
        }, 1500); 
        return () => clearTimeout(timer);
    }
  }, [profile]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    
    const userMessage = { 
        text: newMessage, 
        sender: "me", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    setIsTyping(true);

    setTimeout(() => {
        setIsTyping(false); 

        const electricianReply = {
            text: `Thank you. I'm reviewing your request for "${userMessage.text.substring(0, 30)}..." and will provide a preliminary estimate shortly.`, 
            sender: "electrician", 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };

        setMessages((prev) => [...prev, electricianReply]);
    }, 2500); 
  }, [newMessage]); // Depend on newMessage

  const validateHireForm = useCallback(() => {
    const errors = {};
    if (!hireRequest.category.trim()) {
      errors.category = "Service Category is required.";
    }
    if (hireRequest.description.trim().length < 20) {
      errors.description = "Description must be at least 20 characters long.";
    }
    const budgetValue = parseFloat(hireRequest.budget);
    if (isNaN(budgetValue) || budgetValue <= 50) {
      errors.budget = "Budget must be a valid number greater than $50.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [hireRequest]); // Depend on hireRequest

  const handleHireSubmit = useCallback((e) => {
    e.preventDefault();
    if (!validateHireForm()) {
        return; 
    }
    
    setIsSubmitting(true);
    setSubmissionSuccess(false);

    // Simulate API delay for submission (1 second)
    setTimeout(() => {
        setIsSubmitting(false);

        const hireMsg = `HIRE REQUEST SUBMITTED: Category: ${hireRequest.category}. Budget: $${hireRequest.budget}. (Details forwarded to profile inbox)`;
        
        setMessages((prev) => [
            ...prev,
            { 
                sender: "me", 
                text: `✅ ${hireMsg}`, 
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            },
        ]);
        
        setHireRequest({ category: "", description: "", budget: "" });
        setFormErrors({}); 
        
        setSubmissionSuccess(true);
        setTimeout(() => setSubmissionSuccess(false), 5000); 
        
        setIsChatOpen(true); 
    }, 1000);
  }, [validateHireForm, hireRequest]); // Depend on validateHireForm and hireRequest


  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Navbar /> 
      
      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8">
        <ProfileContent 
            profile={profile}
            loading={loading}
            id={id}
            router={router}
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
      
      {/* Floating Chat Widget (Only render if profile data is loaded) */}
      {profile && (
        <FloatingChatWidget 
            profile={profile} 
            isChatOpen={isChatOpen} 
            setIsChatOpen={setIsChatOpen} 
            messages={messages}
            isTyping={isTyping}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
        />
      )}
      
      <Footer />
    </div>
  );
}