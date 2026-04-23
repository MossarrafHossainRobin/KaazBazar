"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";  // ✅ এভাবেই হবে
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Clock, MapPin, MessageCircle, CheckCircle,
  Package, Truck, Home, AlertCircle, ChevronLeft, Calendar
} from "lucide-react";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const statuses = [
    { key: "pending", label: "Order Placed", icon: Package, description: "Waiting for provider confirmation" },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle, description: "Provider accepted your request" },
    { key: "in_progress", label: "Work in Progress", icon: Truck, description: "Provider is working on your request" },
    { key: "completed", label: "Completed", icon: Home, description: "Service completed successfully" }
  ];

  // Fetch order from API
  const fetchOrder = async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/mongo/orders/${id}`);
      const result = await response.json();
      
      if (result.success) {
        setOrder(result.data);
        setError(null);
      } else {
        setError(result.error || "Order not found");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(error.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Find and open correct conversation
  const openDirectMessage = async () => {
    if (!order || !currentUser) return;
    
    try {
      // Calculate expected conversation ID pattern
      const expectedId1 = `${currentUser.uid}_${order.providerId}`;
      const expectedId2 = `${order.providerId}_${currentUser.uid}`;
      
      // Query Firestore to find the conversation
      const conversationsRef = collection(db, "conversations");
      const q = query(
        conversationsRef,
        where("participants", "array-contains", currentUser.uid)
      );
      
      const snapshot = await getDocs(q);
      let foundConversationId = null;
      
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const participants = data.participants || [];
        
        // Check if both participants are in this conversation
        if (participants.includes(currentUser.uid) && participants.includes(order.providerId)) {
          foundConversationId = docSnap.id;
        }
      });
      
      if (foundConversationId) {
        // Conversation exists, use its ID
        sessionStorage.setItem("activeConversationId", foundConversationId);
      } else {
        // No conversation yet, create one with expected ID
        const newConversationId = expectedId1;
        
        // Create conversation document in Firestore
        const conversationRef = doc(db, "conversations", newConversationId);
        await setDoc(conversationRef, {
          participants: [currentUser.uid, order.providerId],
          participantNames: {
            [currentUser.uid]: currentUser.name,
            [order.providerId]: order.providerName
          },
          lastMessage: "Start your conversation here",
          lastMessageTime: new Date(),
          createdAt: new Date(),
          unreadCount: {
            [currentUser.uid]: 0,
            [order.providerId]: 0
          }
        });
        
        sessionStorage.setItem("activeConversationId", newConversationId);
      }
      
      // Navigate to messages tab
      router.push("/dashboard?tab=messages");
      
    } catch (error) {
      console.error("Error opening conversation:", error);
      // Fallback: just go to messages without auto-select
      router.push("/dashboard?tab=messages");
    }
  };

  // Initial load and refresh every 5 seconds
  useEffect(() => {
    if (id) {
      fetchOrder();
      const interval = setInterval(() => {
        if (order?.status !== "completed" && order?.status !== "cancelled") {
          fetchOrder();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [id]);

  // Countdown timer for pending orders
  useEffect(() => {
    if (order?.expiresAt && order.status === "pending") {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(order.expiresAt).getTime();
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeLeft({ minutes: 0, seconds: 0 });
          clearInterval(timer);
          fetchOrder(); 
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft({ minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order]);

  const cancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setCancelling(true);
    try {
      const response = await fetch(`/api/mongo/orders/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchOrder();
        alert("Order cancelled successfully");
      } else {
        alert(result.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const confirmOrder = async () => {
    setConfirming(true);
    try {
      const response = await fetch(`/api/mongo/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: "confirmed", confirmedAt: new Date() })
      });
      const result = await response.json();
      
      if (result.success) {
        await fetchOrder();
        alert("Order confirmed successfully!");
      } else {
        alert(result.error || "Failed to confirm order");
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Failed to confirm order");
    } finally {
      setConfirming(false);
    }
  };

  const getCurrentStatusIndex = () => {
    return statuses.findIndex(s => s.key === order?.status);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => router.push("/my-orders")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Go to My Orders
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-4">The order you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => router.push("/my-orders")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Go to My Orders
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isCustomer = currentUser?.uid === order.customerId;
  const isProvider = currentUser?.uid === order.providerId;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderId?.slice(-10)}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "completed" ? "bg-green-100 text-green-700" :
                  order.status === "cancelled" ? "bg-red-100 text-red-700" :
                  order.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
                
                {/* 30 Minute Countdown Timer */}
                {order.status === "pending" && timeLeft && timeLeft.minutes > 0 && (
                  <div className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold text-lg">
                        {timeLeft.minutes}:{String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                      <span className="text-sm">remaining to confirm</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Service Provider</p>
                <p className="font-semibold text-gray-800">{order.providerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <p className="font-semibold text-gray-800">{order.serviceName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-semibold text-gray-800">{order.scheduledDate} at {order.scheduledTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-semibold text-gray-800 capitalize">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Timeline */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Order Status</h2>
              <div className="relative">
                {statuses.map((status, idx) => {
                  const Icon = status.icon;
                  const isActive = idx <= getCurrentStatusIndex();
                  const isCurrent = status.key === order.status;
                  
                  return (
                    <div key={status.key} className="flex items-start gap-4 mb-6 last:mb-0">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? "bg-green-600" : "bg-gray-200"
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                        </div>
                        {idx < statuses.length - 1 && (
                          <div className={`absolute top-10 left-5 w-0.5 h-12 ${
                            isActive && idx < getCurrentStatusIndex() ? "bg-green-600" : "bg-gray-200"
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className={`font-semibold ${isActive ? "text-gray-800" : "text-gray-400"}`}>
                          {status.label}
                        </p>
                        <p className="text-sm text-gray-500">{status.description}</p>
                        {isCurrent && (
                          <p className="text-sm text-green-600 mt-1">Current status</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions & Details */}
            <div className="space-y-6">
              {/* Work Description */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Work Description</h2>
                <p className="text-gray-600 text-sm">{order.workDescription}</p>
                {order.instructions && (
                  <>
                    <h3 className="font-semibold text-gray-800 mt-3 mb-1">Special Instructions</h3>
                    <p className="text-gray-600 text-sm">{order.instructions}</p>
                  </>
                )}
              </div>

              {/* Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  Service Address
                </h2>
                <p className="text-gray-600 text-sm">{order.address}</p>
              </div>

              {/* Contact Provider - Now works correctly */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                  Contact Provider
                </h2>
                <button
                  onClick={openDirectMessage}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-green-600 hover:text-green-600 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message Provider
                </button>
              </div>

              {/* Action Buttons */}
              {order.status === "pending" && isCustomer && timeLeft && timeLeft.minutes > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <button
                    onClick={cancelOrder}
                    disabled={cancelling}
                    className="w-full py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                </div>
              )}

              {order.status === "pending" && isProvider && (
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
                  <button
                    onClick={confirmOrder}
                    disabled={confirming}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {confirming ? "Confirming..." : "Accept & Confirm Order"}
                  </button>
                  <button
                    onClick={cancelOrder}
                    disabled={cancelling}
                    className="w-full py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Decline Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}