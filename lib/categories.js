export const categories = [
  { id: "all", name: "All", icon: "📋", slug: "all" },
  { id: "electrician", name: "Electrician", icon: "⚡", slug: "electrician" },
  { id: "plumber", name: "Plumber", icon: "🔧", slug: "plumber" },
  { id: "carpenter", name: "Carpenter", icon: "🪚", slug: "carpenter" },
  { id: "gardener", name: "Gardener", icon: "🌱", slug: "gardener" },
  { id: "others", name: "Others", icon: "📦", slug: "others" }
];

export const getCategoryBySlug = (slug) => {
  return categories.find(cat => cat.slug === slug) || categories[0];
};