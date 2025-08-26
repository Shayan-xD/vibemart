import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../features/productSlice"; // Adjust the import path

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { category, subCategory } = location.state || {};
  
  // Get products and status from Redux store
  const products = useSelector(store => store.products?.productList || []);
  const status = useSelector(store => store.products?.status || 'idle');
  const error = useSelector(store => store.products?.error);

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("");
  const productsPerPage = 12;
  const productGridRef = useRef(null);

  // Fetch products when component mounts
  useEffect(() => {
    window.scrollTo(0,0);
    document.title = "VibeMart - Product Catalogue";
    // Only fetch if we haven't loaded products yet or if status is idle
  }, []);

  // Filter products based on category and search
  const filteredProducts = products
    .filter((product) => {
      if (category && subCategory) {
        return product.category === category && product.subCategory === subCategory;
      } else if (category) {
        return product.category === category;
      } else {
        return true;
      }
    })
    .filter(product => 
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.category.toLowerCase().includes(filter.toLowerCase())
    );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToProducts = () => {
    productGridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div style={{ paddingTop: "120px" }} className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'failed') {
    return (
      <div style={{ paddingTop: "120px" }} className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error loading products</p>
          <p className="mt-2">{error || 'Please try again later'}</p>
          <button 
            onClick={() => dispatch(fetchProducts())}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "120px" }}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-[#4B0082] to-purple-600 text-white py-16 px-4 sm:px-6 md:px-8 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight drop-shadow-lg">
              Welcome to VibeMart
            </h1>
            <p className="mt-4 text-lg sm:text-2xl max-w-2xl mx-auto opacity-90">
              Discover a curated collection of premium products designed to elevate your lifestyle.
            </p>
            
            {/* Search Input */}
            <div className="mt-6 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToProducts}
              className="mt-6 px-6 py-3 bg-white text-[#4B0082] font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-200"
            >
              Browse Products
            </motion.button>
          </div>
        </motion.div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          {/* Results count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {category && ` in ${category}`}
              {subCategory && ` > ${subCategory}`}
            </p>
          </div>

          <motion.div
            ref={productGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <AnimatePresence>
              {currentProducts.map((product) => (
                <motion.div
                  key={product._id || product.id} // Use _id or id
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4 }}
                  className="relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {product.category}
                  </div>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-56 object-cover" 
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                    }}
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{product.subCategory}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Seller: {product.sellerEmail || "seller@example.com"}
                    </p>
                    <p className="text-xl font-bold text-[#4B0082] mt-2">${product.price}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/product/${product._id || product.id}`)} // Use _id or id
                      className="mt-4 w-full px-4 py-2 bg-[#4B0082] text-white rounded-lg hover:bg-[#3C0066] transition-colors duration-200"
                    >
                      View Product
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* No products found */}
          {filteredProducts.length === 0 && status === 'succeeded' && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found.</p>
              {filter && (
                <button 
                  onClick={() => setFilter("")}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-3 flex-wrap">
              <button 
                onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)} 
                disabled={currentPage === 1} 
                className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button 
                  key={i} 
                  onClick={() => handlePageChange(i + 1)} 
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === i + 1 
                      ? "bg-[#4B0082] text-white border-[#4B0082]" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)} 
                disabled={currentPage === totalPages} 
                className="px-4 py-2 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
