"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, Package, DollarSign, Clock, 
  ArrowRight, Calendar, Star, Users 
} from "lucide-react";
import { getUserOrders, getUserActivities } from "@/lib/firestoreService";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedJobs: 0,
    pendingJobs: 0,
    cancelledJobs: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    
    const ordersResult = await getUserOrders(currentUser.uid, "customer");
    if (ordersResult.success) {
      const orders = ordersResult.data;
      setRecentOrders(orders.slice(0, 5));
      
      const completed = orders.filter(o => o.status === "completed").length;
      const pending = orders.filter(o => o.status === "pending").length;
      const cancelled = orders.filter(o => o.status === "cancelled").length;
      const totalSpent = orders.reduce((sum, o) => sum + (o.price || 0), 0);
      
      setStats({
        totalOrders: orders.length,
        completedJobs: completed,
        pendingJobs: pending,
        cancelledJobs: cancelled,
        totalSpent: totalSpent
      });
    }
    
    const activitiesResult = await getUserActivities(currentUser.uid, 5);
    if (activitiesResult.success) {
      setRecentActivities(activitiesResult.data);
    }
    
    setLoading(false);
  };

  const statsCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: Package, color: "blue", change: "+12%" },
    { label: "Completed Jobs", value: stats.completedJobs, icon: TrendingUp, color: "green", change: "+8%" },
    { label: "Total Spent", value: `৳${stats.totalSpent}`, icon: DollarSign, color: "yellow", change: "+5%" },
    { label: "Pending", value: stats.pendingJobs, icon: Clock, color: "orange", change: "-2%" },
  ];

  const getColorClasses = (color) => {
    switch(color) {
      case "blue": return { bg: "bg-blue-100", text: "text-blue-600" };
      case "green": return { bg: "bg-green-100", text: "text-green-600" };
      case "yellow": return { bg: "bg-yellow-100", text: "text-yellow-600" };
      case "orange": return { bg: "bg-orange-100", text: "text-orange-600" };
      default: return { bg: "bg-gray-100", text: "text-gray-600" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {currentUser?.name?.split(' ')[0]}!</h1>
            <p className="text-green-100 mt-1">Here's what's happening with your account today.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">⭐ Pro Member</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">📅 Member since {new Date(currentUser?.createdAt).getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{order.serviceName || "Service"}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">৳{order.price}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "completed" ? "bg-green-100 text-green-600" :
                      order.status === "pending" ? "bg-yellow-100 text-yellow-600" :
                      "bg-red-100 text-red-600"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}