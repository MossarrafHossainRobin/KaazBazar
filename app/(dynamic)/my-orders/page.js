"use client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { 
  Package, Clock, CheckCircle, XCircle, Eye, Search, 
  Calendar, MapPin, MessageCircle, User, Store, Trash2,
  Check
} from "lucide-react";

export default function MyOrdersPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionId, setActionId] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  
  const fetchedRef = useRef(false);
  const timerIntervalRef = useRef(null);

  // Fetch orders only once
  useEffect(() => {
    if (!currentUser) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/mongo/orders/user/${currentUser.uid}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) {
          const ordersData = data.data || [];
          setOrders(ordersData);
          // Initialize time left for pending orders
          const initialTimeLeft = {};
          ordersData.forEach(order => {
            if (order.status === "pending") {
              initialTimeLeft[order.orderId] = calculateTimeLeft(order);
            }
          });
          setTimeLeft(initialTimeLeft);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [currentUser]);

  // Calculate time left from expiresAt or createdAt
  const calculateTimeLeft = (order) => {
    let expiry;
    if (order.expiresAt) {
      expiry = new Date(order.expiresAt);
    } else {
      expiry = new Date(order.createdAt);
      expiry.setMinutes(expiry.getMinutes() + 30);
    }
    const now = new Date();
    const diff = expiry - now;
    if (diff <= 0) return { minutes: 0, seconds: 0, expired: true };
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { minutes, seconds, expired: false };
  };

  // Update timers every second
  useEffect(() => {
    if (loading) return;
    
    const updateTimers = () => {
      const newTimeLeft = { ...timeLeft };
      let hasChanges = false;
      
      orders.forEach(order => {
        if (order.status === "pending") {
          const updated = calculateTimeLeft(order);
          const current = newTimeLeft[order.orderId];
          if (!current || current.minutes !== updated.minutes || current.seconds !== updated.seconds) {
            newTimeLeft[order.orderId] = updated;
            hasChanges = true;
          }
        }
      });
      
      if (hasChanges) setTimeLeft(newTimeLeft);
    };
    
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [orders, loading]);

  // Cancel order (customer only) - with confirmation popup
  const cancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setActionId(orderId);
    try {
      const res = await fetch(`/api/mongo/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => 
          o.orderId === orderId ? { ...o, status: "cancelled" } : o
        ));
        alert("Order cancelled");
      }
    } catch (err) {
      alert("Failed to cancel");
    } finally {
      setActionId(null);
    }
  };

  // Confirm order (provider only) - NO POPUP, direct confirm
  const confirmOrder = async (orderId) => {
    setActionId(orderId);
    try {
      const res = await fetch(`/api/mongo/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed", confirmedAt: new Date() })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => 
          o.orderId === orderId ? { ...o, status: "confirmed" } : o
        ));
        // Optionally show a brief success message (non-intrusive)
        // For now, no alert to avoid popup.
      } else {
        alert(data.error || "Failed to confirm");
      }
    } catch (err) {
      alert("Failed to confirm");
    } finally {
      setActionId(null);
    }
  };

  const statusConfig = {
    completed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Completed" },
    confirmed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Confirmed" },
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" },
    cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Cancelled" },
  };

  const getStatus = (status) => statusConfig[status] || statusConfig.pending;

  const tabs = [
    { id: "all", label: "All", count: orders.length },
    { id: "pending", label: "Pending", count: orders.filter(o => o.status === "pending").length },
    { id: "confirmed", label: "Confirmed", count: orders.filter(o => o.status === "confirmed").length },
    { id: "completed", label: "Completed", count: orders.filter(o => o.status === "completed").length },
    { id: "cancelled", label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
  ];

  const filtered = orders.filter(order => {
    if (activeTab !== "all" && order.status !== activeTab) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.serviceName?.toLowerCase().includes(term) ||
      order.orderId?.toLowerCase().includes(term) ||
      order.customerName?.toLowerCase().includes(term) ||
      order.providerName?.toLowerCase().includes(term)
    );
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar searchQuery={searchTerm} setSearchQuery={setSearchTerm} />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-6 h-6 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            </div>
            <p className="text-gray-500">Track your orders as customer or provider</p>
          </div>

          {/* Search */}
          <div className="mb-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="h-10 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-10 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-10 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-10 bg-gray-200 rounded col-span-1"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex flex-wrap border-b mb-6 gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "text-green-600 border-b-2 border-green-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Orders */}
              {filtered.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No orders found</h3>
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Browse Services
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map(order => {
                    const status = getStatus(order.status);
                    const StatusIcon = status.icon;
                    const isCustomer = order.userRole === "customer";
                    const isProvider = order.userRole === "provider";
                    const isPending = order.status === "pending";
                    const isActionLoading = actionId === order.orderId;
                    const countdown = timeLeft[order.orderId];
                    const showCountdown = isPending && countdown && !countdown.expired;
                    
                    const showCancel = isCustomer && isPending;
                    const showConfirm = isProvider && isPending;
                    
                    return (
                      <div key={order.orderId} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5">
                        {/* Role Badge */}
                        <div className="mb-3 flex justify-between items-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            isCustomer ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          }`}>
                            {isCustomer ? <User className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                            {isCustomer ? "You ordered" : "You provided"}
                          </span>
                          {showCountdown && (
                            <span className="text-xs font-mono bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              ⏱ {countdown.minutes}:{String(countdown.seconds).padStart(2, '0')}
                            </span>
                          )}
                        </div>

                        {/* Header */}
                        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-gray-500 font-mono">#{order.orderId?.slice(-10)}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.text}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg mt-1">{order.serviceName}</h3>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/order-tracking/${order.orderId}`)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                            >
                              <Eye className="w-4 h-4" /> Track
                            </button>
                            {showConfirm && (
                              <button
                                onClick={() => confirmOrder(order.orderId)}
                                disabled={isActionLoading}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                              >
                                {isActionLoading ? (
                                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                                Confirm
                              </button>
                            )}
                            {showCancel && (
                              <button
                                onClick={() => cancelOrder(order.orderId)}
                                disabled={isActionLoading}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                              >
                                {isActionLoading ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-400 uppercase">
                              {isCustomer ? "Service Provider" : "Customer"}
                            </p>
                            <p className="font-medium mt-1">{isCustomer ? order.providerName : order.customerName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Schedule
                            </p>
                            <p className="font-medium mt-1">{order.scheduledDate} at {order.scheduledTime}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Location
                            </p>
                            <p className="text-sm text-gray-600 mt-1 truncate">{order.address}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase">Payment</p>
                            <p className="font-medium mt-1 capitalize">{order.paymentMethod}</p>
                          </div>
                        </div>

                        {/* Work Description */}
                        {order.workDescription && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-4">
                            <p className="text-xs text-gray-500">Work Description</p>
                            <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">{order.workDescription}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 mt-2 border-t">
                          <button
                            onClick={() => {
                              const otherId = isCustomer ? order.providerId : order.customerId;
                              sessionStorage.setItem("activeConversationId", `${currentUser.uid}_${otherId}`);
                              router.push("/dashboard?tab=messages");
                            }}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600"
                          >
                            <MessageCircle className="w-4 h-4" /> Message
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}