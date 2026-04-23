"use client";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MyOrdersComponent from "@/components/dashboard/MyOrdersComponent";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MyOrdersPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only redirect after auth is done loading and user is not authenticated
    if (!authLoading && !currentUser && !isRedirecting) {
      setIsRedirecting(true);
      router.replace("/login?redirect=/my-orders");
    }
  }, [authLoading, currentUser, router, isRedirecting]);

  // Show nothing while checking auth (prevents blinking)
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading your account...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // User is not authenticated - don't render anything (will redirect)
  if (!currentUser) {
    return null;
  }

  // User is authenticated - show the orders page
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <MyOrdersComponent />
        </div>
      </main>
      <Footer />
    </div>
  );
}