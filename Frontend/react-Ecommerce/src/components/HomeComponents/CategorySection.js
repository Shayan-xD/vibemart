import { useNavigate } from "react-router-dom";

const categories = [
  {
    id: 1,
    name: "Clothing",
    image: "https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg",
    subCategories: ["Men", "Women", "Kids", "Shoes", "Accessories"],
    color: "from-purple-700",
  },
  {
    id: 2,
    name: "Gaming",
    image: "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg",
    subCategories: ["Console", "Games", "Accessories","Controllers","Headsets"],
    color: "from-blue-600",
  },
  {
    id: 3,
    name: "Home",
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
    subCategories: ["Furniture", "Kitchen", "Decor","Bedding","Appliances"],
    color: "from-amber-600",
  },
  {
    id: 4,
    name: "Electronics",
    image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg",
    subCategories: ["Mobiles", "Laptops", "Cameras", "Tablets", "Wearables"],
    color: "from-emerald-600",
  },
  {
    id: 5,
    name: "Sports",
    image: "https://images.pexels.com/photos/4753928/pexels-photo-4753928.jpeg",
    subCategories: ["Equipment", "Wearables", "Outdoor", "Footwear", "Accessories"],
    color: "from-red-600",
  }
];

export default function CategorySection() {

  const navigate = useNavigate();

  // Navigation helper for categories
  const goToProducts = (category, subCategory = null) => {
    console.log("category")
    navigate('/products', { state: { category, subCategory } });
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-5xl md:text-6xl font-bold mb-16 text-[#4B0082] text-center tracking-tight">
        Shop by Category
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {categories.map((category) => (
          <div 
            key={category.id}
            className="group cursor-pointer relative overflow-hidden rounded-xl 
              aspect-[4/5] transition-transform duration-300 hover:scale-[1.02]"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gradient Overlay */}
            <div 
              className={`absolute inset-0 bg-gradient-to-b ${category.color} 
                via-transparent to-black/90 opacity-80`}
            />

            {/* Hover Effect Overlay - moved before content and made pointer-events-none */}
            <div className="absolute inset-0 bg-black/20 opacity-0 
              group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              {/* Category Name */}
              <h3 className="text-white text-2xl font-bold drop-shadow-lg">
                {category.name}
              </h3>

              {/* Subcategories - Now always visible */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {category.subCategories.map((sub, idx) => (
                    <span 
                      key={idx}
                      className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 
                        rounded-full text-sm font-medium hover:bg-white/30 
                        transition-all duration-300 hover:scale-105
                        hover:shadow-lg shadow-black/20"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
                {/* View All button with higher z-index */}
                <button 
                  onClick={() => goToProducts(category.name)}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm 
                    text-white py-2 px-4 rounded-full text-sm font-medium
                    transition-all duration-300 hover:scale-105
                    hover:shadow-lg shadow-black/20
                    group-hover:bg-white group-hover:text-[#4B0082]
                    relative z-20"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}