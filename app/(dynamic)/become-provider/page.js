"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  User, 
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Shield,
  Users,
  Star,
  Plus,
  X,
  DollarSign,
  Phone,
  Mail,
  Award,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createServiceProvider, getServiceProvider } from "@/lib/firestoreService";
import { categories } from "@/lib/categories";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BecomeProviderPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    experience: "",
    startingRate: "",
    city: "",
    area: "",
    services: [],
    description: ""
  });
  
  const [newService, setNewService] = useState("");

  // Check if user is already a provider
  useEffect(() => {
    const checkExistingProvider = async () => {
      if (!currentUser) {
        router.push("/");
        return;
      }

      try {
        const existingProvider = await getServiceProvider(currentUser.uid);
        
        if (existingProvider.success && existingProvider.data) {
          // User is already a provider - redirect to dashboard
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error checking provider:", error);
      } finally {
        setChecking(false);
      }
    };

    checkExistingProvider();
  }, [currentUser, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validation
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      setLoading(false);
      return;
    }
    
    if (!formData.phone.trim()) {
      setError("Please enter your phone number");
      setLoading(false);
      return;
    }
    
    if (formData.services.length === 0) {
      setError("Please add at least one service you offer");
      setLoading(false);
      return;
    }
    
    const providerData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      category: formData.category,
      experience: formData.experience,
      startingRate: parseInt(formData.startingRate),
      city: formData.city,
      area: formData.area,
      services: formData.services,
      description: formData.description,
      userId: currentUser?.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      totalBookings: 0,
      completedJobs: 0,
      rating: 0
    };
    
    const result = await createServiceProvider(currentUser?.uid, providerData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/services/${formData.category.toLowerCase()}`);
      }, 2000);
    } else {
      setError("Failed to register. Please try again.");
    }
    setLoading(false);
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService("");
    }
  };

  const removeService = (serviceToRemove) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== serviceToRemove)
    }));
  };

  if (checking) {
    return (
      <>
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Checking your account...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Navbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">Your service provider profile has been created.</p>
            <p className="text-sm text-gray-500">Our team will review your application within 24-48 hours.</p>
            <div className="animate-pulse mt-4">
              <p className="text-xs text-gray-400">Redirecting to service page...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Why Join Kaazbazar?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Earn More</p>
                        <p className="text-sm text-gray-500">Set your own rates and keep 85% of earnings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Flexible Schedule</p>
                        <p className="text-sm text-gray-500">Work when and where you want</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-800">Get Verified</p>
                        <p className="text-sm text-gray-500">Build trust with verified badge</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Provider Benefits
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">✓ Free registration</li>
                    <li className="flex items-center gap-2">✓ No monthly fees</li>
                    <li className="flex items-center gap-2">✓ 24/7 customer support</li>
                    <li className="flex items-center gap-2">✓ Free marketing & promotion</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
                  <h1 className="text-2xl font-bold text-gray-800">Become a Service Provider</h1>
                  <p className="text-gray-500 text-sm mt-1">Register your services and start earning</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+8801XXXXXXXXX"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div className="pt-4 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-green-600" />
                      Service Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Category *</label>
                        <select
                          name="category"
                          required
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        >
                          <option value="">Select category</option>
                          {categories.filter(c => c.id !== "all").map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience *</label>
                        <select
                          name="experience"
                          required
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        >
                          <option value="">Select experience</option>
                          <option value="1-2 years">1-2 years</option>
                          <option value="3-5 years">3-5 years</option>
                          <option value="5-10 years">5-10 years</option>
                          <option value="10+ years">10+ years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Starting Rate (৳) *</label>
                        <input
                          type="number"
                          name="startingRate"
                          required
                          value={formData.startingRate}
                          onChange={handleInputChange}
                          placeholder="e.g., 500"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-1">Minimum rate for your services</p>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="pt-4 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      Service Location
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="e.g., Dhaka"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                        <input
                          type="text"
                          name="area"
                          required
                          value={formData.area}
                          onChange={handleInputChange}
                          placeholder="e.g., Uttara"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Services Offered */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Services You Offer *</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        placeholder="e.g., Electrical Wiring, Fan Installation"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                      />
                      <button
                        type="button"
                        onClick={addService}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover:scale-105"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map((service, index) => (
                        <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                          {service}
                          <button
                            type="button"
                            onClick={() => removeService(service)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Add each service individually using the input above</p>
                  </div>

                  {/* Description */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">About You / Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Tell customers about your skills, experience, and what makes you unique..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Terms & Submit */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-3 mb-6">
                      <input
                        type="checkbox"
                        required
                        id="terms"
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 mt-0.5"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-600">
                        I agree to the <Link href="/terms" className="text-green-600 hover:underline">Terms of Service</Link> and 
                        <Link href="/privacy" className="text-green-600 hover:underline ml-1">Privacy Policy</Link>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || formData.services.length === 0}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      {loading ? "Registering..." : "Register as Service Provider"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white rounded-lg p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Secure Payments</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Verified Users</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">24/7 Support</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Top Rated</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}