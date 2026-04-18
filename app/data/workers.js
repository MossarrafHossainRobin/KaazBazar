// File: app/data/workers.js

const GENERAL_CATEGORIES = ["Plumber", "Electrician", "Carpenter", "Cleaner", "Painter", "Handyman"];

// --- ALL 64 DISTRICTS OF BANGLADESH ---
const LOCATIONS = [
    "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria", 
    "Chandpur", "Chapai Nawabganj", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", 
    "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", 
    "Habiganj", "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", 
    "Khagrachhari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", 
    "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", 
    "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", 
    "Natore", "Netrakona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", 
    "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", 
    "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", 
    "Tangail", "Thakurgaon"
];

const NAMES = ["Rahman", "Karim", "Sumiya", "Jahid", "Fariha", "Akash", "Tania", "Rashed", "Shuvo"];
const MOCK_TITLES = [
    "Certified Specialist", 
    "Master Technician", 
    "Reliable Local Expert", 
    "Quick Service Pro", 
    "Experienced Freelancer",
    "Top Rated Professional"
];
// Shades of Slate/Blue/Purple
const IMAGE_COLORS = ["1f2937", "4b5563", "6b7280", "9ca3af", "374151", "111827", "4c51bf", "3f51b5"]; 

// --- NEW CALCULATION ---
const MIN_WORKERS_PER_CATEGORY_AND_DISTRICT = 30;
const TOTAL_WORKER_COUNT = 
    LOCATIONS.length * GENERAL_CATEGORIES.length * MIN_WORKERS_PER_CATEGORY_AND_DISTRICT; // 64 * 6 * 30 = 11,520

const generateMockWorkers = (count) => {
  const workers = [];
  let workerId = 100;
  
  // Outer loop ensures we iterate through every single location
  for (const location of LOCATIONS) {
    // Middle loop ensures we cover every single service category
    for (const category of GENERAL_CATEGORIES) {
      // Inner loop ensures we generate the minimum required number of workers (30)
      for (let j = 0; j < MIN_WORKERS_PER_CATEGORY_AND_DISTRICT; j++) {
        
        // Use a unique ID counter
        workerId++;
        
        // Variables for randomized data, using j and workerId for variety
        const nameIndex = workerId % NAMES.length;
        const titleIndex = workerId % MOCK_TITLES.length;
        const colorIndex = workerId % IMAGE_COLORS.length;
        
        const basePrice = 40 + (workerId % 30); 
        // Ensure rating is between 4.0 and 4.9
        const rating = parseFloat((4.0 + Math.random() * 0.9).toFixed(1)); 
        const reviews = Math.floor(Math.random() * 500) + 50;

        workers.push({
          id: String(workerId), 
          name: `${NAMES[nameIndex]} ${workerId}`,
          title: MOCK_TITLES[titleIndex],
          description: `Providing ${category} services with a focus on quality and reliability in the ${location} area. Available for emergency calls.`,
          rating: rating,
          reviews: reviews,
          price: basePrice + Math.floor(Math.random() * 20),
          location: location, // Fixed to the current location in the loop
          category: category, // Fixed to the current category in the loop
          imageUrl: `https://placehold.co/600x400/${IMAGE_COLORS[colorIndex]}/ffffff?text=${category.charAt(0)}_${location.charAt(0)}`,
          profilePic: `https://placehold.co/100x100/${IMAGE_COLORS[(colorIndex + 3) % IMAGE_COLORS.length]}/ffffff?text=${NAMES[nameIndex].charAt(0)}`,
        });
      }
    }
  }

  // The final count should match the calculated total
  return workers;
};

// **The worker count is now 11,520**
export const MOCK_WORKERS_DATA = generateMockWorkers(TOTAL_WORKER_COUNT); 

/**
 * Retrieves all mock worker data (now 11,520 items).
 */
export function getAllWorkers() {
    return MOCK_WORKERS_DATA;
}

/**
 * Finds a worker by ID (for profile/hire pages, if created later).
 */
export function getWorkerById(id) {
    return MOCK_WORKERS_DATA.find(worker => String(worker.id) === String(id));
}