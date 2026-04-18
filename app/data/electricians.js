// File: app/data/electricians.js

export const MOCK_ELECTRICIANS_DATA = [
  {
    id: "101",
    name: "Ayesha Rahman",
    title: "Certified Residential Wiring Specialist",
    description: "Expert in safe home rewiring, distribution board upgrades, and fault detection. Highly reliable and on time. I focus on safety and efficiency for all home electrical systems.",
    rating: 5.0,
    reviews: 155,
    price: 50,
    location: "Dhaka Central",
    categories: ["Rewiring", "Fault Fix", "Residential"],
    imageUrl: "https://placehold.co/100x100/1e3a8a/ffffff?text=AR",
    experience: "10 years",
    responseTime: "2 hours",
    contact: "+1-555-ELEC-101",
    servicesOffered: [
        { name: "Residential Rewiring", details: "Full house rewiring and distribution board upgrades.", startingPrice: 50 },
        { name: "Fault Detection", details: "Rapid troubleshooting for tripped breakers and power outages.", startingPrice: 65 },
        { name: "Safety Inspection", details: "Certified electrical safety audits and compliance checks.", startingPrice: 40 },
    ],
  },
  {
    id: "102",
    name: "Tanvir Alam",
    title: "Smart Lighting & Appliance Installation Expert",
    description: "Specializing in recessed, ambient, and smart home lighting systems. Your perfect light setup is guaranteed. I handle complex installations with finesse.",
    rating: 4.8,
    reviews: 210,
    price: 45,
    location: "Chattogram",
    categories: ["Lighting", "Installation", "Smart Home"],
    imageUrl: "https://placehold.co/100x100/1d4ed8/ffffff?text=TA",
    experience: "7 years",
    responseTime: "4 hours",
    contact: "+1-555-ELEC-102",
    servicesOffered: [
        { name: "Smart Lighting Setup", details: "Installation and configuration of smart home lighting (e.g., Philips Hue).", startingPrice: 45 },
        { name: "Appliance Wiring", details: "Dedicated circuit installation for heavy-duty appliances (ACs, Ovens).", startingPrice: 60 },
        { name: "Outlet Upgrades", details: "GFCI/AFCI outlet replacement and installation.", startingPrice: 35 },
    ],
  },
  {
    id: "103",
    name: "Mita Hasan",
    title: "Emergency 24/7 Electrical Repairs & Maintenance",
    description: "Fast response for tripped breakers, faulty outlets, and emergency power issues. Available day or night. Safety is my top priority during urgent calls.",
    rating: 4.9,
    reviews: 95,
    price: 60,
    location: "Khulna",
    categories: ["Emergency", "Repairs", "Fault Fix"],
    imageUrl: "https://placehold.co/100x100/3b82f6/ffffff?text=MH",
    experience: "5 years",
    responseTime: "1 hour (Emergency)",
    contact: "+1-555-ELEC-103",
    servicesOffered: [
        { name: "24/7 Emergency Callout", details: "Immediate repair service for critical power failures.", startingPrice: 90 },
        { name: "Panel Troubleshooting", details: "Fixing complex issues within the main electrical panel.", startingPrice: 70 },
    ],
  },
  {
    id: "104",
    name: "Jasim Uddin",
    title: "Commercial & Industrial Electrical Services",
    description: "Experienced in large-scale commercial wiring, high-capacity switchgear, and routine safety inspections. Reliable for business continuity.",
    rating: 4.7,
    reviews: 63,
    price: 75,
    location: "Sylhet",
    categories: ["Commercial", "Rewiring", "Safety Inspection"],
    imageUrl: "https://placehold.co/100x100/60a5fa/ffffff?text=JU",
    experience: "15 years",
    responseTime: "6 hours",
    contact: "+1-555-ELEC-104",
    servicesOffered: [
        { name: "Commercial Wiring", details: "Installation of high-capacity wiring for industrial spaces and offices.", startingPrice: 80 },
        { name: "Switchgear Maintenance", details: "Routine maintenance and upgrades for large electrical switchgear.", startingPrice: 120 },
    ],
  },
];

// Helper function to find an electrician by ID
export const getElectricianById = (id) => {
    // Ensure the ID being searched is compared correctly (string to string)
    return MOCK_ELECTRICIANS_DATA.find(e => String(e.id) === String(id));
};