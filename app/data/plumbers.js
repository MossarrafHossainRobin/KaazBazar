// File: app/data/plumbers.js

// --- Configuration (Copied from PlumbersPage to ensure consistency) ---
const NAMES = ["Tariq", "Sadia", "Karim", "Farida", "Jamil", "Rina", "Nabil", "Shapla", "Omar", "Laila", "Rafiq", "Nazmul", "Sonia", "Fahim"];
const LOCATIONS = ["Dhaka North", "Dhaka South", "Chattogram", "Khulna", "Sylhet", "Rajshahi", "Barisal", "Rangpur"];
const CATEGORIES = ["Emergency", "Leak Detection", "Pipe Repair", "Drain Cleaning", "Water Heater", "Fittings", "Inspection", "Commercial", "Maintenance"];
const IMAGE_COLORS = ["0891b2", "10b981", "374151", "f59e0b", "2563eb", "06b6d4", "3b82f6", "1d4ed8"];

const BASE_GIGS = [
    { title: "24/7 Emergency Leak & Burst Pipe Repair Specialist", desc: "Rapid response for all urgent plumbing issues. Immediate pipe repairs and fault finding.", cats: ["Emergency", "Pipe Repair"] },
    { title: "Drain Cleaning & Water Heater Installation Expert", desc: "Specializing in unclogging heavy drains using hydro-jetting and professional setup of tankless water heaters.", cats: ["Drain Cleaning", "Water Heater"] },
    { title: "Bathroom & Kitchen Fitting and Fixture Replacements", desc: "High-quality installation of taps, sinks, toilets, and showers. Focus on modern fixtures and water conservation.", cats: ["Fittings", "Inspection"] },
    { title: "Residential and Commercial Plumbing Audits", desc: "Comprehensive plumbing system health checks, pressure testing, and preventative maintenance for large properties.", cats: ["Inspection", "Maintenance", "Commercial"] },
    { title: "Advanced Leak Detection and Water Pressure Services", desc: "Using non-invasive techniques (thermal imaging) to locate hidden leaks and calibrate water pressure systems.", cats: ["Leak Detection", "Pipe Repair", "Inspection"] },
];

// --- Mock Data Generation Function ---
const generateMockPlumbers = (count) => {
  const plumbers = [];
  for (let i = 1; i <= count; i++) {
    const nameIndex = i % NAMES.length;
    const locationIndex = i % LOCATIONS.length;
    const colorIndex = i % IMAGE_COLORS.length;
    const baseGig = BASE_GIGS[i % BASE_GIGS.length];
    
    const basePrice = 50 + (i % 25); 
    
    const assignedCategories = Array.from(new Set([
        ...baseGig.cats,
        CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    ])).slice(0, 4);

    plumbers.push({
      id: String(100 + i), // Ensure ID is a string for params consistency
      name: `${NAMES[nameIndex]} Khan ${i}`,
      title: baseGig.title,
      description: baseGig.desc,
      rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
      reviews: Math.floor(Math.random() * 500) + 50,
      price: basePrice + Math.floor(Math.random() * 15),
      location: LOCATIONS[locationIndex],
      categories: assignedCategories,
      imageUrl: `https://placehold.co/600x400/${IMAGE_COLORS[colorIndex]}/ffffff?text=${baseGig.title.split(' ')[0]}`,
      profilePic: `https://placehold.co/100x100/${IMAGE_COLORS[(colorIndex + 4) % IMAGE_COLORS.length]}/ffffff?text=${NAMES[nameIndex].charAt(0)}`,
    });
  }
  return plumbers;
};

// Generate and store the mock data
const MOCK_PLUMBERS = generateMockPlumbers(50); 

// --- Data Access Function ---
export function getPlumberById(id) {
    // Note: The ID passed via params is a string
    return MOCK_PLUMBERS.find(plumber => plumber.id === String(id));
}

// Export the full list for potential use in the main directory if needed
export default MOCK_PLUMBERS;