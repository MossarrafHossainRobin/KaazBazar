import { Droplets, Zap, Hammer, Sparkles, Wrench, ArrowRight } from "lucide-react";

// --- Sub-Component for each service card ---
const PopularServiceCard = ({ service }) => {
  // Map string icon names to Lucide components
  const IconComponent = {
    'Droplets': Droplets,
    'Zap': Zap,
    'Hammer': Hammer,
    'Sparkles': Sparkles,
    'Wrench': Wrench,
  }[service.icon];

  return (
    <a 
      href={service.href} 
      className="block group bg-white p-8 rounded-3xl shadow-2xl border-b-4 border-indigo-200 
                 hover:border-indigo-600 transition-all duration-300 transform 
                 hover:scale-[1.03] hover:shadow-indigo-300/50 cursor-pointer"
      aria-label={`Book ${service.name} services`}
    >
      <div className="flex flex-col items-center text-center">
        
        {/* Icon */}
        <div className="p-4 mb-5 rounded-full bg-indigo-500 text-white shadow-lg 
                      group-hover:bg-indigo-600 group-hover:scale-110 transition-transform duration-300 ease-out">
          {IconComponent && <IconComponent className="w-8 h-8" />}
        </div>
        
        {/* Title */}
        <h3 className="font-extrabold text-gray-900 text-xl md:text-2xl mb-2">
          {service.name}
        </h3>
        
        {/* Price/Range */}
        <p className="text-sm text-gray-500 font-medium mb-4">
          Typical Cost: <span className="text-indigo-600 font-semibold">{service.price}</span>
        </p>

        {/* Call to Action */}
        <span className="flex items-center text-sm font-bold text-indigo-700 
                         group-hover:text-indigo-900 transition-colors">
          Book Now
          <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  );
};


// --- Main Component ---
export default function PopularServices() {
  // Filtered list for immediate needs (now only 4 services)
  const services = [
    { icon: "Droplet", name: "Emergency Plumber", price: "৳500-1500/hr", href: "/services/plumbers" },
    { icon: "Zap", name: "Urgent Electrician", price: "৳400-1200/hr", href: "/services/electricians" },
    { icon: "Wrench", name: "Appliance Repair", price: "৳400-1000/job", href: "/services/appliance-repair" },
    { icon: "Hammer", name: "Quick Carpentry Fix", price: "৳600-2000/hr", href: "/services/carpenters" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-indigo-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Popular Services
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Quickly book trusted professionals for urgent home repair and essential maintenance.
          </p>
        </div>

        {/* Services Grid (Responsive Layout: 2 wide on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, idx) => (
            <PopularServiceCard key={idx} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
