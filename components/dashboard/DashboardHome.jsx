"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, Package, DollarSign, Clock, 
  ArrowRight, Calendar, Star, Users, CheckCircle2, AlertCircle
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
    
    try {
      const ordersResult = await getUserOrders(currentUser.uid, "customer");
      if (ordersResult.success) {
        const orders = ordersResult.data;
        setRecentOrders(orders.slice(0, 5));
        
        const completed = orders.filter(o => o.status === "completed").length;
        const pending = orders.filter(o => o.status === "pending" || o.status === "accepted").length;
        const cancelled = orders.filter(o => o.status === "cancelled").length;
        const totalSpent = orders
          .filter(o => o.status === "completed")
          .reduce((sum, o) => sum + (o.price || 0), 0);
        
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
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
    
    setLoading(false);
  };

  const statsCards = [
    { 
      label: "Total Orders", 
      value: stats.totalOrders, 
      icon: Package, 
      bg: "bg-blue-50", 
      iconBg: "bg-blue-100", 
      text: "text-blue-600",
      border: "border-blue-200"
    },
    { 
      label: "Completed", 
      value: stats.completedJobs, 
      icon: CheckCircle2, 
      bg: "bg-emerald-50", 
      iconBg: "bg-emerald-100", 
      text: "text-emerald-600",
      border: "border-emerald-200"
    },
    { 
      label: "Total Spent", 
      value: `৳${stats.totalSpent.toLocaleString()}`, 
      icon: DollarSign, 
      bg: "bg-amber-50", 
      iconBg: "bg-amber-100", 
      text: "text-amber-600",
      border: "border-amber-200"
    },
    { 
      label: "Pending", 
      value: stats.pendingJobs, 
      icon: Clock, 
      bg: "bg-orange-50", 
      iconBg: "bg-orange-100", 
      text: "text-orange-600",
      border: "border-orange-200"
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      completed: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      accepted: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      {/* Welcome Banner - Compact */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 lg:mb-5 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full" />
          <div className="absolute -right-4 -bottom-12 w-24 h-24 bg-white rounded-full" />
          <div className="absolute right-20 top-1/2 w-16 h-16 bg-white rounded-full" />
        </div>
        
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
              Welcome back{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-md">
              Track your orders, manage services, and stay updated with your account activity.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-white/15 rounded-full text-xs backdrop-blur-sm">
              <Calendar className="w-3 h-3" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 mb-4 lg:mb-5">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`${stat.bg} rounded-lg sm:rounded-xl p-3 sm:p-4 border ${stat.border} hover:shadow-md transition-all duration-200 group cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.text}`} />
                </div>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-none">
                {stat.value}
              </p>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Orders & Activity - Stack on mobile, side-by-side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
        
        {/* Recent Orders */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Recent Orders
            </h2>
            <Link href="/my-orders" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="p-3 sm:p-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 sm:py-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No orders yet</p>
                <p className="text-xs text-gray-400 mt-1">Your orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-2.5">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                          {order.serviceName || "Service Order"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        ৳{order.price?.toLocaleString() || 0}
                      </p>
                      <span className={`inline-block text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium mt-0.5 ${getStatusBadge(order.status)}`}>
                        {order.status || "pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
            <h2 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Recent Activity
            </h2>
          </div>
          
          <div className="p-3 sm:p-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 sm:py-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No recent activity</p>
                <p className="text-xs text-gray-400 mt-1">Activity will appear here as you use the platform</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-2.5">
                {recentActivities.map((activity, idx) => (
                  <div 
                    key={activity.id || idx} 
                    className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-800 truncate">
                        {activity.action || "Activity"}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {activity.timestamp 
                          ? new Date(activity.timestamp).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "Recently"
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}