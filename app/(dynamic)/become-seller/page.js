"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Shield, CheckCircle, Award, Users, Clock, DollarSign, Send } from "lucide-react";
import { applyForSeller, addActivity } from "@/lib/firestoreService";

export default function BecomeSellerPage() {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    profession: "",
    experience: "",
    description: "",
    hourlyRate: "",
    availability: "full-time"
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

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
      alert("Application submitted successfully! We'll review and get back to you.");
      router.push("/dashboard");
    } else {
      alert("Failed to submit application. Please try again.");
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

  const benefits = [
    { icon: Award, title: "Earn More", desc: "Set your own rates and earn what you deserve" },
    { icon: Users, title: "Large Customer Base", desc: "Access thousands of customers in your area" },
    { icon: Clock, title: "Flexible Schedule", desc: "Work when you want, as much as you want" },
    { icon: DollarSign, title: "Quick Payments", desc: "Get paid directly to your account" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Become a Seller</h1>
          <p className="text-gray-500 mt-2">Start earning by offering your services</p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3">
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Seller Application</h2>
          <p className="text-gray-500 text-sm mb-6">Fill out the form below to apply as a seller</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profession *</label>
              <select
                required
                value={formData.profession}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="">Select your profession</option>
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="carpenter">Carpenter</option>
                <option value="gardener">Gardener</option>
                <option value="painter">Painter</option>
                <option value="handyman">Handyman</option>
                <option value="cleaner">Cleaner</option>
                <option value="ac_technician">AC Technician</option>
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
                <option value="1-2 years">1-2 years</option>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Bio *</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tell us about your skills, experience, and why you'd be a great seller..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {submitting ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Application</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}