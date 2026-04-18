const categories = [
  { id: "all", name: "All", icon: "📋" },
  { id: "Electrician", name: "Electrician", icon: "⚡" },
  { id: "Plumber", name: "Plumber", icon: "🔧" },
  { id: "Carpenter", name: "Carpenter", icon: "🪚" },
  { id: "Gardener", name: "Gardener", icon: "🌱" },
  { id: "Others", name: "Others", icon: "📦" }
];

export default function CategoryFilters({ selectedCategory, onCategoryChange }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Popular Services</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedCategory === category.id
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="mr-1">{category.icon}</span> {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}