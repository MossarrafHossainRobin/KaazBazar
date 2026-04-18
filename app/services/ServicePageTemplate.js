"use client";
import Link from "next/link";
import { Phone } from "lucide-react";

export default function ServicePageTemplate({
  emoji,
  title,
  subtitle,
  gradient,
  accent,
  services,
  testimonials,
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className={`bg-gradient-to-r ${gradient} text-white py-24 text-center`}>
        <h1 className="text-5xl font-extrabold mb-4">
          {emoji} {title}
        </h1>
        <p className="text-lg text-indigo-100 max-w-2xl mx-auto">{subtitle}</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/contact"
            className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl shadow hover:scale-[1.03] transition-transform"
          >
            Book Now
          </Link>
          <a
            href="#services"
            className="px-8 py-3 border-2 border-yellow-400 text-yellow-300 font-semibold rounded-xl hover:bg-yellow-400 hover:text-gray-900 transition-all"
          >
            Explore
          </a>
        </div>
      </section>

      {/* Services Offered */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">What We Offer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((s, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-indigo-200 hover:border-indigo-600"
            >
              <h3 className={`text-xl font-bold mb-2 ${accent}`}>{s.name}</h3>
              <p className="text-gray-600">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20 border-t border-gray-200">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-10">What Our Clients Say</h2>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-indigo-50 p-8 rounded-2xl shadow">
              <p className="italic mb-4">“{t.feedback}”</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">{t.name}</span>
                <span className="text-yellow-500">
                  {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center bg-gradient-to-r from-yellow-400 to-orange-400">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Need Help? We’re Ready!</h2>
        <p className="text-lg text-gray-800 mb-6">
          Our certified professionals are just one call away — anytime you need us.
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="tel:+15551234567"
            className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:scale-[1.05] transition-transform"
          >
            <Phone className="w-5 h-5" /> Call Now
          </a>
          <Link
            href="/contact"
            className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 shadow-lg"
          >
            Send Message
          </Link>
        </div>
      </section>
    </div>
  );
}
