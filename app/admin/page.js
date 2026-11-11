// app/admin/page.js
"use client";
import { useState, useEffect } from "react";
import { Users, Briefcase, ShoppingBag, DollarSign } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs } from "firebase/firestore";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const providersSnap = await getDocs(collection(db, "serviceProviders"));
      const ordersSnap = await getDocs(collection(db, "orders"));
      
      const orders = ordersSnap.docs.map(doc => doc.data());
      const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
      
      setStats({
        totalUsers: usersSnap.size,
        totalProviders: providersSnap.size,
        totalOrders: ordersSnap.size,
        totalRevenue: totalRevenue
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
    { title: "Providers", value: stats.totalProviders, icon: Briefcase, color: "bg-green-500" },
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-purple-500" },
    { title: "Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-yellow-500" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5">
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
    </div>
  );
}