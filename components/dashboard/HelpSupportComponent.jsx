"use client";
import { useState } from "react";
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageCircle, 
  FileText, 
  Send, 
  ChevronDown, 
  ChevronUp,
  Search,
  BookOpen,
  Video,
  FileQuestion,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { submitSupportTicket } from "@/lib/firestoreService";

export default function HelpSupportComponent() {
  const { currentUser } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketData, setTicketData] = useState({
    subject: "",
    category: "",
    message: ""
  });

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "Simply browse through our service categories, select the service you need, and click 'Book Now'. You'll be connected with a professional who can help you. You can also filter by location, price, and rating to find the best match for your needs."
    },
    {
      question: "How are payments processed?",
      answer: "Payments are processed securely through our platform. You can pay online via card (Visa, Mastercard, Amex), mobile banking (bKash, Nagad, Rocket), or cash upon service completion. All online payments are encrypted and secure."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We have a customer satisfaction guarantee. If you're not happy with the service, please contact our support team within 24 hours. We'll investigate and help resolve the issue, including refunds if applicable."
    },
    {
      question: "How do I become a service provider?",
      answer: "Click on 'Become a Seller' in your dashboard, fill out the application form with your details, experience, and services offered. Our team will review your application within 2-3 business days and contact you for verification."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take data security seriously. All your personal information is encrypted and protected according to industry standards. We never share your information with third parties without your consent."
    },
    {
      question: "How can I track my order?",
      answer: "You can track your order status in the 'My Orders' section of your dashboard. You'll also receive email and SMS notifications when your order status changes."
    }
  ];

  const categories = [
    "Account Issues",
    "Payment Problems",
    "Service Quality",
    "Provider Issues",
    "Technical Support",
    "Billing Questions",
    "Other"
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const result = await submitSupportTicket(currentUser.uid, ticketData);
    if (result.success) {
      alert("Support ticket submitted successfully! We'll get back to you within 24 hours.");
      setTicketData({ subject: "", category: "", message: "" });
    } else {
      alert("Failed to submit ticket. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Help & Support</h1>
            <p className="text-gray-500 text-sm mt-1">How can we help you today?</p>
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Email Us</h3>
          <p className="text-sm text-gray-500 mt-1">support@kaazbazar.com</p>
          <p className="text-xs text-gray-400 mt-2">Response within 24 hours</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-md transition">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Call Us</h3>
          <p className="text-sm text-gray-500 mt-1">+880 1234 567890</p>
          <p className="text-xs text-gray-400 mt-2">9 AM - 9 PM, Everyday</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-md transition">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Live Chat</h3>
          <p className="text-sm text-gray-500 mt-1">Chat with our team</p>
          <p className="text-xs text-gray-400 mt-2">Available 24/7</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h2>
          </div>
        </div>

        {/* FAQ Search */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* FAQs List */}
        <div className="divide-y divide-gray-200">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No FAQs found matching "{searchQuery}"</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  {openFaq === index ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Support Ticket Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-bold text-gray-800">Submit a Support Ticket</h2>
        </div>
        <p className="text-gray-500 text-sm mb-4">Can't find what you're looking for? Submit a ticket and we'll help you out.</p>

        <form onSubmit={handleSubmitTicket} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              required
              value={ticketData.subject}
              onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
              placeholder="Brief description of your issue"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              required
              value={ticketData.category}
              onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea
              required
              rows={5}
              value={ticketData.message}
              onChange={(e) => setTicketData({...ticketData, message: e.target.value})}
              placeholder="Please provide details about your issue including any relevant order numbers or screenshots..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {submitting ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Ticket</>}
          </button>
        </form>
      </div>
    </div>
  );
}