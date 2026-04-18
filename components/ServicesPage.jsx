import { Zap, Droplets, Hammer, Sparkles, Palette, Wrench, ChevronRight } from 'lucide-react';

// --- Sub-Component for each service card ---
const ServiceCard = ({ service }) => {
  // Map string icon names to Lucide components
  const IconComponent = {
    'Zap': Zap,
    'Droplets': Droplets,
    'Hammer': Hammer,
    'Sparkles': Sparkles,
    'Palette': Palette,
    'Wrench': Wrench,
  }[service.icon];

  return (
    <a
      href={service.href}
      className="block group relative bg-white rounded-3xl shadow-xl 
                 overflow-hidden transition-all duration-500 ease-out-back transform 
                 hover:scale-[1.04] hover:shadow-2xl 
                 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-75"
      aria-label={`Explore ${service.title}`}
    >
      {/* Dynamic colored top border */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300"></div>

      <div className="p-8 flex flex-col justify-between h-full relative z-10">
        
        {/* Top Section: Icon and Title */}
        <div className="flex items-start mb-6">
          <div className="p-4 mr-4 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg 
                        group-hover:from-purple-700 group-hover:to-indigo-700 transition-all duration-300 
                        transform group-hover:rotate-6 group-hover:scale-110">
            {IconComponent && <IconComponent className="w-9 h-9" />} {/* Larger icons */}
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mt-1.5 leading-tight">
            {service.title}
          </h3>
        </div>

        {/* Key Tasks/Tasks List */}
        <ul className="text-gray-700 mb-8 space-y-3.5 text-base font-medium"> {/* Larger font, more space */}
          {service.tasks.map((task, i) => (
            <li key={i} className="flex items-start">
              <span className="mr-3 mt-1.5 w-2.5 h-2.5 rounded-full bg-purple-400 flex-shrink-0"></span> {/* Larger bullet */}
              {task}
            </li>
          ))}
        </ul>

        {/* Action/Call to Action */}
        <div className="flex items-center text-purple-600 font-bold text-lg group-hover:text-purple-800 transition-colors">
          <span>{service.buttonText}</span>
          <ChevronRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-2" /> {/* Larger arrow, more animation */}
        </div>
      </div>
    </a>
  );
};


// --- Main Component ---
export default function ServicesPage({ pageTitle, pageSubtitle }) {
 const services = [
    { icon: "Zap", title: "Electrical Services", tasks: ["Wiring & rewiring", "Fan & light installation", "Switch & socket repair", "Electrical troubleshooting"], href: "/services/electricians", buttonText: "Explore Electricians" },
    { icon: "Droplets", title: "Plumbing Services", tasks: ["Pipe repair & installation", "Bathroom fitting", "Water heater service", "Drain cleaning"], href: "/services/plumbers", buttonText: "Explore Plumbers" },
    { icon: "Hammer", title: "Carpentry Services", tasks: ["Furniture repair", "Custom woodwork", "Door & window fitting", "Kitchen cabinet installation"], href: "/services/carpenters", buttonText: "Explore Carpenters" },
    { icon: "Sparkles", title: "Cleaning Services", tasks: ["Deep house cleaning", "Office cleaning", "Post-construction cleanup", "Regular maintenance"], href: "/services/cleaners", buttonText: "Explore Cleaners" },
    { icon: "Palette", title: "Painting Services", tasks: ["Interior & exterior painting", "Wall texture work", "Color consultation", "Waterproofing solutions"], href: "/services/painters", buttonText: "Explore Painters" },
    { icon: "Wrench", title: "Appliance Repair & Handyman", tasks: ["Appliance diagnostics & repair", "Furniture assembly", "General home maintenance", "Emergency repairs"], href: "/services/appliance-repair", buttonText: "Explore Handymen" },
    { icon: "Droplets", title: "Gardening Services", tasks: ["Lawn mowing & maintenance", "Tree & shrub care", "Planting & landscaping", "Garden cleanup"], href: "/services/gardeners", buttonText: "Explore Gardeners" },
];


  const title = pageTitle || " Find The Best Expertise Here";
  const subtitle = pageSubtitle || "Connecting you with top-rated professionals for every service need.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-100 font-sans relative overflow-hidden">
        {/* Subtle background shape 1 */}
        <div className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-300 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        {/* Subtle background shape 2 */}
        <div className="absolute top-1/2 -right-1/4 w-96 h-96 bg-indigo-300 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>

        {/* Header */}
        <div className="relative z-10 bg-gradient-to-r from-purple-700 to-indigo-700 text-white py-20 mb-16 shadow-3xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-6xl font-extrabold mb-4 tracking-tight leading-tight drop-shadow-lg">
                    {title}
                </h1>
                <p className="text-xl text-purple-100 max-w-2xl mx-auto drop-shadow">
                    {subtitle}
                </p>
            </div>
        </div>

        {/* Services Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-14 text-center tracking-tight">
                Explore Our Professional Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"> {/* Increased gap */}
                {services.map((service, idx) => (
                    <ServiceCard key={idx} service={service} />
                ))}
            </div>
        </div>
    </div>
  );
}
