"use client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { 
  Package, Clock, CheckCircle, XCircle, Eye, Search, 
  Calendar, MapPin, Phone, MessageCircle, User, Store, Trash2
} from "lucide-react";

export default function MyOrdersPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState(null);
  
  const pollingRef = useRef(null);
  const isMountedRef = useRef(true);

  // Fetch all orders for the user
  const fetchOrders = useCallback(async () => {
    if (!currentUser || !isMountedRef.current) return;
    
    try {
      const response = await fetch(`/api/mongo/orders/user/${currentUser.uid}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && isMountedRef.current) {
        setOrders(result.data || []);
        setError(null);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentUser]);

  // Initial fetch and polling
  useEffect(() => {
    if (currentUser) {
      fetchOrders();
      
      pollingRef.current = setInterval(() => {
        if (isMountedRef.current) {
          fetchOrders();
        }
      }, 5000);
      
      return () => {
        isMountedRef.current = false;
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
  }, [currentUser, fetchOrders]);

  // Cancel order
  const cancelOrder = async (orderId, userRole) => {
    if (userRole !== "customer") {
      alert("Only customers can cancel orders");
      return;
    }
    
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setCancellingId(orderId);
    try {
      const response = await fetch(`/api/mongo/orders/${orderId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            (order.orderId === orderId)
              ? { ...order, status: "cancelled" }
              : order
          )
        );
        alert("Order cancelled successfully");
      } else {
        alert(result.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed":
        return { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Completed" };
      case "confirmed":
        return { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Confirmed" };
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Cancelled" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", icon: Package, label: status };
    }
  };

  const tabs = [
    { id: "all", label: "All", count: orders.length },
    { id: "pending", label: "Pending", count: orders.filter(o => o.status === "pending").length },
    { id: "confirmed", label: "Confirmed", count: orders.filter(o => o.status === "confirmed").length },
    { id: "completed", label: "Completed", count: orders.filter(o => o.status === "completed").length },
    { id: "cancelled", label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch = order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.providerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar 
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading orders...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar 
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
      />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-6 h-6 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            </div>
            <p className="text-gray-500">
              Track all your orders - as customer and service provider
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <p>{error}</p>
              <button
                onClick={() => fetchOrders()}
                className="mt-2 text-red-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service, order ID, customer, or provider..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "text-green-600 border-b-2 border-green-600" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No orders found</h3>
              <p className="text-gray-500">
                You haven't placed any orders yet. Browse services to get started.
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = getStatusBadge(order.status);
                const StatusIcon = status.icon;
                const isCancelling = cancellingId === order.orderId;
                const isCustomer = order.userRole === "customer";
                const canCancel = order.status === "pending" && isCustomer;
                
                return (
                  <div 
                    key={order.orderId} 
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-5">
                      {/* Role Badge */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isCustomer 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {isCustomer ? (
                            <>
                              <User className="w-3 h-3" />
                              You ordered this service
                            </>
                          ) : (
                            <>
                              <Store className="w-3 h-3" />
                              You provided this service
                            </>
                          )}
                        </span>
                      </div>

                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm text-gray-500 font-mono">Order #{order.orderId?.slice(-10)}</p>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${status.bg}`}>
                              <StatusIcon className={`w-3 h-3 ${status.text}`} />
                              <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-800 text-lg mt-1">{order.serviceName}</h3>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/order-tracking/${order.orderId}`)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                          >
                            <Eye className="w-4 h-4" />
                            Track
                          </button>
                          {canCancel && (
                            <button
                              onClick={() => cancelOrder(order.orderId, order.userRole)}
                              disabled={isCancelling}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            >
                              {isCancelling ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            {isCustomer ? "Service Provider" : "Customer"}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-gray-400" />
                            <p className="font-medium text-gray-800">
                              {isCustomer ? order.providerName : order.customerName}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Schedule
                          </p>
                          <p className="font-medium text-gray-800 mt-1">
                            {order.scheduledDate} at {order.scheduledTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Location
                          </p>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {order.address}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Payment</p>
                          <p className="font-medium text-gray-800 mt-1 capitalize">
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>

                      {/* Work Description */}
                      {order.workDescription && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-500">Work Description</p>
                          <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">
                            {order.workDescription}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            const otherUserId = isCustomer ? order.providerId : order.customerId;
                            const conversationId = `${currentUser.uid}_${otherUserId}`;
                            sessionStorage.setItem("activeConversationId", conversationId);
                            router.push("/dashboard?tab=messages");
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                        {!isCustomer && order.customerPhone && (
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 transition"
                          >
                            <Phone className="w-4 h-4" />
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}