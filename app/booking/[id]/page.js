// app/booking/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Shield, 
  Award,
  CreditCard,
  Smartphone,
  Banknote,
  ChevronLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function BookingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(2);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const durations = [
    { hours: 1, price: 0, label: "1 Hour" },
    { hours: 2, price: 0, label: "2 Hours" },
    { hours: 3, price: 0, label: "3 Hours" },
    { hours: 4, price: 0, label: "4 Hours" },
    { hours: 5, price: 0, label: "5 Hours" },
    { hours: 6, price: 0, label: "6 Hours" }
  ];

  useEffect(() => {
    if (id) {
      fetchProvider();
    }
  }, [id]);

  useEffect(() => {
    // Set default date (tomorrow)
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
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const hourlyRate = provider?.hourlyRate || 500;
    return hourlyRate * selectedDuration;
  };

  const createOrder = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!address) {
      alert("Please enter your address");
      return;
    }

    setSubmitting(true);
    
    const orderData = {
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      customerId: currentUser.uid,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customerPhone: currentUser.phone || "",
      providerId: provider.id,
      providerName: provider.name,
      providerPhone: provider.phone,
      serviceName: provider.category,
      hourlyRate: provider.hourlyRate,
      duration: selectedDuration,
      totalAmount: calculateTotal(),
      address: address,
      instructions: instructions,
      status: "pending",
      paymentMethod: paymentMethod,
      paymentStatus: "pending",
      scheduledDate: selectedDate,
      scheduledTime: selectedTime,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes expiry
    };

    try {
      const ordersRef = collection(db, "orders");
      const docRef = await addDoc(ordersRef, orderData);
      setOrderId(docRef.id);
      setSuccess(true);
      
      // Redirect to order tracking after 3 seconds
      setTimeout(() => {
        router.push(`/order-tracking/${docRef.id}`);
      }, 3000);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setSubmitting(false);
    }
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

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Service provider not found</p>
          <button onClick={() => router.back()} className="mt-4 text-green-600">Go Back</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 mb-4">Your order has been confirmed. You can track it in your dashboard.</p>
          <p className="text-sm text-gray-400">Redirecting to order tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Service Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                {provider.photoURL ? (
                  <img src={provider.photoURL} alt={provider.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-green-600 font-bold">{provider.name?.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{provider.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{provider.rating || 4.5}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{provider.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{provider.experience} exp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Select Duration</h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {durations.map((dur) => (
                  <button
                    key={dur.hours}
                    onClick={() => setSelectedDuration(dur.hours)}
                    className={`py-3 rounded-lg border-2 transition-all ${
                      selectedDuration === dur.hours
                        ? "border-green-600 bg-green-50 text-green-600"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-sm font-semibold">{dur.hours}h</div>
                    <div className="text-xs">৳{provider.hourlyRate * dur.hours}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  </select>
                </div>
              </div>
            </div>

            {/* Address & Instructions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Service Location</h2>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full address..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
              />
              <h2 className="text-lg font-bold text-gray-800 mb-4">Special Instructions (Optional)</h2>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special instructions for the service provider..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="text-gray-800">{provider.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span className="text-gray-800">৳{provider.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="text-gray-800">{selectedDuration} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="text-gray-800">{selectedDate} at {selectedTime}</span>
                </div>
              </div>
              
              <div className="flex justify-between py-4 border-b">
                <span className="font-semibold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">৳{calculateTotal()}</span>
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
                      <p className="font-medium text-gray-800">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when service is completed</p>
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
                      <p className="text-xs text-gray-500">Mobile banking</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-green-600"
                    />
                    <CreditCard className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-800">Credit/Debit Card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Amex</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Button */}
              <button
                onClick={createOrder}
                disabled={submitting || !address}
                className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  `Place Order - ৳${calculateTotal()}`
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                By placing this order, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}