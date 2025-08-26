import { Button } from "flowbite-react";

const products = [
  {
    id: 1,
    name: "PlayStation 5 Console",
    image: "ps5.png",
    price: "$499.99",
    badge: "Gaming",
    category: "Gaming/Console",
    gridClass: "lg:col-span-2 lg:row-span-2",
  },
  {
    id: 2,
    name: "Men's Winter Collection",
    image: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
    price: "$89.99",
    badge: "New Season",
    category: "Clothing/Men",
    gridClass: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: 3,
    name: "Smart LED TV 55\"",
    image: "https://images.pexels.com/photos/6976094/pexels-photo-6976094.jpeg",
    price: "$699.99",
    badge: "Electronics",
    category: "Electronics",
    gridClass: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: 4,
    name: "Modern Sofa Set",
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
    price: "$1,299.99",
    badge: "Furniture",
    category: "Home/Furniture",
    gridClass: "lg:col-span-2 lg:row-span-1",
  },
  {
    id: 5,
    name: "Women's Sports Collection",
    image: "https://images.pexels.com/photos/2294354/pexels-photo-2294354.jpeg",
    price: "$79.99",
    badge: "Sports",
    category: "Sports/Wearables",
    gridClass: "lg:col-span-1 lg:row-span-2",
  },
  {
    id: 6,
    name: "Gaming Headset Pro",
    image: "https://images.pexels.com/photos/205926/pexels-photo-205926.jpeg",
    price: "$129.99",
    badge: "Gaming",
    category: "Gaming/Headsets",
    gridClass: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: 7,
    name: "Smart Watch Series X",
    image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
    price: "$299.99",
    badge: "Wearables",
    category: "Electronics/Wearables",
    gridClass: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: 8,
    name: "Kids Fashion Set",
    image: "https://images.pexels.com/photos/5559985/pexels-photo-5559985.jpeg",
    price: "$49.99",
    badge: "Kids",
    category: "Clothing/Kids",
    gridClass: "lg:col-span-1 lg:row-span-1",
  },
  {
    id: 9,
    name: "Premium Kitchen Set",
    image: "https://images.pexels.com/photos/6996091/pexels-photo-6996091.jpeg",
    price: "$899.99",
    badge: "Kitchen",
    category: "Home/Kitchen",
    gridClass: "lg:col-span-3 lg:row-span-1",
  }
];

export default function FeaturedContent() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 auto-rows-[250px]">
        {products.map((product) => (
          <div
            key={product.id}
            className={`relative group overflow-hidden ${product.gridClass}`}
          >
            <div className="absolute inset-0 bg-black/40 transition-opacity opacity-0 group-hover:opacity-100 z-10" />
            
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {/* Badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-[#4B0082] text-white px-3 py-1.5 text-sm rounded-full font-medium tracking-wide shadow-lg">
                {product.badge}
              </span>
            </div>

            {/* Product Info - Shows on Hover */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
              <div className="bg-white/95 p-4 rounded-lg shadow-xl backdrop-blur-sm">
                <h3 className="text-[#4B0082] font-bold text-lg mb-1">
                  {product.name}
                </h3>
                <p className="text-[#4B0082] font-semibold mb-3">
                  {product.price}
                </p>
                <button 
                  className="w-full bg-[#4B0082] hover:bg-[#380062] text-white py-2.5 px-4 rounded-lg
                    font-medium tracking-wide transition-all duration-300 ease-in-out
                    transform hover:translate-y-[-2px] hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-[#4B0082] focus:ring-opacity-50
                    active:transform active:translate-y-[1px]
                    flex items-center justify-center gap-2 group/btn"
                >
                  <span>Shop Now</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 transform transition-transform group-hover/btn:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}