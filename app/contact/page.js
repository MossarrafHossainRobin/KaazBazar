"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const ContactPage = () => {
  const PRIMARY_COLOR = "bg-indigo-800";
  const ACCENT_COLOR = "text-yellow-400";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">
            Get In Touch
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Our dedicated support team is here to ensure a smooth connection
            between you and your service provider.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Left Panel */}
          <div
            className={`p-8 md:p-12 lg:col-span-1 ${PRIMARY_COLOR} text-white flex flex-col justify-between`}
          >
            <div>
              <h2 className="text-3xl font-bold mb-6">Need Immediate Help?</h2>
              <p className="text-indigo-200 mb-8">
                For existing bookings or urgent matters, please use our dedicated channels below.
              </p>

              <div className="space-y-6">
                <ContactDetail
                  icon="📞"
                  title="Emergency Support Line"
                  info="+1 (555) 123-4567"
                  className={ACCENT_COLOR}
                />
                <ContactDetail icon="📧" title="General Inquiries" info="hello@servly.com" />
                <ContactDetail icon="⚙️" title="Technical Support" info="support@servly.com" />
                <ContactDetail icon="📍" title="Our Global HQ" info="101 Digital Way, Suite 400, Tech City, 90210" />
              </div>
            </div>

            <div className="mt-10 border-t border-indigo-600 pt-6">
              <p className="text-sm text-indigo-200">
                Available 24/7 — we’re always ready to assist you.
              </p>
            </div>
          </div>

          {/* Right Panel - Contact Form */}
          <div className="p-8 md:p-12 lg:col-span-2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Send Us a Message
            </h2>

            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="support@kaazbazar.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <select
                  id="subject"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition"
                >
                  <option value="">Select...</option>
                  <option>Question about a Booking</option>
                  <option>Become a Service Provider (Talent)</option>
                  <option>General Feedback</option>
                  <option>Technical Issue</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows="5"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-lg text-white shadow-lg transition-all duration-300 hover:opacity-90 bg-gradient-to-r from-blue-700 to-indigo-800"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Sub-component for contact details
const ContactDetail = ({ icon, title, info, className = "text-white" }) => (
  <div className="flex items-start space-x-4">
    <div className={`text-2xl ${className}`}>{icon}</div>
    <div>
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="text-indigo-200">{info}</p>
    </div>
  </div>
);

export default ContactPage;
