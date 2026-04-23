"use client";
import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Zap, Wrench, Hammer, AirVent, Paintbrush, Sparkles, Droplets, Wind,
  Truck, Camera, Wifi, BookOpen, Car, Scissors, Sparkle, Package,
  Trash2, Sofa, Box, PartyPopper
} from "lucide-react";

const services = [
  { name: "Electrician", slug: "electrician", icon: Zap },
  { name: "Plumber", slug: "plumber", icon: Wrench },
  { name: "AC Service", slug: "ac-repair", icon: AirVent },
  { name: "Carpenter", slug: "carpenter", icon: Hammer },
  { name: "Painter", slug: "painter", icon: Paintbrush },
  { name: "Deep Cleaning", slug: "deep-cleaning", icon: Sparkles },
  { name: "Glass Cleaner", slug: "glass-cleaning", icon: Droplets },
  { name: "Water Tank Cleaning", slug: "water-tank-cleaning", icon: Wind },
  { name: "Home Shifting", slug: "home-shifting", icon: Truck },
  { name: "CCTV Setup", slug: "cctv", icon: Camera },
  { name: "Internet Setup", slug: "internet", icon: Wifi },
  { name: "Home Tutor", slug: "tutor", icon: BookOpen },
  { name: "Driver", slug: "driver", icon: Car },
  { name: "Tailor", slug: "tailor", icon: Scissors },
  { name: "Salon at Home", slug: "beauty", icon: Sparkle },
  { name: "Generator Service", slug: "generator", icon: Package },
  { name: "Fridge Repair", slug: "appliance-repair", icon: Trash2 },
  { name: "Sofa Cleaning", slug: "sofa-cleaning", icon: Sofa },
  { name: "Packers & Movers", slug: "packers-movers", icon: Box },
  { name: "Event Decoration", slug: "decoration", icon: PartyPopper },
];

export default function ServiceCards() {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const card = container.firstElementChild;
      const cardWidth = card?.clientWidth || 160; // fallback
      const scrollAmount = cardWidth * 2; // scroll by about 2 cards
      const newScrollLeft = container.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  return (
    <div className="py-6 bg-gradient-to-r from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header with compact title and arrows */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
            Browse Services
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-1.5 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-green-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1.5 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-green-600" />
            </button>
          </div>
        </div>

        {/* Horizontal scrollable row - app style */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="flex-shrink-0 w-36 sm:w-40 snap-start group"
              >
                <div className="flex h-16 sm:h-20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 bg-white group-hover:-translate-y-0.5">
                  {/* Left half: white background with small icon */}
                  <div className="w-1/2 flex items-center justify-center bg-white">
                    <Icon className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  {/* Right half: green background with compact service name */}
                  <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-green-600 to-green-700 px-1">
                    <span className="text-white text-[11px] sm:text-xs font-medium text-center leading-tight px-0.5">
                      {service.name}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile hint */}
        <div className="text-center text-[10px] text-gray-400 mt-3 md:hidden">
          ← Swipe to see more →
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}