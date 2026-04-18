"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Zap,
  Star,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  User,
  ClipboardList,
  Bolt,
  Briefcase
} from "lucide-react";
import { getElectricianById } from "@/app/data/electricians";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Reusable DetailItem
const DetailItem = ({ Icon, label, value }) => (
  <div className="flex items-center p-3 bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300 border border-gray-200">
    <Icon className="w-5 h-5 mr-3 text-indigo-600" />
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

export default function ElectricianProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (!id) return;
    const data = getElectricianById(id);
    setProfile(data);
  }, [id]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center">
          <User className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Electrician Not Found</h1>
          <p className="text-gray-600">Profile ID: <strong>{id || "unknown"}</strong> could not be loaded.</p>
          <button
            onClick={() => router.push("/services/electricians")}
            className="mt-4 text-indigo-600 hover:underline"
          >
            &larr; Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="relative">
            <img
              src={profile.imageUrl || "/default-profile.png"}
              alt={`${profile.name} profile`}
              className="w-36 h-36 rounded-full object-cover ring-4 ring-yellow-400 shadow-2xl -mb-16 md:mb-0 z-10"
            />
            <div className="absolute -bottom-5 -right-5 bg-yellow-400 text-indigo-900 font-bold py-1 px-3 rounded-xl shadow-md text-sm">
              Top Rated
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold">{profile.name}</h1>
            <p className="text-xl font-medium text-indigo-200">{profile.title}</p>
            <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start text-gray-200">
              <span className="flex items-center gap-1"><MapPin className="w-5 h-5"/> {profile.location}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-5 h-5"/> ${profile.price}/hr</span>
              <span className="flex items-center gap-1"><Clock className="w-5 h-5"/> Response: {profile.responseTime}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6 sticky top-10">
          <button
            onClick={() => router.push(`/electricians/hire/${profile.id}`)}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex justify-center items-center gap-2"
          >
            <Zap className="w-5 h-5" /> Hire {profile.name}
          </button>

          {profile.contact && (
            <a
              href={`tel:${profile.contact}`}
              className="w-full py-4 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition-all flex justify-center items-center gap-2 border border-gray-300"
            >
              <Phone className="w-5 h-5" /> Call {profile.contact}
            </a>
          )}

          <DetailItem Icon={DollarSign} label="Base Rate" value={`$${profile.price}/hr`} />
          <DetailItem Icon={Clock} label="Response Time" value={profile.responseTime} />
          <DetailItem Icon={Star} label="Rating" value={`${profile.rating.toFixed(1)}/5`} />
          <DetailItem Icon={ClipboardList} label="Reviews" value={profile.reviews} />
          <DetailItem Icon={Briefcase} label="Experience" value={profile.experience} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-indigo-500">
            <div className="flex gap-4 border-b pb-2 mb-4">
              <button
                className={`px-4 py-2 font-semibold transition-all ${activeTab==="about"?"border-b-2 border-indigo-600 text-indigo-600":"text-gray-500 hover:text-indigo-600"}`}
                onClick={() => setActiveTab("about")}
              >
                About Me
              </button>
              <button
                className={`px-4 py-2 font-semibold transition-all ${activeTab==="services"?"border-b-2 border-indigo-600 text-indigo-600":"text-gray-500 hover:text-indigo-600"}`}
                onClick={() => setActiveTab("services")}
              >
                Services
              </button>
              <button
                className={`px-4 py-2 font-semibold transition-all ${activeTab==="stats"?"border-b-2 border-indigo-600 text-indigo-600":"text-gray-500 hover:text-indigo-600"}`}
                onClick={() => setActiveTab("stats")}
              >
                Stats
              </button>
            </div>

            {/* Tab Content */}
            {activeTab==="about" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-indigo-600" /> Professional Overview
                </h2>
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              </div>
            )}

            {activeTab==="services" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.servicesOffered.map((service, idx) => (
                  <div key={idx} className="relative flex justify-between items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors shadow group">
                    <div>
                      <p className="text-lg font-bold text-indigo-800 group-hover:text-indigo-900">{service.name}</p>
                      <p className="text-sm text-gray-600 group-hover:text-gray-800">{service.details}</p>
                    </div>
                    <div className="flex items-center text-xl font-extrabold text-blue-700 flex-shrink-0 ml-4">
                      <DollarSign className="w-5 h-5" />
                      {service.startingPrice}
                      <span className="text-sm font-medium text-gray-500 ml-1">/hr</span>
                    </div>
                    <div className="absolute -top-2 -right-2 bg-indigo-600 text-white px-2 py-1 text-xs rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      Popular
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab==="stats" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
                  <Star className="w-8 h-8 text-indigo-600 mb-2" />
                  <h3 className="text-xl font-bold text-gray-900">Rating</h3>
                  <p className="text-gray-600 mt-1">{profile.rating.toFixed(1)}/5</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
                  <ClipboardList className="w-8 h-8 text-indigo-600 mb-2" />
                  <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
                  <p className="text-gray-600 mt-1">{profile.reviews} reviews</p>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
                  <Briefcase className="w-8 h-8 text-indigo-600 mb-2" />
                  <h3 className="text-xl font-bold text-gray-900">Experience</h3>
                  <p className="text-gray-600 mt-1">{profile.experience}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
