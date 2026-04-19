"use client";
import Link from "next/link";
import { LayoutDashboard, Briefcase, MessageCircle, User, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function UserDashboard({ currentUser }) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {currentUser.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {t.welcomeBack || "Welcome back"}, {currentUser.name}!
            </h2>
            <p className="text-gray-600 text-sm">{currentUser.email}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              {currentUser.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {currentUser.phone}
                </span>
              )}
              {currentUser.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {currentUser.city}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition text-sm"
        >
          {t.goToDashboard || "Go to Dashboard"}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <LayoutDashboard className="w-5 h-5 text-gray-700 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-800">{currentUser.listings || 0}</div>
          <div className="text-gray-600 text-sm">{t.activeListings || "Active Listings"}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <Briefcase className="w-5 h-5 text-gray-700 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-800">{currentUser.totalJobs || 0}</div>
          <div className="text-gray-600 text-sm">{t.totalJobs || "Total Jobs"}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-md">
          <MessageCircle className="w-5 h-5 text-gray-700 mx-auto mb-1" />
          <div className="text-xl font-bold text-gray-800">0</div>
          <div className="text-gray-600 text-sm">{t.messages || "Messages"}</div>
        </div>
      </div>
    </div>
  );
}