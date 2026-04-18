"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Target, Globe2, Lightbulb } from "lucide-react";

const AboutPage = () => {
  const PRIMARY_COLOR = "bg-indigo-800";
  const ACCENT_COLOR = "text-yellow-400";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-700 to-blue-700 opacity-90"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28 relative z-10 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold mb-6"
          >
            Building Connections <span className={ACCENT_COLOR}>Digitally</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto text-indigo-100"
          >
            From idea to prototype, we focus on creating reliable digital service connections for everyone.
          </motion.p>
        </div>
      </section>

      {/* OUR MISSION & VISION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-14">Our Core Beliefs</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <Card
              icon={<Target className="w-12 h-12 text-yellow-400" />}
              title="Our Mission"
              description="To create accessible and trustworthy digital service solutions for everyone, starting from a simple idea."
            />
            <Card
              icon={<Lightbulb className="w-12 h-12 text-yellow-400" />}
              title="Our Vision"
              description="To transform ideas into meaningful digital solutions that bridge gaps between service providers and clients."
            />
          </div>
        </div>
      </section>

      {/* JOURNEY TIMELINE */}
      <section className="py-24 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-14">Our Journey</h2>
          <div className="relative border-l-4 border-indigo-700 ml-8 space-y-12">
            {TIMELINE.map((item, i) => (
              <div key={i} className="ml-6">
                <div className="absolute -left-4 w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold">
                  {i + 1}
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
                >
                  <h3 className="text-xl font-semibold text-gray-900">{item.year}</h3>
                  <p className="text-gray-600 mt-2">{item.event}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL IMPACT */}
      <section className={`${PRIMARY_COLOR} text-white py-20`}>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Globe2 className="w-14 h-14 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-4xl font-bold mb-4">Our Current Focus</h2>
          <p className="text-indigo-200 max-w-2xl mx-auto text-lg">
            We are currently developing and refining our prototype to deliver a reliable digital service platform.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Card = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-gray-50 p-10 rounded-3xl shadow-xl border border-gray-100"
  >
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const TIMELINE = [
  { year: "2024", event: "Conceptualized the idea and started planning the platform." },
  { year: "2025", event: "Developed the first prototype of the platform and tested initial workflows." },
];

export default AboutPage;
