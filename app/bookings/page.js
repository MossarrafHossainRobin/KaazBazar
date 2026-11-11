// app/bookings/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Clock, CheckCircle, XCircle, Eye, Calendar, MapPin, User, Search } from "lucide-react";

export default function MyBookingsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/mongo/orders/customer/${currentUser.uid}`);
      const result = await response.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed": return { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Completed" };
      case "confirmed": return { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle, label: "Confirmed" };
      case "pending": return { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" };
      case "cancelled": return { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Cancelled" };
      default: return { bg: "bg-gray-100", text: "text-gray-700", icon: Package, label: status };
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
                          order.providerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 mt-1">Track and manage all your service bookings</p>
          </div>

          {/* Search */}
          <div className="mb-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap border-b mb-6 gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition ${
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
            <div className="bg-white rounded-xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No bookings found</h3>
              <button onClick={() => router.push("/explore")} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Explore Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const status = getStatusBadge(order.status);
                const StatusIcon = status.icon;
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-gray-500 font-mono">#{order.orderId?.slice(-10)}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.text}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mt-1">{order.serviceName}</h3>
                        <p className="text-sm text-gray-600">Provider: {order.providerName}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/order-tracking/${order.orderId}`)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                      >
                        <Eye className="w-4 h-4" /> Track Order
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {order.scheduledDate} at {order.scheduledTime}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {order.address?.substring(0, 50)}...
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        {order.providerName}
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