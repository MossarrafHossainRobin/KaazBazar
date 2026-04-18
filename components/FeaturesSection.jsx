"use client";
import React from "react";

export default function FeaturesSection() {
  const features = [
    {
      icon: "🛡️",
      title: "Verified Workers",
      description:
        "All workers are ID verified and skill tested for your safety and quality assurance.",
      bg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      icon: "💳",
      title: "Secure Payments",
      description:
        "Pay safely with bKash, Nagad, or cards. Transparent billing with no hidden charges.",
      bg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: "⏰",
      title: "24/7 Support",
      description:
        "Round-the-clock customer support to help you with any issues or questions.",
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-lg text-gray-600">
            The most trusted platform for home services in Bangladesh
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition transform text-center cursor-pointer`}
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${feature.bg}`}
              >
                <span className={`text-4xl ${feature.iconColor}`}>
                  {feature.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
