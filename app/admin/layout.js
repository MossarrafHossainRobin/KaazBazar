// app/admin/layout.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  Star, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { id: "users", name: "User Management", icon: Users, href: "/admin/users" },
  { id: "providers", name: "Service Providers", icon: Briefcase, href: "/admin/providers" },
  { id: "orders", name: "Orders", icon: ShoppingBag, href: "/admin/orders" },
  { id: "reviews", name: "Reviews", icon: Star, href: "/admin/reviews" },
  { id: "settings", name: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout({ children }) {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        // Check if user is admin
        const isUserAdmin = currentUser?.role === "admin";
        setIsAdmin(isUserAdmin);
        if (!isUserAdmin) {
          router.push("/dashboard");
        }
      }
    }
  }, [loading, isAuthenticated, currentUser, router]);

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

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
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
          className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-gradient-to-b from-gray-900 to-gray-800 shadow-xl transition-all duration-300 ${
            isSidebarOpen ? 'w-72' : 'w-20'
          } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`p-6 border-b border-gray-700 ${!isSidebarOpen && 'lg:px-2'}`}>
              <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
                {isSidebarOpen && (
                  <div>
                    <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                    <p className="text-xs text-gray-400 mt-1">Manage your platform</p>
                  </div>
                )}
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>

            {/* Admin Info */}
            {isSidebarOpen && (
              <div className="px-6 py-4 border-b border-gray-700">
                <p className="font-semibold text-white truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
                <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-green-600 rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  <span className="text-xs text-white">Administrator</span>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    item.id === "dashboard" 
                      ? "bg-green-600 text-white" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={async () => {
                  const { signOut } = await import("firebase/auth");
                  const { auth } = await import("@/lib/firebaseClient");
                  await signOut(auth);
                  router.push("/");
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 ${!isSidebarOpen && 'lg:justify-center'}`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && <span className="text-sm font-medium">Logout</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300`}>
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}