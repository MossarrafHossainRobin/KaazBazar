"use client";
import Link from "next/link";
import { LayoutDashboard, Briefcase, MessageCircle } from "lucide-react";

export default function UserDashboard({ currentUser }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome back, {currentUser.name}!
            </h2>
            <p className="text-gray-600">{currentUser.email}</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Go to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t">
        <div className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition">
          <LayoutDashboard className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{currentUser.listings || 3}</div>
          <div className="text-gray-600">Active Listings</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition">
          <Briefcase className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{currentUser.sales || 8}</div>
          <div className="text-gray-600">Total Jobs</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg hover:shadow-md transition">
          <MessageCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{currentUser.messages || 5}</div>
          <div className="text-gray-600">Messages</div>
        </div>
      </div>
    </div>
  );
}