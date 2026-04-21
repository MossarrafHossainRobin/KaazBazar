"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, XCircle } from "lucide-react";

// Service data with Bengali and English names - No emojis
const services = [
  { 
    id: "electrician", 
    nameEn: "Electrician", 
    nameBn: "ইলেকট্রিশিয়ান",
    keywords: ["ইলেকট্রিক", "electric", "wire", "তারের কাজ", "ইলেকট্রিক তারের কাজ", "electrical", "wiring", "light", "fan", "সুইচ", "সকেট"],
    descriptionEn: "Electrical wiring, fan & light installation, switch & socket repair",
    descriptionBn: "ইলেকট্রিক তারের কাজ, ফ্যান ও লাইট বসানো, সুইচ ও সকেট মেরামত",
    popular: true,
    url: "/services/electrician"
  },
  { 
    id: "plumber", 
    nameEn: "Plumber", 
    nameBn: "প্লাম্বার",
    keywords: ["পাইপ", "pipe", "লিক", "পাইপ লিক ঠিক করা", "পাইপ লিকেজ", "plumbing", "water", "drain", "bathroom", "টয়লেট", "স্যানিটারি"],
    descriptionEn: "Pipe repair, bathroom fitting, water heater service, drain cleaning",
    descriptionBn: "পাইপ মেরামত, বাথরুম ফিটিং, ওয়াটার হিটার সার্ভিস, ড্রেন ক্লিনিং",
    popular: true,
    url: "/services/plumber"
  },
  { 
    id: "carpenter", 
    nameEn: "Carpenter", 
    nameBn: "কাঠমিস্ত্রি",
    keywords: ["কাঠ", "wood", "ফার্নিচার", "ফার্নিচার মেরামত", "furniture", "carpentry", "cabinet", "door", "window", "আসবাবপত্র"],
    descriptionEn: "Furniture repair, custom woodwork, door & window fitting",
    descriptionBn: "ফার্নিচার মেরামত, কাঠের কাজ, দরজা ও জানালা ফিটিং",
    popular: true,
    url: "/services/carpenter"
  },
  { 
    id: "painter", 
    nameEn: "Painter", 
    nameBn: "রংমিস্ত্রি",
    keywords: ["রং", "paint", "painting", "ঘর রং", "পেইন্টিং", "wall", "color", "texture", "ওয়ালপেপার"],
    descriptionEn: "Interior & exterior painting, wall texture, waterproofing",
    descriptionBn: "ভিতর ও বাইরের রং, ওয়াল টেক্সচার, ওয়াটারপ্রুফিং",
    popular: true,
    url: "/services/painter"
  },
  { 
    id: "gardener", 
    nameEn: "Gardener", 
    nameBn: "মালী",
    keywords: ["মালী", "gardener", "বাগান", "garden", "গাছ", "plant", "লন", "lawn", "কাটিং", "ফুল", "গাছের যত্ন"],
    descriptionEn: "Lawn mowing, tree & shrub care, planting & landscaping, garden cleanup",
    descriptionBn: "লন মাওয়া, গাছ ও ঝোপের যত্ন, গাছ লাগানো ও ল্যান্ডস্কেপিং, বাগান পরিষ্কার",
    popular: true,
    url: "/services/gardener"
  },
  { 
    id: "ac-repair", 
    nameEn: "AC & Appliance Repair", 
    nameBn: "এসি ও ইলেকট্রনিক্স সার্ভিস",
    keywords: ["এসি", "ac", "ফ্রিজ", "ওয়াশিং মেশিন", "appliance", "fridge", "washing machine", "এসি সার্ভিসিং", "রেফ্রিজারেটর", "মাইক্রোওয়েভ"],
    descriptionEn: "AC service, fridge repair, washing machine repair, appliance diagnostics",
    descriptionBn: "এসি সার্ভিস, ফ্রিজ মেরামত, ওয়াশিং মেশিন মেরামত, ইলেকট্রনিক্স ডায়াগনস্টিক",
    popular: true,
    url: "/services/ac-repair"
  },
  { 
    id: "cleaning", 
    nameEn: "Cleaning Service", 
    nameBn: "ক্লিনিং সার্ভিস",
    keywords: ["ক্লিনিং", "cleaning", "পরিষ্কার", "ডিপ ক্লিনিং", "house cleaning", "office cleaning", "সোফা ক্লিনিং", "কার্পেট ক্লিনিং"],
    descriptionEn: "Deep house cleaning, office cleaning, post-construction cleanup",
    descriptionBn: "গভীরভাবে ঘর পরিষ্কার, অফিস ক্লিনিং, নির্মাণ পরবর্তী পরিচ্ছন্নতা",
    popular: true,
    url: "/services/cleaning"
  },
  { 
    id: "home-shifting", 
    nameEn: "Home Shifting", 
    nameBn: "বাসা বদল সার্ভিস",
    keywords: ["বাসা বদল", "home shifting", "মুভিং", "shifting", "moving", "হোম শিফটিং", "পিক অ্যান্ড ড্রপ"],
    descriptionEn: "Home shifting, office shifting, packing & moving services",
    descriptionBn: "বাসা বদল, অফিস শিফটিং, প্যাকিং ও মুভিং সার্ভিস",
    popular: false,
    url: "/services/home-shifting"
  },
  { 
    id: "generator", 
    nameEn: "Generator & IPS Service", 
    nameBn: "জেনারেটর ও আইপিএস সার্ভিস",
    keywords: ["জেনারেটর", "generator", "ips", "জেনারেটর সার্ভিস", "ইপিএস", "পাওয়ার ব্যাকআপ"],
    descriptionEn: "Generator repair, IPS service, power backup solutions",
    descriptionBn: "জেনারেটর মেরামত, আইপিএস সার্ভিস, পাওয়ার ব্যাকআপ সমাধান",
    popular: false,
    url: "/services/generator"
  },
  { 
    id: "cctv", 
    nameEn: "CCTV & Security", 
    nameBn: "সিসিটিভি ও সিকিউরিটি সার্ভিস",
    keywords: ["সিসিটিভি", "cctv", "security", "ক্যামেরা", "সিকিউরিটি", "স্পাই ক্যামেরা", "ডোরবেল"],
    descriptionEn: "CCTV installation, security camera setup, surveillance systems",
    descriptionBn: "সিসিটিভি স্থাপন, সিকিউরিটি ক্যামেরা সেটআপ, নজরদারি ব্যবস্থা",
    popular: false,
    url: "/services/cctv"
  },
  { 
    id: "internet", 
    nameEn: "Internet & WiFi Setup", 
    nameBn: "ইন্টারনেট ও ওয়াইফাই সেটআপ",
    keywords: ["ইন্টারনেট", "wifi", "ওয়াইফাই", "নেটওয়ার্ক", "network", "broadband", "রাউটার", "নেটওয়ার্ক কেবল"],
    descriptionEn: "WiFi installation, network setup, broadband connection",
    descriptionBn: "ওয়াইফাই স্থাপন, নেটওয়ার্ক সেটআপ, ব্রডব্যান্ড সংযোগ",
    popular: false,
    url: "/services/internet"
  },
  { 
    id: "tailor", 
    nameEn: "Tailor", 
    nameBn: "দর্জি",
    keywords: ["দর্জি", "tailor", "কাপড়", "সেলাই", "ড্রেস", "প্যান্ট", "শার্ট", "থ্রি পিস"],
    descriptionEn: "Clothes alteration, custom tailoring, dress making",
    descriptionBn: "পোশাক পরিবর্তন, কাস্টম টেইলারিং, ড্রেস মেকিং",
    popular: false,
    url: "/services/tailor"
  },
  { 
    id: "driver", 
    nameEn: "Driver Service", 
    nameBn: "ড্রাইভার সার্ভিস",
    keywords: ["ড্রাইভার", "driver", "গাড়ি", "car", "প্রফেশনাল ড্রাইভার", "ভ্যান ড্রাইভার"],
    descriptionEn: "Professional driver service, car rental with driver",
    descriptionBn: "পেশাদার ড্রাইভার সার্ভিস, ড্রাইভার সহ গাড়ি ভাড়া",
    popular: false,
    url: "/services/driver"
  },
  { 
    id: "tutor", 
    nameEn: "Tutor", 
    nameBn: "প্রাইভেট টিউটর",
    keywords: ["টিউটর", "tutor", "প্রাইভেট", "teacher", "শিক্ষক", "হোম টিউটর", "মাস্টার"],
    descriptionEn: "Home tutoring, subject expert, exam preparation",
    descriptionBn: "হোম টিউটরিং, বিষয় বিশেষজ্ঞ, পরীক্ষার প্রস্তুতি",
    popular: false,
    url: "/services/tutor"
  },
  { 
    id: "beauty", 
    nameEn: "Beauty & Salon", 
    nameBn: "বিউটি ও সেলুন",
    keywords: ["বিউটি", "beauty", "সেলুন", "salon", "পার্লার", "মেকওভার", "হেয়ার", "স্কিন কেয়ার"],
    descriptionEn: "Beauty services, salon at home, makeup & hair",
    descriptionBn: "বিউটি সার্ভিস, সেলুন এট হোম, মেকআপ ও হেয়ার",
    popular: false,
    url: "/services/beauty"
  },
  { 
    id: "pest-control", 
    nameEn: "Pest Control", 
    nameBn: "পেস্ট কন্ট্রোল",
    keywords: ["পেস্ট", "pest", "কীট", "insect", "termite", "উইপোকা", "তেলাপোকা", "মশা"],
    descriptionEn: "Pest control, termite treatment, mosquito control",
    descriptionBn: "পেস্ট কন্ট্রোল, উইপোকা নিয়ন্ত্রণ, মশা নিয়ন্ত্রণ",
    popular: false,
    url: "/services/pest-control"
  },
  { 
    id: "others", 
    nameEn: "Others", 
    nameBn: "অন্যান্য",
    keywords: ["অন্যান্য", "others", "other", "সেবা", "জেনারেল সার্ভিস"],
    descriptionEn: "Other professional services",
    descriptionBn: "অন্যান্য পেশাদার সেবা",
    popular: false,
    url: "/services/others"
  }
];

// Popular searches for quick access
const popularSearches = [
  { nameEn: "Electrician", nameBn: "ইলেকট্রিশিয়ান", url: "/services/electrician" },
  { nameEn: "Plumber", nameBn: "প্লাম্বার", url: "/services/plumber" },
  { nameEn: "Carpenter", nameBn: "কাঠমিস্ত্রি", url: "/services/carpenter" },
  { nameEn: "Painter", nameBn: "রংমিস্ত্রি", url: "/services/painter" },
  { nameEn: "Gardener", nameBn: "মালী", url: "/services/gardener" },
  { nameEn: "AC Repair", nameBn: "এসি সার্ভিস", url: "/services/ac-repair" },
  { nameEn: "Cleaning", nameBn: "ক্লিনিং", url: "/services/cleaning" }
];

export default function SearchBar({ searchQuery, setSearchQuery, onSearch, isScrolled, language }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  // Save search to recent
  const saveToRecent = (searchText) => {
    if (!searchText.trim()) return;
    const updated = [searchText, ...recentSearches.filter(s => s !== searchText)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_searches", JSON.stringify(updated));
  };

  // Normalize text for comparison
  const normalizeText = (text) => {
    return text?.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  // Check if text matches service
  const matchesService = (service, query) => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return false;
    
    const nameEn = normalizeText(service.nameEn);
    const nameBn = normalizeText(service.nameBn);
    const descriptionEn = normalizeText(service.descriptionEn);
    const descriptionBn = normalizeText(service.descriptionBn);
    
    // Exact matches
    if (nameEn === normalizedQuery || nameBn === normalizedQuery) return true;
    if (descriptionEn === normalizedQuery || descriptionBn === normalizedQuery) return true;
    
    // Partial matches
    if (nameEn.includes(normalizedQuery) || nameBn.includes(normalizedQuery)) return true;
    if (descriptionEn.includes(normalizedQuery) || descriptionBn.includes(normalizedQuery)) return true;
    
    // Keyword matches
    for (const keyword of service.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (normalizedKeyword.includes(normalizedQuery) || normalizedQuery.includes(normalizedKeyword)) {
        return true;
      }
    }
    
    return false;
  };

  // Get search suggestions
  const getSuggestions = (query) => {
    if (!query.trim()) return [];
    
    const normalizedQuery = normalizeText(query);
    const matchedServices = services.filter(service => matchesService(service, normalizedQuery));
    
    // Calculate relevance score
    const scoredServices = matchedServices.map(service => {
      let score = 0;
      const nameEn = normalizeText(service.nameEn);
      const nameBn = normalizeText(service.nameBn);
      const normalizedQueryLower = normalizedQuery;
      
      if (nameEn === normalizedQueryLower) score = 100;
      else if (nameBn === normalizedQueryLower) score = 100;
      else if (nameEn.startsWith(normalizedQueryLower)) score = 85;
      else if (nameBn.startsWith(normalizedQueryLower)) score = 85;
      else if (nameEn.includes(normalizedQueryLower)) score = 70;
      else if (nameBn.includes(normalizedQueryLower)) score = 70;
      else if (service.descriptionEn.toLowerCase().includes(normalizedQueryLower)) score = 50;
      else if (service.descriptionBn.includes(normalizedQueryLower)) score = 50;
      else score = 30;
      
      return { ...service, score };
    });
    
    scoredServices.sort((a, b) => b.score - a.score);
    return scoredServices.slice(0, 8);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      const suggestionsList = getSuggestions(value);
      setSuggestions(suggestionsList);
      setShowSuggestions(suggestionsList.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (service) => {
    const displayName = language === 'bengali' ? service.nameBn : service.nameEn;
    setSearchQuery(displayName);
    setShowSuggestions(false);
    saveToRecent(displayName);
    router.push(service.url);
    if (onSearch) onSearch(displayName);
  };

  const handlePopularSearch = (service) => {
    const displayName = language === 'bengali' ? service.nameBn : service.nameEn;
    setSearchQuery(displayName);
    setShowSuggestions(false);
    saveToRecent(displayName);
    router.push(service.url);
    if (onSearch) onSearch(displayName);
  };

  const handleRecentSearch = (searchText) => {
    setSearchQuery(searchText);
    setShowSuggestions(false);
    const matched = services.find(s => 
      normalizeText(s.nameEn) === normalizeText(searchText) || 
      normalizeText(s.nameBn) === normalizeText(searchText)
    );
    if (matched) {
      router.push(matched.url);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      saveToRecent(searchQuery);
      const matchedService = services.find(service => matchesService(service, searchQuery));
      if (matchedService) {
        router.push(matchedService.url);
      }
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(true);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recent_searches");
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic sizing based on scroll
  const searchBarHeight = isScrolled ? "py-2.5" : "py-3.5";
  const searchIconSize = isScrolled ? "w-5 h-5" : "w-5 h-5";
  const inputPadding = isScrolled ? "pl-11 pr-24 py-2.5" : "pl-11 pr-24 py-3.5";

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          className={`w-full ${inputPadding} border-2 border-gray-200 rounded-full outline-none text-black placeholder-gray-400 text-base transition-all duration-300 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100`}
          placeholder={language === 'bengali' ? "আপনি কি ধরনের সেবা খুঁজছেন?" : "What service are you looking for?"}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (!searchQuery.trim()) {
              setShowSuggestions(true);
            } else {
              const suggestionsList = getSuggestions(searchQuery);
              setSuggestions(suggestionsList);
              setShowSuggestions(suggestionsList.length > 0);
            }
          }}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
        />
        
        {/* Search Icon Button - Fixed positioning */}
        <button
          onClick={handleSearch}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
          type="button"
        >
          <Search className="w-5 h-5" />
        </button>
        
        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
            type="button"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-20"
          >
            {/* Recent Searches Section */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2 px-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {language === 'bengali' ? "সাম্প্রতিক সার্চ" : "Recent Searches"}
                  </span>
                  <button 
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    {language === 'bengali' ? "সব মুছুন" : "Clear all"}
                  </button>
                </div>
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentSearch(item)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 text-sm"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* Popular Searches Section */}
            {!searchQuery && (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {language === 'bengali' ? "জনপ্রিয় সার্ভিস" : "Popular Services"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((service, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePopularSearch(service)}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {language === 'bengali' ? service.nameBn : service.nameEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {searchQuery && suggestions.length > 0 && (
              <div className="p-2">
                <div className="px-2 py-1 text-xs text-gray-400">
                  {language === 'bengali' ? "সাজেশন" : "Suggestions"}
                </div>
                {suggestions.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleSuggestionClick(service)}
                    className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {language === 'bengali' ? service.nameBn : service.nameEn}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {language === 'bengali' 
                            ? (service.descriptionBn.length > 60 ? service.descriptionBn.substring(0, 60) + "..." : service.descriptionBn)
                            : (service.descriptionEn.length > 60 ? service.descriptionEn.substring(0, 60) + "..." : service.descriptionEn)
                          }
                        </p>
                      </div>
                      {service.popular && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                          {language === 'bengali' ? "জনপ্রিয়" : "Popular"}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery && suggestions.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500">
                  {language === 'bengali' 
                    ? `"${searchQuery}" এর জন্য কোনো সেবা পাওয়া যায়নি` 
                    : `No services found for "${searchQuery}"`}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {language === 'bengali' 
                    ? "অনুগ্রহ করে ভিন্ন কিওয়ার্ড দিয়ে সার্চ করুন" 
                    : "Please try a different keyword"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}