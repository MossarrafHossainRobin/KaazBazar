"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PaintBucket,
  MapPin,
  Star,
  DollarSign,
  Brush,
  CheckCircle,
  Globe,
  Palette
} from "lucide-react";
import { getPainterById } from '@/app/data/painters'; 

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-lg border-l-4 hover:shadow-2xl transition-shadow" style={{borderColor: color}}>
      <Icon className="w-6 h-6 flex-shrink-0" style={{color}} />
      <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-xl font-extrabold text-gray-800">{value}</p>
      </div>
  </div>
);

export default function PainterProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
      if (!id) return;
      const data = getPainterById(id);
      setProfile(data);
  }, [id]);

  if (!profile) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                  <PaintBucket className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Painter Not Found</h1>
                  <p className="text-gray-600">Profile ID: <strong>{id || "unknown"}</strong> could not be found.</p>
                  <button
                    onClick={() => router.push("/services/painters")}
                    className="mt-4 text-indigo-600 hover:underline"
                  >
                      &larr; Back to Painter Directory
                  </button>
              </div>
          </div>
      );
  }

  const dynamicColor = profile.color || "#6366f1"; // Default Indigo

  return (
    <div className="bg-gray-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="relative">
            <img
              src={profile.imageUrl}
              alt={profile.name}
              className="w-36 h-36 rounded-full object-cover ring-4 ring-white shadow-2xl -mb-16 md:mb-0 z-10"
            />
            <div className="absolute -bottom-5 -right-5 bg-yellow-400 text-indigo-900 font-bold py-1 px-3 rounded-xl shadow-md text-sm">
              Top Rated
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold flex items-center">
              {profile.name} <CheckCircle className="w-6 h-6 ml-3 text-green-500" />
            </h1>
            <p className="text-xl font-semibold">{profile.title}</p>
            <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-gray-200">
              <span className="flex items-center gap-1"><MapPin className="w-5 h-5"/> {profile.location}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-5 h-5"/> ${profile.price}/hr</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6 sticky top-10">
          <a
            href={`/painters/hire/${id}`}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-800 transition-all flex justify-center items-center gap-2"
          >
            <PaintBucket className="w-5 h-5" /> Hire {profile.name}
          </a>

          <StatCard icon={DollarSign} title="Starting Rate" value={`$${profile.price}`} color={dynamicColor} />
          <StatCard icon={Star} title="Rating" value={`${profile.rating.toFixed(1)}/5`} color={dynamicColor} />
          <StatCard icon={Brush} title="Total Jobs" value={profile.reviews} color={dynamicColor} />
        </div>

        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
            <div className="flex gap-4 border-b pb-2 mb-4">
              {["about","services","stats"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-semibold transition-all ${
                    activeTab===tab ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                  }`}
                >
                  {tab === "about" ? "About Me" : tab === "services" ? "Services" : "Stats"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab==="about" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <Brush className="w-6 h-6 mr-2" style={{color: dynamicColor}} /> Professional Overview
                </h2>
                <p className="text-gray-700 italic leading-relaxed">"{profile.description}"</p>
              </div>
            )}

            {activeTab==="services" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center p-4 bg-indigo-50 rounded-lg shadow hover:shadow-lg transition relative group">
                    <Palette className="w-6 h-6 mr-3" style={{color: dynamicColor}} />
                    <p className="font-bold text-indigo-800 group-hover:text-indigo-900">{cat}</p>
                    <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      Popular
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab==="stats" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard icon={DollarSign} title="Rate" value={`$${profile.price}`} color={dynamicColor} />
                <StatCard icon={Star} title="Rating" value={`${profile.rating.toFixed(1)}/5`} color={dynamicColor} />
                <StatCard icon={Brush} title="Jobs Completed" value={profile.reviews} color={dynamicColor} />
              </div>
            )}
          </div>

          {/* Portfolio / Projects */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2" style={{color: dynamicColor}} /> Recent Projects
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <img src={`https://placehold.co/400x300/${dynamicColor.substring(1)}/ffffff?text=Interior+Painting`} alt="Project 1" className="w-full h-auto rounded-lg shadow-md object-cover"/>
              <img src="https://placehold.co/400x300/e0e0e0/374151?text=Exterior+Painting" alt="Project 2" className="w-full h-auto rounded-lg shadow-md object-cover"/>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
