"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageCircle, 
  Heart, 
  Clock, 
  Settings, 
  Shield, 
  HelpCircle,
  TrendingUp,
  Star,
  DollarSign,
  Package
} from "lucide-react";
import { getUserOrders, getUserActivities } from "@/lib/firestoreService";

export default function DashboardPage() {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedJobs: 0,
    pendingJobs: 0,
    cancelledJobs: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    setLoadingData(true);
    
    // Fetch orders
    const ordersResult = await getUserOrders(currentUser.uid, "customer");
    if (ordersResult.success) {
      const orders = ordersResult.data;
      setRecentOrders(orders.slice(0, 5));
      
      // Calculate stats
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
    
    // Fetch activities
    const activitiesResult = await getUserActivities(currentUser.uid, 10);
    if (activitiesResult.success) {
      setRecentActivities(activitiesResult.data);
    }
    
    setLoadingData(false);
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

  if (!currentUser) return null;

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: true },
    { name: "Profile", icon: Briefcase, href: "/profile" },
    { name: "My Orders", icon: Package, href: "/my-orders" },
    { name: "Messages", icon: MessageCircle, href: "/messages" },
    { name: "Saved Items", icon: Heart, href: "/saved-items" },
    { name: "Recent Activity", icon: Clock, href: "/recent-activity" },
    { name: "Account Settings", icon: Settings, href: "/settings" },
    { name: "Become a Seller", icon: Shield, href: "/become-seller" },
    { name: "Help & Support", icon: HelpCircle, href: "/help-support" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="text-center pb-6 border-b border-gray-200">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.name}
                    className="w-24 h-24 rounded-full mx-auto mb-3 object-cover ring-4 ring-green-100"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-green-100">
                    <span className="text-3xl font-bold text-white">
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="font-bold text-lg text-gray-800">{currentUser.name}</h3>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
                <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-50 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              </div>

              <div className="space-y-1 mt-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      item.active 
                        ? "bg-green-50 text-green-600" 
                        : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Welcome back, {currentUser.name?.split(' ')[0]}!</h1>
              <p className="text-gray-500 mt-1">Here's what's happening with your account today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Completed Jobs</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-800">৳{stats.totalSpent}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingJobs}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h2>
              {loadingData ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders yet</p>
                  <Link href="/" className="text-green-600 hover:underline text-sm mt-2 inline-block">
                    Browse Services
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{order.serviceName || "Service"}</p>
                          <p className="text-xs text-gray-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent"}
                          </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}