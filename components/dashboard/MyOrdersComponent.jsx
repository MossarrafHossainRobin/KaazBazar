"use client";
import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, Eye, Star, Search, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders, updateOrderStatus, addActivity } from "@/lib/firestoreService";

export default function MyOrdersComponent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await getUserOrders(currentUser.uid, "customer");
    if (result.success) {
      setOrders(result.data);
    }
    setLoading(false);
  };

  const handleCancelOrder = async (orderId) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      const result = await updateOrderStatus(orderId, "cancelled");
      if (result.success) {
        await addActivity(currentUser.uid, {
          type: "order_cancelled",
          action: "Cancelled an order",
          orderId: orderId,
          timestamp: new Date().toISOString()
        });
        fetchOrders();
        alert("Order cancelled successfully");
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch = order.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed": return { bg: "bg-green-100", text: "text-green-600", icon: CheckCircle, label: "Completed" };
      case "pending": return { bg: "bg-yellow-100", text: "text-yellow-600", icon: Clock, label: "Pending" };
      case "cancelled": return { bg: "bg-red-100", text: "text-red-600", icon: XCircle, label: "Cancelled" };
      default: return { bg: "bg-gray-100", text: "text-gray-600", icon: Package, label: status };
    }
  };

  const tabs = [
    { id: "all", label: "All Orders", count: orders.length },
    { id: "pending", label: "Pending", count: orders.filter(o => o.status === "pending").length },
    { id: "completed", label: "Completed", count: orders.filter(o => o.status === "completed").length },
    { id: "cancelled", label: "Cancelled", count: orders.filter(o => o.status === "cancelled").length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-500 text-sm mt-1">View and track all your orders</p>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filter</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-all duration-200 ${
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
      <div className="divide-y divide-gray-200">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800">No orders found</h3>
            <p className="text-gray-500 text-sm mt-1">You haven't placed any orders yet</p>
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
  );
}