"use client";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Logo + Newsletter */}
        <div className="md:flex md:justify-between md:items-start border-b border-gray-700 pb-10">
          {/* Logo & Description */}
          <div className="mb-8 md:mb-0">
            <h2 className="text-2xl font-bold text-white mb-2">KaazBazar</h2>
            <p className="max-w-xs text-gray-400">
              Connecting you with verified local professionals for every home service.
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="hover:text-white"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="md:max-w-sm">
            <h3 className="text-white font-semibold mb-4">Subscribe to our Newsletter</h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-l-xl px-4 py-2 text-gray-900 focus:outline-none"
              />
              <button className="bg-yellow-400 text-gray-900 px-4 rounded-r-xl font-semibold hover:bg-yellow-300 transition">
                Subscribe
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-2">Get updates about new services and offers.</p>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10">
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/services" className="hover:text-white">Services</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/help-center" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">For Providers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/provider/signup" className="hover:text-white">Join as a Worker</Link></li>
              <li><Link href="/provider/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link href="/provider/resources" className="hover:text-white">Resources</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/support" className="hover:text-white">Customer Support</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} KaajBazar. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
