// File: app/services/painters/page.js

"use client";
// Removed 'Image' import to prevent the unconfigured host error
import { useState, useMemo, useCallback, useEffect } from "react"; 
import { PaintBucket, Star, Brush, Palette, DollarSign, Search, User, Sparkles, Rainbow, Palette as PaletteIcon, Globe, MapPin } from "lucide-react"; 
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
// import Navbar from "@/components/Navbar"; // Assuming this is not needed for the component output

// --- Configuration & Mock Data Setup ---
const CATEGORIES = ["All", "Interior", "Exterior", "Commercial", "Residential", "Accent Walls", "Artistic Finishes", "Wallpaper Removal", "Eco-Friendly", "Murals", "Restoration"];

// Rainbow color array for dynamic styling
const RAINBOW_COLORS_HEX = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#0ea5e9", // Blue
  "#6366f1", // Indigo
  "#a855f7", // Violet
];

// --- Mock Data (Updated to include 'color' property directly) ---
const MOCK_PAINTERS = [
  {
    id: 201,
    name: "Kamal Hasan",
    title: "Residential Interior & Accent Wall Specialist",
    description: "Expert in flawless indoor painting, color consultation, and creating stunning accent walls. Clean, fast, and guaranteed.",
    rating: 5.0,
    reviews: 120,
    price: 35, 
    location: "Dhaka Central",
    categories: ["Interior", "Accent Walls", "Residential"],
    imageUrl: "https://placehold.co/100x100/ef4444/ffffff?text=KH",
    color: "#ef4444", // Added color property
  },
  {
    id: 202,
    name: "Shapla Begum",
    title: "Exterior House Painting & Weatherproofing",
    description: "Specializing in durable exterior finishes, siding, and deck staining. We protect your home from the elements.",
    rating: 4.7,
    reviews: 180,
    price: 40,
    location: "Chattogram",
    categories: ["Exterior", "Weatherproofing", "Deck Staining"],
    imageUrl: "https://placehold.co/100x100/f97316/ffffff?text=SB",
    color: "#f97316", // Added color property
  },
  {
    id: 203,
    name: "Raju Ahmed",
    title: "Commercial Painting & Large-Scale Projects",
    description: "High-volume commercial projects, office spaces, and industrial coatings. Reliable crew for big jobs.",
    rating: 4.8,
    reviews: 75,
    price: 55,
    location: "Khulna",
    categories: ["Commercial", "Industrial", "Large Projects"],
    imageUrl: "https://placehold.co/100x100/eab308/ffffff?text=RA",
    color: "#eab308", // Added color property
  },
  {
    id: 204,
    name: "Nabila Farin",
    title: "Artistic Finishes & Wallpaper Removal",
    description: "Skilled in Venetian plaster, faux finishes, and meticulous prep work including wallpaper removal. Your vision, perfectly executed.",
    rating: 4.9,
    reviews: 90,
    price: 45,
    location: "Sylhet",
    categories: ["Artistic Finishes", "Wallpaper Removal", "Faux Finish"],
    imageUrl: "https://placehold.co/100x100/22c55e/ffffff?text=NF",
    color: "#22c55e", // Added color property
  },
  {
    id: 205,
    name: "Omar Faruk",
    title: "Eco-Friendly & Non-Toxic Paint Solutions",
    description: "Specializing in sustainable painting practices and low-VOC paints for a healthier home environment.",
    rating: 4.9,
    reviews: 60,
    price: 48,
    location: "Dhaka North",
    categories: ["Eco-Friendly", "Interior", "Residential"],
    imageUrl: "https://placehold.co/100x100/0ea5e9/ffffff?text=OF",
    color: "#0ea5e9", // Added color property
  },
  {
    id: 206,
    name: "Laila Jahan",
    title: "Custom Murals & Decorative Artwork",
    description: "Bringing walls to life with bespoke murals and unique decorative painting techniques. Art for your space.",
    rating: 5.0,
    reviews: 45,
    price: 65,
    location: "Dhaka South",
    categories: ["Artistic Finishes", "Murals", "Custom Design"],
    imageUrl: "https://placehold.co/100x100/6366f1/ffffff?text=LJ",
    color: "#6366f1", // Added color property
  },
  {
    id: 207,
    name: "Rafiq Islam",
    title: "Historic Restoration & Heritage Painting",
    description: "Preserving the past with careful restoration painting for historic homes and buildings. Attention to detail guaranteed.",
    rating: 4.6,
    reviews: 30,
    price: 58,
    location: "Old Dhaka",
    categories: ["Restoration", "Heritage", "Exterior"],
    imageUrl: "https://placehold.co/100x100/a855f7/ffffff?text=RI",
    color: "#a855f7", // Added color property
  },
];


// --- Painter Card Component (Updated Links & Dynamic Color Access) ---
const PainterCard = ({ profile }) => {
    // Fallback to the explicit color property, or extract from URL if missing (for legacy data)
    const cardColor = profile.color || `#${profile.imageUrl.split('/')[4].substring(0, 7)}`;

    return (
        <div className={`bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-all duration-300 border-t-4`} style={{borderColor: cardColor}}>

            <div className="p-6">
            
            {/* Top Section: Profile and Rating */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                <img
                    src={profile.imageUrl}
                    alt={profile.name}
                    className={`w-16 h-16 rounded-full object-cover mr-4 ring-2`} 
                    style={{borderColor: cardColor}}
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/1f2937/ffffff?text=User"; }}
                />
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                    <p className="text-sm text-gray-700 font-semibold" style={{color: cardColor}}>{profile.title}</p>
                </div>
                </div>
                <div className="text-right">
                <div className="flex items-center text-yellow-500 font-bold text-lg">
                    <Star className="w-5 h-5 mr-1 fill-yellow-500" />
                    {profile.rating.toFixed(1)}
                </div>
                <span className="text-xs text-gray-500">({profile.reviews} projects)</span>
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4 text-sm italic border-l-4 border-gray-100 pl-3">
                {profile.description}
            </p>

            {/* Details (Location, Price) */}
            <div className="flex justify-between items-center border-t border-gray-100 pt-4 mb-4">
                <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2" style={{color: cardColor}} /> 
                <span className="text-sm">{profile.location}</span>
                </div>
                <div className="text-2xl font-extrabold flex items-center" style={{color: cardColor}}>
                <DollarSign className="w-5 h-5" />
                {profile.price}<span className="text-base font-medium text-gray-500">/hr</span>
                </div>
            </div>

            {/* Categories/Services Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {profile.categories.map((cat, i) => (
                <span key={i} className={`px-3 py-1 text-xs font-medium rounded-full`} style={{backgroundColor: `${cardColor}20`, color: cardColor}}>
                    {cat}
                </span>
                ))}
            </div>

            {/* Action Buttons (CORRECTED LINKS) */}
            <div className="flex gap-3">
                <a 
                href={`/painters/hire/${profile.id}`} // Corrected path
                className="flex-1 text-center py-3 text-white font-bold rounded-lg hover:brightness-110 transition-colors shadow-md" style={{backgroundColor: cardColor}}
                >
                Book Now (Hire)
                </a>
                <a 
                href={`/painters/profile/${profile.id}`} // Corrected path
                className="flex-1 text-center py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                View Portfolio
                </a>
            </div>
            </div>
        </div>
    );
};

// --- Main Directory Page Component ---
export default function PaintersPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeColorVar, setActiveColorVar] = useState(RAINBOW_COLORS_HEX[2]); 

  // Fixes hydration error by setting random value on the client
  useEffect(() => {
    const randomColor = RAINBOW_COLORS_HEX[Math.floor(Math.random() * RAINBOW_COLORS_HEX.length)];
    setActiveColorVar(randomColor);
  }, []); 

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchText(e.target.value);
  }, []);

  // Filtering logic
  const filteredPainters = useMemo(() => {
    let list = MOCK_PAINTERS;
    if (selectedCategory !== "All") {
      list = list.filter(p => p.categories.includes(selectedCategory));
    }
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(lowerCaseSearch) ||
        p.title.toLowerCase().includes(lowerCaseSearch) ||
        p.description.toLowerCase().includes(lowerCaseSearch)
      );
    }
    return list;
  }, [searchText, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-purple-50 font-sans">
      
  <Navbar />
      <header className="bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 text-white py-12 text-center shadow-lg">
        <h1 className="text-4xl font-extrabold mb-2 flex items-center justify-center">
          <Rainbow className="w-10 h-10 mr-3 animate-pulse" />
          Rainbow Brush Painters 
          <Sparkles className="w-8 h-8 ml-3 text-yellow-300 animate-bounce" />
        </h1>
        <p className="text-lg text-white text-opacity-90">
          Bringing a spectrum of color and creativity to your spaces.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Search and Filtering Controls - Dynamic Rainbow Border */}
        <div className="bg-white p-6 rounded-2xl shadow-2xl mb-10 sticky top-0 z-10 border-b-4 border-l-4 border-r-4 border-t-4" style={{borderImage: `linear-gradient(to right, ${RAINBOW_COLORS_HEX.join(', ')}) 1`}}>
          
          {/* Search Input */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by painter name, service, or specialty..."
              value={searchText}
              onChange={handleSearchChange}
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 text-lg shadow-sm"
              style={{
                borderColor: selectedCategory === "All" ? activeColorVar : "currentColor",
                '--active-category-color': activeColorVar 
              }}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>

          {/* Category Filters - Rainbow Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            <PaletteIcon className="w-5 h-5 text-gray-500 self-center mr-2 hidden sm:inline" />
            {CATEGORIES.map((category, index) => {
              const color = RAINBOW_COLORS_HEX[index % RAINBOW_COLORS_HEX.length];
              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 shadow-md ${
                    selectedCategory === category
                      ? "text-white scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category ? color : undefined,
                    border: selectedCategory === category ? `2px solid ${color}` : undefined,
                    color: selectedCategory === category ? 'white' : 'currentColor'
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Painter Listings */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Globe className="w-8 h-8 mr-3 text-red-500" />
            {filteredPainters.length} Vibrant Painters Ready
        </h2>

        {filteredPainters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPainters.map((profile) => (
              <PainterCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <Brush className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
            <p className="text-2xl font-semibold text-gray-800 mb-2">No Painters Found</p>
            <p className="text-gray-600">Unleash your creativity! Try adjusting your search query or selecting a different category.</p>
            <button 
                onClick={() => { setSearchText(""); setSelectedCategory("All"); }}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-purple-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-purple-600 transition-all"
            >
                Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer CTA - Rainbow Gradient */}
      <Footer />
    </div>
  );
}