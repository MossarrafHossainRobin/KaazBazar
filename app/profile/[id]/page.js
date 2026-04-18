"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  Wrench,
  CheckCircle,
  DollarSign,
  Clock
} from "lucide-react";
import { MOCK_TECHNICIANS } from "@/app/data/technicians";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Stat Card
const StatCard = ({ icon: Icon, title, value, color }) => (
  <div className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-lg border-l-4 hover:shadow-2xl transition-shadow" style={{borderColor: color}}>
    <Icon className="w-6 h-6 flex-shrink-0" style={{color}} />
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-xl font-extrabold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function TechnicianProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const [technician, setTechnician] = useState(null);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (!id) return;
    const tech = MOCK_TECHNICIANS.find((t) => t.id === parseInt(id));
    setTechnician(tech);
  }, [id]);

  if (!technician) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-2xl font-semibold mb-4">Technician Not Found</h2>
        <button
          onClick={() => router.push("/services/appliance-repair")}
          className="text-blue-600 underline"
        >
          Go Back to Services
        </button>
      </div>
    );
  }

  const dynamicColor = "#2563eb"; // Blue theme for technicians

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="relative">
            <img
              src={technician.imageUrl}
              alt={technician.name}
              className="w-36 h-36 rounded-full object-cover ring-4 ring-white shadow-2xl -mb-16 md:mb-0 z-10"
            />
            <div className="absolute -bottom-5 -right-5 bg-yellow-400 text-blue-900 font-bold py-1 px-3 rounded-xl shadow-md text-sm">
              Top Rated
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold flex items-center">
              {technician.name} <CheckCircle className="w-6 h-6 ml-3 text-green-500" />
            </h1>
            <p className="text-xl font-semibold">{technician.title}</p>
            <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-gray-200">
              <span className="flex items-center gap-1"><MapPin className="w-5 h-5"/> {technician.location}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-5 h-5"/> ${technician.price}/hr</span>
              <span className="flex items-center gap-1"><Star className="w-5 h-5"/> {technician.rating.toFixed(1)}/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6 sticky top-10">
          <a
            href={`/hire/${technician.id}`}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all flex justify-center items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" /> Hire {technician.name}
          </a>

          <StatCard icon={DollarSign} title="Rate / hr" value={`$${technician.price}`} color={dynamicColor} />
          <StatCard icon={Star} title="Rating" value={`${technician.rating.toFixed(1)}/5`} color={dynamicColor} />
          <StatCard icon={Clock} title="Jobs Completed" value={`${technician.reviews} +`} color={dynamicColor} />
        </div>

        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex gap-4 border-b pb-2 mb-4">
              {["about","services","stats"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-semibold transition-all ${
                    activeTab===tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-600"
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
                  <Wrench className="w-6 h-6 mr-2" style={{color: dynamicColor}} /> Professional Overview
                </h2>
                <p className="text-gray-700 italic leading-relaxed">{technician.description}</p>
              </div>
            )}

            {activeTab==="services" && (
              <div className="flex flex-wrap gap-3 mt-2">
                {technician.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 text-sm font-medium rounded-full shadow-sm bg-blue-100 text-blue-800 hover:brightness-110 transition-colors"
                  >
                    {cat.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            )}

            {activeTab==="stats" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
                <StatCard icon={DollarSign} title="Rate / hr" value={`$${technician.price}`} color={dynamicColor} />
                <StatCard icon={Star} title="Rating" value={`${technician.rating.toFixed(1)}/5`} color={dynamicColor} />
                <StatCard icon={Clock} title="Jobs Completed" value={`${technician.reviews} +`} color={dynamicColor} />
              </div>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
