"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HelpCircle, Mail, Phone, MessageCircle, FileText, Send, ChevronDown, ChevronUp } from "lucide-react";
import { submitSupportTicket } from "@/lib/firestoreService";

export default function HelpSupportPage() {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [ticketData, setTicketData] = useState({
    subject: "",
    message: ""
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "Simply browse through our service categories, select the service you need, and click 'Book Now'. You'll be connected with a professional who can help you."
    },
    {
      question: "How are payments processed?",
      answer: "Payments are processed securely through our platform. You can pay online via card, mobile banking, or cash upon service completion."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We have a customer satisfaction guarantee. If you're not happy with the service, please contact our support team within 24 hours."
    },
    {
      question: "How do I become a service provider?",
      answer: "Click on 'Become a Seller' in your dashboard, fill out the application form, and our team will review your application within 2-3 business days."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take data security seriously. All your personal information is encrypted and protected according to industry standards."
    }
  ];

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const result = await submitSupportTicket(currentUser.uid, ticketData);
    if (result.success) {
      alert("Support ticket submitted successfully! We'll get back to you soon.");
      setTicketData({ subject: "", message: "" });
    } else {
      alert("Failed to submit ticket. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
          <p className="text-gray-500 mt-2">How can we help you today?</p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Email Us</h3>
            <p className="text-sm text-gray-500 mt-1">support@kaazbazar.com</p>
            <p className="text-xs text-gray-400 mt-1">Response within 24 hours</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Call Us</h3>
            <p className="text-sm text-gray-500 mt-1">+880 1234 567890</p>
            <p className="text-xs text-gray-400 mt-1">9 AM - 9 PM, Everyday</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Live Chat</h3>
            <p className="text-sm text-gray-500 mt-1">Chat with our team</p>
            <p className="text-xs text-gray-400 mt-1">Available 24/7</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
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
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                required
                rows={5}
                value={ticketData.message}
                onChange={(e) => setTicketData({...ticketData, message: e.target.value})}
                placeholder="Please provide details about your issue..."
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
    </div>
  );
}