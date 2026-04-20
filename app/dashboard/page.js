"use client";
export const dynamic = 'force-dynamic';

import dynamicImport from "next/dynamic";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  User, 
  Package, 
  MessageCircle, 
  Heart, 
  Clock, 
  Settings, 
  Shield, 
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  LogOut,
  ArrowLeft
} from "lucide-react";

// Import non-chat components normally
import DashboardHome from "@/components/dashboard/DashboardHome";
import ProfileComponent from "@/components/dashboard/ProfileComponent";
import MyOrdersComponent from "@/components/dashboard/MyOrdersComponent";
import SavedItemsComponent from "@/components/dashboard/SavedItemsComponent";
import RecentActivityComponent from "@/components/dashboard/RecentActivityComponent";
import SettingsComponent from "@/components/dashboard/SettingsComponent";
import BecomeSellerComponent from "@/components/dashboard/BecomeSellerComponent";
import HelpSupportComponent from "@/components/dashboard/HelpSupportComponent";

// ✅ Dynamically import MessagesComponent with SSR disabled using renamed import
const MessagesComponent = dynamicImport(
  () => import("@/components/dashboard/MessagesComponent"),
  { ssr: false }
);

const menuItems = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, component: DashboardHome },
  { id: "profile", name: "Profile", icon: User, component: ProfileComponent },
  { id: "orders", name: "My Orders", icon: Package, component: MyOrdersComponent },
  { id: "messages", name: "Messages", icon: MessageCircle, component: MessagesComponent },
  { id: "saved", name: "Saved Items", icon: Heart, component: SavedItemsComponent },
  { id: "activity", name: "Recent Activity", icon: Clock, component: RecentActivityComponent },
  { id: "settings", name: "Account Settings", icon: Settings, component: SettingsComponent },
  { id: "seller", name: "Become a Seller", icon: Shield, component: BecomeSellerComponent },
  { id: "help", name: "Help & Support", icon: HelpCircle, component: HelpSupportComponent },
];

export default function DashboardPage() {
  const { currentUser, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "messages") {
      setActiveTab("messages");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
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

  const ActiveComponent = menuItems.find(item => item.id === activeTab)?.component || DashboardHome;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button to Home */}
      <div className="fixed top-4 left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">Back to Home</span>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="hidden lg:flex fixed top-24 z-50 bg-white rounded-r-lg shadow-md p-1 transition-all duration-300"
        style={{ left: isSidebarOpen ? 288 : 80 }}
      >
        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
      </button>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white shadow-xl transition-all duration-300 ${
            isSidebarOpen ? 'w-72' : 'w-20'
          } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className={`p-6 border-b border-gray-200 ${!isSidebarOpen && 'lg:px-2'}`}>
              <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                {isSidebarOpen && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                    <p className="text-xs text-gray-500 mt-1">Welcome back</p>
                  </div>
                )}
                <div className={`w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold ${!isSidebarOpen && 'lg:mx-auto'}`}>
                  {currentUser.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* User Info */}
            {isSidebarOpen && (
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="font-semibold text-gray-800 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-green-50 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-green-600">Active</span>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    activeTab === item.id 
                      ? "bg-green-50 text-green-600" 
                      : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                  {!isSidebarOpen && (
                    <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </button>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 ${!isSidebarOpen && 'lg:justify-center'}`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
                {!isSidebarOpen && (
                  <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Logout
                  </div>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300`}>
          <div className="p-4 md:p-6 lg:p-8">
            <ActiveComponent />
          </div>
        </main>
      </div>
    </div>
  );
}