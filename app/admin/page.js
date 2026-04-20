// app/admin/page.js
"use client";
import { useState, useEffect } from "react";
import { Users, ShoppingBag, Star, DollarSign, TrendingUp, UserCheck, UserX, Activity } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const providersSnapshot = await getDocs(collection(db, "serviceProviders"));
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const providers = providersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
      const activeUsers = users.filter(u => u.isActive !== false).length;
      const inactiveUsers = users.filter(u => u.isActive === false).length;
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const completedOrders = orders.filter(o => o.status === "completed").length;
      
      setStats({
        totalUsers: users.length,
        totalProviders: providers.length,
        totalOrders: orders.length,
        totalRevenue,
        activeUsers,
        inactiveUsers,
        pendingOrders,
        completedOrders
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(10));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentUsers(users);
    } catch (error) {
      console.error("Error fetching recent users:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
    { title: "Service Providers", value: stats.totalProviders, icon: ShoppingBag, color: "bg-green-500" },
    { title: "Total Orders", value: stats.totalOrders, icon: DollarSign, color: "bg-purple-500" },
    { title: "Total Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-yellow-500" },
    { title: "Active Users", value: stats.activeUsers, icon: UserCheck, color: "bg-emerald-500" },
    { title: "Inactive Users", value: stats.inactiveUsers, icon: UserX, color: "bg-red-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Administrator!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Users</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-bold">{user.name?.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.isActive !== false ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {user.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}