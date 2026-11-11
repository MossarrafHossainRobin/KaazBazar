"use client";
export const dynamic = 'force-dynamic';

import dynamicImport from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
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
  ChevronRight,
  LogOut,
  ArrowLeft,
  Home,
  MoreHorizontal
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

// Dynamically import MessagesComponent with SSR disabled
const MessagesComponent = dynamicImport(
  () => import("@/components/dashboard/MessagesComponent"),
  { ssr: false }
);

const menuItems = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, component: DashboardHome },
  { id: "profile", name: "Profile", icon: User, component: ProfileComponent },
  { id: "orders", name: "Orders", icon: Package, component: MyOrdersComponent },
  { id: "messages", name: "Messages", icon: MessageCircle, component: MessagesComponent },
  { id: "saved", name: "Saved", icon: Heart, component: SavedItemsComponent },
  { id: "activity", name: "Activity", icon: Clock, component: RecentActivityComponent },
  { id: "settings", name: "Settings", icon: Settings, component: SettingsComponent },
  { id: "seller", name: "Seller", icon: Shield, component: BecomeSellerComponent },
  { id: "help", name: "Help", icon: HelpCircle, component: HelpSupportComponent },
];

// Mobile bottom nav items
const mobileNavItems = [
  { id: "dashboard", name: "Home", icon: Home },
  { id: "orders", name: "Orders", icon: Package },
  { id: "messages", name: "Messages", icon: MessageCircle },
  { id: "saved", name: "Saved", icon: Heart },
  { id: "more", name: "More", icon: MoreHorizontal },
];

export default function DashboardPage() {
  const { currentUser, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // Handle tab from URL query parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && menuItems.find(item => item.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Auth check
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  // Update URL when active tab changes
  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab !== activeTab) {
      const url = activeTab === "dashboard" ? "/dashboard" : `/dashboard?tab=${activeTab}`;
      window.history.replaceState({}, "", url);
    }
  }, [activeTab, searchParams]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Get the active component
  const ActiveComponent = menuItems.find(item => item.id === activeTab)?.component || DashboardHome;
  const activeItemName = menuItems.find(item => item.id === activeTab)?.name || "Dashboard";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      
      {/* ============================================================ */}
      {/* DESKTOP TOP BAR                                              */}
      {/* ============================================================ */}
      <div className="hidden lg:flex items-center justify-between h-12 px-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">{activeItemName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{currentUser.name}</span>
          <div className="w-7 h-7 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {currentUser.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE HEADER                                                */}
      {/* ============================================================ */}
      <div className="lg:hidden flex items-center justify-between h-12 px-4 bg-white border-b border-gray-200 flex-shrink-0">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h2 className="text-sm font-semibold text-gray-800">{activeItemName}</h2>
        <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA                                            */}
      {/* ============================================================ */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* DESKTOP SIDEBAR */}
        <aside 
          className={`hidden lg:block flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ${
            isSidebarOpen ? 'w-56' : 'w-16'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className={`p-4 border-b border-gray-100 ${!isSidebarOpen && 'text-center'}`}>
              {isSidebarOpen ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors mx-auto"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400 rotate-180" />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-2 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm transition-all duration-150 group relative ${
                    activeTab === item.id 
                      ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${!isSidebarOpen && 'justify-center'}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={activeTab === item.id ? 2.5 : 1.5} />
                  {isSidebarOpen && <span className="font-medium">{item.name}</span>}
                  {!isSidebarOpen && (
                    <div className="absolute left-14 bg-gray-900 text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                      {item.name}
                    </div>
                  )}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                  !isSidebarOpen && 'justify-center'
                }`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span>Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* SINGLE PAGE CONTENT - Only shows active component */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 md:p-4 lg:p-5 min-h-full">
            <ActiveComponent />
          </div>
        </main>
      </div>

      {/* ============================================================ */}
      {/* MOBILE BOTTOM NAVIGATION                                     */}
      {/* ============================================================ */}
      <div className="lg:hidden flex-shrink-0 bg-white border-t border-gray-200 safe-area-bottom">
        <nav className="flex items-center justify-around h-14 px-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = (item.id === "more" && mobileMoreOpen) || 
                           (item.id !== "more" && activeTab === item.id);
            
            if (item.id === "more") {
              return (
                <button
                  key={item.id}
                  onClick={() => setMobileMoreOpen(true)}
                  className={`relative flex flex-col items-center justify-center w-full h-full py-1 transition-colors ${
                    mobileMoreOpen ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5.5 h-5.5" strokeWidth={mobileMoreOpen ? 2.5 : 1.5} />
                  <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
                </button>
              );
            }
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center w-full h-full py-1 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5.5 h-5.5" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ============================================================ */}
      {/* MOBILE MORE MENU (Bottom Sheet)                              */}
      {/* ============================================================ */}
      {mobileMoreOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-[100] flex items-end justify-center"
          onClick={() => setMobileMoreOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fadeInUp" />
          <div 
            className="relative w-full bg-white rounded-t-2xl shadow-2xl overflow-y-auto animate-slideDown"
            style={{ 
              maxHeight: '60vh',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 8px) + 72px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center z-10">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>
            
            <div className="px-4 pb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">More Options</p>
              {menuItems
                .filter(item => !mobileNavItems.find(nav => nav.id === item.id))
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMoreOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      activeTab === item.id
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                ))}
              
              <div className="my-2 border-t border-gray-100" />
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMoreOpen(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for mobile bottom nav */}
      <div className="lg:hidden h-14 flex-shrink-0" />
    </div>
  );
}