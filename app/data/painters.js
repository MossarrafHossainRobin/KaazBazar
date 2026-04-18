// File: app/data/painters.js

// --- Configuration (Copied from PaintersPage to ensure consistency) ---
const NAMES = ["Kamal", "Shapla", "Raju", "Nabila", "Omar", "Laila", "Rafiq"];
const LOCATIONS = ["Dhaka Central", "Chattogram", "Khulna", "Sylhet", "Dhaka North", "Dhaka South", "Old Dhaka"];
const CATEGORIES = ["Interior", "Exterior", "Commercial", "Residential", "Accent Walls", "Artistic Finishes", "Wallpaper Removal", "Eco-Friendly", "Murals", "Restoration", "Industrial", "Faux Finish"];
const IMAGE_COLORS = ["ef4444", "f97316", "eab308", "22c55e", "0ea5e9", "6366f1", "a855f7"];

// --- Mock Data Generation (50 Listings) ---
const generateMockPainters = (count) => {
  const painters = [];
  const BASE_PROFILES = [
    { title: "Residential Interior & Accent Wall Specialist", desc: "Expert in flawless indoor painting, color consultation, and creating stunning accent walls. Clean, fast, and guaranteed.", cats: ["Interior", "Accent Walls", "Residential"] },
    { title: "Exterior House Painting & Weatherproofing", desc: "Specializing in durable exterior finishes, siding, and deck staining. We protect your home from the elements.", cats: ["Exterior", "Weatherproofing", "Residential"] },
    { title: "Commercial Painting & Large-Scale Projects", desc: "High-volume commercial projects, office spaces, and industrial coatings. Reliable crew for big jobs.", cats: ["Commercial", "Industrial", "Large Projects"] },
    { title: "Artistic Finishes & Wallpaper Removal", desc: "Skilled in Venetian plaster, faux finishes, and meticulous prep work including wallpaper removal. Your vision, perfectly executed.", cats: ["Artistic Finishes", "Wallpaper Removal", "Faux Finish"] },
    { title: "Eco-Friendly & Non-Toxic Paint Solutions", desc: "Specializing in sustainable painting practices and low-VOC paints for a healthier home environment.", cats: ["Eco-Friendly", "Interior", "Residential"] },
    { title: "Custom Murals & Decorative Artwork", desc: "Bringing walls to life with bespoke murals and unique decorative painting techniques. Art for your space.", cats: ["Artistic Finishes", "Murals", "Custom Design"] },
    { title: "Historic Restoration & Heritage Painting", desc: "Preserving the past with careful restoration painting for historic homes and buildings. Attention to detail guaranteed.", cats: ["Restoration", "Heritage", "Exterior"] },
  ];

  for (let i = 1; i <= count; i++) {
    const nameIndex = i % NAMES.length;
    const locationIndex = i % LOCATIONS.length;
    const colorIndex = i % IMAGE_COLORS.length;
    const baseProfile = BASE_PROFILES[i % BASE_PROFILES.length];
    
    const basePrice = 35 + (i % 30); 
    
    // Assign 2 to 4 categories
    const assignedCategories = Array.from(new Set([
        ...baseProfile.cats,
        CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    ])).slice(0, Math.floor(Math.random() * 3) + 2);

    painters.push({
      id: String(200 + i), 
      name: `${NAMES[nameIndex]} ${i % 2 === 0 ? 'Hasan' : 'Begum'} ${i}`,
      title: baseProfile.title,
      description: baseProfile.desc,
      rating: parseFloat((4.5 + Math.random() * 0.5).toFixed(1)),
      reviews: Math.floor(Math.random() * 300) + 40,
      price: basePrice + Math.floor(Math.random() * 20),
      location: LOCATIONS[locationIndex],
      categories: assignedCategories,
      // Color used for dynamic styling
      color: `#${IMAGE_COLORS[colorIndex]}`,
      // Dynamic profile pic to match color scheme
      imageUrl: `https://placehold.co/100x100/${IMAGE_COLORS[colorIndex]}/ffffff?text=${NAMES[nameIndex].charAt(0)}`,
      responseTime: `${Math.floor(Math.random() * 6) + 1} hours`,
    });
  }
  return painters;
};

// Generate and store the mock data
const MOCK_PAINTERS = generateMockPainters(50); 

// --- Data Access Function ---
/**
 * Retrieves a painter profile by ID from the mock data list.
 * @param {string} id - The ID of the painter to retrieve.
 * @returns {object | undefined} The painter profile object, or undefined if not found.
 */
export function getPainterById(id) {
    // Note: The ID passed via params is a string
    return MOCK_PAINTERS.find(painter => String(painter.id) === String(id));
}

// Export the full list for potential use
export default MOCK_PAINTERS;