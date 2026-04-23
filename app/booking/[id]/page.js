"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Calendar, Clock, MapPin, Star, 
  Smartphone, Banknote,
  ChevronLeft, CheckCircle, Bell, 
  MessageCircle, FileText, Send, Shield, AlertCircle, Phone
} from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [workDescription, setWorkDescription] = useState("");

  useEffect(() => {
    if (id) {
      fetchProvider();
    }
  }, [id]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setSelectedTime("10:00");
  }, []);

  const fetchProvider = async () => {
    try {
      const providerRef = doc(db, "serviceProviders", id);
      const providerSnap = await getDoc(providerRef);
      if (providerSnap.exists()) {
        setProvider({ id: providerSnap.id, ...providerSnap.data() });
      }
    } catch (error) {
      console.error("Error fetching provider:", error);
      setError("Failed to load provider information");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!address.trim()) {
      setError("Please enter your address");
      return;
    }

    if (!workDescription.trim()) {
      setError("Please describe the work you need");
      return;
    }

    setSubmitting(true);
    setError("");
    
    const uniqueOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    try {
      // 1. Save order to MongoDB
      const orderPayload = {
        customerId: currentUser.uid,
        customerName: currentUser.name || "Customer",
        customerEmail: currentUser.email || "",
        customerPhone: currentUser.phone || "",
        providerId: provider.id,
        providerName: provider.name,
        providerPhone: provider.phone || "",
        providerEmail: provider.email || "",
        serviceName: provider.category || provider.serviceName,
        workDescription: workDescription,
        address: address,
        instructions: instructions || "",
        paymentMethod: paymentMethod,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        totalAmount: 0,
        status: "pending"
      };
      
      const mongoResponse = await fetch('/api/mongo/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      
      const mongoResult = await mongoResponse.json();
      
      if (!mongoResult.success) {
        throw new Error(mongoResult.error);
      }
      
      const savedOrder = mongoResult.data;
      
      // 2. Send Firebase notification to provider
      await addDoc(collection(db, "notifications"), {
        userId: provider.id,
        title: "New Service Request",
        message: `${currentUser.name} requested ${provider.category || provider.serviceName} service`,
        type: "new_order",
        orderId: savedOrder.orderId,
        read: false,
        createdAt: serverTimestamp()
      });
      
      // 3. Create regular conversation for chat
      const conversationId = `${currentUser.uid}_${provider.id}`;
      await addDoc(collection(db, "messages"), {
        conversationId: conversationId,
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderType: "customer",
        recipientId: provider.id,
        recipientType: "provider",
        message: `🆕 Service Request: ${workDescription.substring(0, 200)}`,
        type: "order_request",
        orderId: savedOrder.orderId,
        read: false,
        createdAt: serverTimestamp(),
        link: `/order-tracking/${savedOrder.orderId}`
      });
      
      // 4. Send system message to customer's inbox (order placed confirmation)
      const customerSystemConversationId = `system_${currentUser.uid}`;
      await addDoc(collection(db, "messages"), {
        conversationId: customerSystemConversationId,
        senderId: "system",
        senderName: "Kaazbazar",
        senderType: "system",
        recipientId: currentUser.uid,
        recipientType: "customer",
        message: `🆕 **Order Placed!**\n\n📦 Order #${savedOrder.orderId.slice(-10)}\n🔧 Service: ${provider.category || provider.serviceName}\n👤 Provider: ${provider.name}\n📅 Date: ${selectedDate}\n⏰ Time: ${selectedTime}\n📍 Address: ${address}\n\n⏳ **Waiting for provider confirmation**\nThe provider has 30 minutes to accept your request.\n\nWe'll notify you as soon as they respond.`,
        type: "order_placed",
        orderId: savedOrder.orderId,
        read: false,
        createdAt: serverTimestamp(),
        link: `/order-tracking/${savedOrder.orderId}`,
        action: "view_order"
      });
      
      // 5. Send system message to provider's inbox (new order notification)
      const providerSystemConversationId = `system_${provider.id}`;
      await addDoc(collection(db, "messages"), {
        conversationId: providerSystemConversationId,
        senderId: "system",
        senderName: "Kaazbazar",
        senderType: "system",
        recipientId: provider.id,
        recipientType: "provider",
        message: `🆕 **New Service Request!**\n\n📦 Order #${savedOrder.orderId.slice(-10)}\n👤 Customer: ${currentUser.name}\n📞 Phone: ${currentUser.phone || "N/A"}\n🔧 Service: ${provider.category || provider.serviceName}\n📅 Date: ${selectedDate}\n⏰ Time: ${selectedTime}\n📍 Address: ${address}\n📝 Work Details: ${workDescription.substring(0, 150)}${workDescription.length > 150 ? '...' : ''}\n\n⚠️ **Please respond within 30 minutes**\nClick below to confirm or cancel this request.`,
        type: "new_order",
        orderId: savedOrder.orderId,
        read: false,
        createdAt: serverTimestamp(),
        link: `/provider/orders/${savedOrder.orderId}`,
        action: "confirm_order"
      });
      
      setOrderData(savedOrder);
      setSuccess(true);
      
      // No page reload - redirect after 2 seconds
      setTimeout(() => {
        router.push(`/order-tracking/${savedOrder.orderId}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error creating order:", error);
      setError(error.message || "Failed to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600">Service provider not found</p>
            <button onClick={() => router.back()} className="mt-4 text-green-600">Go Back</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Service Request Sent!</h2>
            <p className="text-gray-500 mb-4">Provider has been notified. They have 30 minutes to confirm.</p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-800 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Waiting for provider confirmation...
              </p>
              <p className="text-xs text-orange-600 mt-2">Check your messages for real-time updates</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">📬 Check your inbox:</p>
              <p className="text-xs text-blue-700">• Order confirmation message sent to your inbox</p>
              <p className="text-xs text-blue-700">• Provider will message you when they respond</p>
              <p className="text-xs text-blue-700">• You can track order status in real-time</p>
            </div>
            <p className="text-sm text-gray-400">Redirecting to order tracking...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6">
            <ChevronLeft className="w-5 h-5" /> Back to Services
          </button>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Provider Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-4">
                  {provider.photoURL ? (
                    <img src={provider.photoURL} alt={provider.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-green-600 font-bold">{provider.name?.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-800">{provider.name}</h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{provider.rating || 4.5}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{provider.city || "Dhaka"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{provider.phone || "Available"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Description */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Describe Your Work
                </h2>
                <textarea
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Please describe the work you need in detail..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">* Detailed description helps provider understand your requirements better</p>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Schedule Service
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Service Location
                </h2>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full address..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                  required
                />
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Special Instructions (Optional)</h2>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Service Request Summary</h2>
                
                <div className="space-y-3 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service</span>
                    <span className="text-gray-800 font-medium">{provider.category || provider.serviceName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Provider</span>
                    <span className="text-gray-800 font-medium">{provider.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date</span>
                    <span className="text-gray-800">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time</span>
                    <span className="text-gray-800">{selectedTime}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 my-4">
                  <p className="text-xs text-yellow-800 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Price will be discussed with provider after work inspection
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-green-800 flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    Provider will be notified immediately
                  </p>
                  <p className="text-xs text-green-800 flex items-center gap-1 mt-2">
                    <MessageCircle className="w-3 h-3" />
                    Message sent to your inbox
                  </p>
                  <p className="text-xs text-green-800 flex items-center gap-1 mt-2">
                    <Clock className="w-3 h-3" />
                    Provider has 30 minutes to confirm
                  </p>
                </div>

                {/* Payment Method */}
                <div className="py-4 border-b">
                  <h3 className="font-medium text-gray-800 mb-3">Payment Method</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <Banknote className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-800">Cash on Completion</p>
                        <p className="text-xs text-gray-500">Pay after work is done</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="bkash"
                        checked={paymentMethod === "bkash"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <Smartphone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-800">bKash / Nagad</p>
                        <p className="text-xs text-gray-500">Mobile banking payment</p>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={createOrder}
                  disabled={submitting || !address || !workDescription}
                  className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Service Request
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  By sending this request, you agree to our Terms of Service
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}