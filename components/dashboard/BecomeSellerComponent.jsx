"use client";
import { useState } from "react";
import { Shield, CheckCircle, Award, Users, Clock, DollarSign, Send, FileText, Upload, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { applyForSeller, addActivity } from "@/lib/firestoreService";

export default function BecomeSellerComponent() {
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    profession: "",
    experience: "",
    description: "",
    hourlyRate: "",
    availability: "full-time",
    services: [],
    documents: []
  });

  const benefits = [
    { icon: Award, title: "Earn More", desc: "Set your own rates and earn what you deserve" },
    { icon: Users, title: "Large Customer Base", desc: "Access thousands of customers in your area" },
    { icon: Clock, title: "Flexible Schedule", desc: "Work when you want, as much as you want" },
    { icon: DollarSign, title: "Quick Payments", desc: "Get paid directly to your account" }
  ];

  const professions = [
    "Electrician", "Plumber", "Carpenter", "Gardener", "Painter", 
    "Handyman", "Cleaner", "AC Technician", "Appliance Repair", "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const result = await applyForSeller(currentUser.uid, formData);
    if (result.success) {
      await addActivity(currentUser.uid, {
        type: "profile",
        action: "Applied to become a seller",
        timestamp: new Date().toISOString()
      });
      alert("Application submitted successfully! We'll review and get back to you within 2-3 business days.");
      setStep(3);
    } else {
      alert("Failed to submit application. Please try again.");
    }
    setSubmitting(false);
  };

  if (step === 3) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
        <p className="text-gray-500 mb-6">Thank you for applying to become a seller. Our team will review your application and get back to you within 2-3 business days.</p>
        <button
          onClick={() => setStep(1)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Become a Seller</h1>
            <p className="text-gray-500 text-sm mt-1">Start earning by offering your services</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between max-w-md">
          <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>1</div>
            <span className="ml-2 text-sm">Info</span>
          </div>
          <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>2</div>
            <span className="ml-2 text-sm">Details</span>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Why become a seller?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{benefit.title}</h3>
                  <p className="text-sm text-gray-500">{benefit.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Application Form */}
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Profession *</label>
              <select
                required
                value={formData.profession}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="">Choose your profession</option>
                {professions.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
              <select
                required
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="">Select experience</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (৳) *</label>
              <input
                type="number"
                required
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                placeholder="e.g., 500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="full-time"
                    checked={formData.availability === "full-time"}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>Full Time</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="part-time"
                    checked={formData.availability === "part-time"}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>Part Time</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Bio *</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tell us about your skills, experience, certifications, and why you'd be a great seller..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Services You Offer</label>
              <textarea
                rows={3}
                value={formData.services}
                onChange={(e) => setFormData({...formData, services: e.target.value})}
                placeholder="List the specific services you provide (e.g., Wiring, Fan Installation, Switch Repair)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {submitting ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Application</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ArrowRight component
function ArrowRight(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}