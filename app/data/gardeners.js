// File: app/data/gardeners.js

// --- Configuration (Copied from GardenersPage to ensure consistency) ---
const CATEGORIES = ["Lawn Care", "Landscaping", "Tree Trimming", "Weeding", "Pest Control", "Hedge Cutting", "Seasonal Cleanup", "Garden Design"];
const LOCATIONS = ["Central City", "West End", "North Suburbs", "East Bay", "Downtown", "South Side"];
const NAMES = ["Alia", "Babar", "Chanda", "Dawood", "Esha", "Farooq", "Gulzar", "Hina", "Imran", "Joya"];
const MOCK_TITLES = [
    "Master Landscaper & Design Specialist", 
    "Organic Lawn & Turf Expert", 
    "Certified Arborist & Tree Care", 
    "Residential Garden Maintenance Pro", 
    "Weed & Seasonal Cleanup Specialist"
];
const IMAGE_COLORS = ["#65a30d", "#4d7c0f", "#84cc16", "#a3e635", "#365314", "#45781a"]; // Shades of Lime and Green

// --- Mock Data Generation (50 Listings) ---
const generateMockGardeners = (count) => {
  const gardeners = [];
  for (let i = 1; i <= count; i++) {
    const nameIndex = i % NAMES.length;
    const locationIndex = i % LOCATIONS.length;
    const titleIndex = i % MOCK_TITLES.length;
    const colorIndex = i % IMAGE_COLORS.length;
    
    const basePrice = 30 + (i % 20); 
    const rating = parseFloat((4.0 + Math.random() * 0.9).toFixed(1));

    // Randomly assign 2 to 3 categories
    const assignedCategories = Array.from(new Set([
        CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
        CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
    ])).slice(0, 3); 

    const colorHex = IMAGE_COLORS[colorIndex];
    
    gardeners.push({
      id: String(500 + i), // Ensure ID is treated as a string for routing
      name: `${NAMES[nameIndex]} Khan ${i}`,
      title: MOCK_TITLES[titleIndex],
      description: "Dedicated professional offering specialized garden and lawn maintenance services. Custom quotes available for large projects.",
      rating: rating,
      reviews: Math.floor(Math.random() * 300) + 20,
      price: basePrice + Math.floor(Math.random() * 10),
      location: LOCATIONS[locationIndex],
      categories: assignedCategories,
      color: colorHex, // Explicit color property for styling
      imageUrl: `https://placehold.co/600x400/${colorHex.substring(1)}/ffffff?text=${MOCK_TITLES[titleIndex].split(' ')[0]}`,
      profilePic: `https://placehold.co/100x100/${IMAGE_COLORS[(colorIndex + 3) % IMAGE_COLORS.length].substring(1)}/ffffff?text=${NAMES[nameIndex].charAt(0)}`,
      responseTime: `${Math.floor(Math.random() * 4) + 1} hours`,
    });
  }
  return gardeners;
};

// Generate and store the mock data
const MOCK_GARDENERS = generateMockGardeners(50); 

// --- Data Access Function ---
/**
 * Retrieves a gardener profile by ID from the mock data list.
 * @param {string} id - The ID of the gardener to retrieve.
 * @returns {object | undefined} The gardener profile object, or undefined if not found.
 */
export function getGardenerById(id) {
    return MOCK_GARDENERS.find(gardener => String(gardener.id) === String(id));
}

// Export the full list and function
export default MOCK_GARDENERS;