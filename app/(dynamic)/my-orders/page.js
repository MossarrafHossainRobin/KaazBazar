
"use client";
export const dynamic = 'force-dynamic';
import Link from "next/link";  // ← এই লাইন যোগ করুন
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, Clock, CheckCircle, XCircle, Eye, Star } from "lucide-react";
import { getUserOrders, updateOrderStatus, addActivity } from "@/lib/firestoreService";

export default function MyOrdersPage() {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const result = await getUserOrders(currentUser.uid, "customer");
    if (result.success) {
      setOrders(result.data);
    }
    setLoadingOrders(false);
  };

  const handleCancelOrder = async (orderId) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      const result = await updateOrderStatus(orderId, "cancelled");
      if (result.success) {
        await addActivity(currentUser.uid, {
          type: "order_cancelled",
          action: "Cancelled order",
          orderId: orderId,
          timestamp: new Date().toISOString()
        });
        fetchOrders();
        alert("Order cancelled successfully");
      }
    }
  };

  const filteredOrders = activeTab === "all" ? orders : orders.filter(o => o.status === activeTab);

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

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed": return { bg: "bg-green-100", text: "text-green-600", icon: CheckCircle, label: "Completed" };
      case "pending": return { bg: "bg-yellow-100", text: "text-yellow-600", icon: Clock, label: "Pending" };
      case "cancelled": return { bg: "bg-red-100", text: "text-red-600", icon: XCircle, label: "Cancelled" };
      default: return { bg: "bg-gray-100", text: "text-gray-600", icon: Package, label: status };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">View and track all your orders</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            {["all", "pending", "completed", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize transition-all duration-200 ${
                  activeTab === tab 
                    ? "text-green-600 border-b-2 border-green-600" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab} ({orders.filter(o => tab === "all" ? true : o.status === tab).length})
              </button>
            ))}
          </div>

          {/* Orders List */}
          <div className="divide-y divide-gray-200">
            {loadingOrders ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800">No orders found</h3>
                <p className="text-gray-500 text-sm mt-1">You haven't placed any orders yet</p>
                <Link href="/" className="inline-block mt-4 text-green-600 hover:text-green-700 font-medium">
                  Browse Services →
                </Link>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const status = getStatusBadge(order.status);
                const StatusIcon = status.icon;
                
                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Order #{order.id?.slice(-8)}</p>
                            <h3 className="font-semibold text-gray-800 mt-1">{order.serviceName || "Service"}</h3>
                            <p className="text-sm text-gray-600 mt-1">Provider: {order.providerName || "Professional"}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">৳{order.price}</p>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${status.bg} mt-2`}>
                              <StatusIcon className={`w-3 h-3 ${status.text}`} />
                              <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3 mt-3">
                          <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                            <Eye className="w-4 h-4" /> View Details
                          </button>
                          {order.status === "completed" && (
                            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                              <Star className="w-4 h-4" /> Write a Review
                            </button>
                          )}
                          {order.status === "pending" && (
                            <button 
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}