// app/data/technicians.js

const CATEGORY_KEYS = [
  "air-conditioner-repair",
  "microwave-oven-fix",
  "refrigerator-service",
  "smart-appliance-setup",
  "washing-machine-repair",
];

const LOCATIONS = ["Dhaka North", "Dhaka South", "Chattogram", "Khulna", "Sylhet", "Rajshahi", "Barisal", "Rangpur"];
const NAMES = ["Ruhan", "Zinnia", "Jamil", "Mita", "Kamal", "Shapla", "Raju", "Nabila", "Omar", "Laila", "Rafiq", "Nazmul", "Sonia", "Fahim"];
const IMAGE_COLORS = ["1e40af", "3b82f6", "2563eb", "60a5fa", "15803d", "ca8a04", "dc2626", "9333ea"];

const generateMockTechnicians = (count) => {
  const technicians = [];
  for (let i = 1; i <= count; i++) {
    const nameIndex = i % NAMES.length;
    const locationIndex = i % LOCATIONS.length;
    const colorIndex = i % IMAGE_COLORS.length;

    const numCategories = Math.floor(Math.random() * 3) + 1;
    const categories = Array.from({ length: numCategories }, () =>
      CATEGORY_KEYS[Math.floor(Math.random() * CATEGORY_KEYS.length)]
    ).filter((v, i, s) => s.indexOf(v) === i);

    const titleMap = {
      "air-conditioner-repair": "HVAC & AC System Specialist",
      "microwave-oven-fix": "Small Appliance & Microwave Expert",
      "refrigerator-service": "Refrigeration & Freezer Master",
      "smart-appliance-setup": "Smart Home IoT Integration Tech",
      "washing-machine-repair": "Washer/Dryer Motor & Drum Repair",
    };

    technicians.push({
      id: 300 + i,
      name: `${NAMES[nameIndex]} Hossain ${i}`,
      title: titleMap[categories[0]] || "Appliance Repair Expert",
      description: `Expert in reliable repair services for ${categories.join(", ").replace(/-/g, " ")}.`,
      rating: (4.0 + Math.random()).toFixed(1) * 1,
      reviews: Math.floor(Math.random() * 200) + 50,
      price: Math.floor(Math.random() * (75 - 45 + 1)) + 45,
      location: LOCATIONS[locationIndex],
      categories,
      imageUrl: `https://placehold.co/100x100/${IMAGE_COLORS[colorIndex]}/ffffff?text=${NAMES[nameIndex].charAt(0)}${i}`,
    });
  }
  return technicians;
};

export const MOCK_TECHNICIANS = generateMockTechnicians(50);
