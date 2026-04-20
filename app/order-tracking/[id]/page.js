// app/order-tracking/[id]/page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle,
  CheckCircle,
  Package,
  Truck,
  Home,
  AlertCircle,
  ChevronLeft,
  Calendar
} from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const statuses = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle },
    { key: "in_progress", label: "Work in Progress", icon: Truck },
    { key: "completed", label: "Completed", icon: Home }
  ];

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  useEffect(() => {
    if (order?.expiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(order.expiresAt).getTime();
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          clearInterval(timer);
          if (order.status === "pending") {
            cancelOrder(true);
          }
        } else {
          const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft({ minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order]);

  const fetchOrder = async () => {
    try {
      const orderRef = doc(db, "orders", id);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        setOrder({ id: orderSnap.id, ...orderSnap.data() });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (auto = false) => {
    if (!auto && !confirm("Are you sure you want to cancel this order?")) return;
    
    setCancelling(true);
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { 
        status: "cancelled",
        cancelledAt: new Date().toISOString()
      });
      setOrder(prev => ({ ...prev, status: "cancelled" }));
      if (!auto) alert("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const getCurrentStatusIndex = () => {
    return statuses.findIndex(s => s.key === order?.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
          <button onClick={() => router.push("/dashboard")} className="mt-4 text-green-600">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderId}</h1>
              <p className="text-gray-500 text-sm mt-1">Placed on {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleString() : new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                order.status === "completed" ? "bg-green-100 text-green-700" :
                order.status === "cancelled" ? "bg-red-100 text-red-700" :
                order.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {order.status === "completed" && <CheckCircle className="w-4 h-4" />}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
              {order.status === "pending" && timeLeft && timeLeft.minutes > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Expires in: {timeLeft.minutes}:{String(timeLeft.seconds).padStart(2, '0')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Countdown Timer Card */}
        {order.status === "pending" && timeLeft && timeLeft.minutes > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-semibold text-red-700">Payment Required</p>
                <p className="text-sm text-red-600">
                  Complete payment within {timeLeft.minutes}:{String(timeLeft.seconds).padStart(2, '0')} to confirm your order
                </p>
              </div>
            </div>
          </div>
        )}

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
                      {isCurrent && (
                        <p className="text-sm text-green-600 mt-1">Current status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Service Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Provider</span>
                  <span className="font-medium text-gray-800">{order.providerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Type</span>
                  <span className="font-medium text-gray-800">{order.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-800">{order.duration} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-xl font-bold text-green-600">৳{order.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Schedule</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>{new Date(order.scheduledDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>{order.scheduledTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{order.address}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {order.status === "pending" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <button
                  onClick={() => cancelOrder()}
                  disabled={cancelling}
                  className="w-full py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              </div>
            )}

            {order.status === "completed" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}