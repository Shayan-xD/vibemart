import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
import { addItemToCartWithNotification, fetchCartByUserEmail } from '../../features/cartSlice';
import { addReview, updateReview, deleteReview, likeReview, markHelpful, fetchReviews } from '../../features/reviewSlice';
import { fetchProducts, reduceProductQuantity } from '../../features/productSlice.js';
import Toast from '../Toast.js';

// Animation variants
const addToCartAnimation = {
  initial: { scale: 1, backgroundColor: '#4B0082' },
  hover: { 
    scale: 1.05, 
    backgroundColor: '#3B0062',
    boxShadow: '0 8px 25px rgba(75, 0, 130, 0.3)',
    transition: { duration: 0.3 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  },
  success: {
    scale: [1, 1.1, 1],
    backgroundColor: ['#4B0082', '#22c55e', '#4B0082'],
    transition: { duration: 0.8, ease: 'easeInOut' }
  }
};

const imageAnimation = {
  initial: { opacity: 0, scale: 0.8, y: -50 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

const thumbnailAnimation = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.15, 
    rotate: 2,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.95 }
};

const successBadgeAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: [0, 1, 1],
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

export default function ProductDetailPage() {
const { id } = useParams();
  const dispatch = useDispatch();
  const productRef = useRef(null);

  // Add this helper function here
  const normalizeProductId = (id) => {
    if (typeof id === 'string') return id;
    if (typeof id === 'number') return id.toString();
    return String(id);
  };

  // Use it to normalize the ID from URL params
  const normalizedId = normalizeProductId(id);
  
  // Get ALL products from state here, at the component level
  const allProducts = useSelector(state => state.products?.productList || []);
  
  // Then use normalizedId instead of id throughout the component
  const product = allProducts.find(p => p._id === normalizedId);
  
  const isAuthenticated = useSelector(state => state.users?.isAuthenticated);
  const logInEmail = useSelector(state => state.users?.logInEmail);
  const logInName = useSelector(state => state.users?.logInName);
  const userImage = useSelector(state =>
    state.users?.users?.find(u => u.email === logInEmail)?.image || ""
  );
  const productReviews = useSelector(state =>
    state.reviews?.reviews?.map(review => ({
      ...review,
      likedBy: review.likedBy || [],
      markedHelpfulBy: review.markedHelpfulBy || []
    })).filter(r => r.productId === parseInt(id)) || []
  );
  const reviewStatus = useSelector(state => state.reviews?.status);
  const reviewError = useSelector(state => state.reviews?.error);
  const currentCart = useSelector(state =>
    state.cart?.cartItemList?.find(cart => cart.userEmail === logInEmail)
  );

  // Local state
  const [mainImage, setMainImage] = useState('');
  const [newReview, setNewReview] = useState({ title: "", content: "", rating: 5 });
  const [editReview, setEditReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `VibeMart - Product/Id:${id}`;
    if (product) {
      setMainImage(product.image || '');
    }
    dispatch(fetchReviews(parseInt(id))); // Fetch reviews on mount
  }, [id, product, dispatch]);

  useEffect(() => {
    if (reviewError) {
      setToast({ message: reviewError, type: 'error', isVisible: true });
    }
  }, [reviewError]);

const handleAddToCart = debounce(async () => {
  if (!isAuthenticated) {
    setToast({ message: 'You must be logged in to add to cart', type: 'warning', isVisible: true });
    return;
  }

  setAddToCartLoading(true);

  try {
    console.log('handleAddToCart: Starting', { productId: normalizedId });

    // Get fresh product data
    const freshProduct = allProducts.find(p => p._id === normalizedId);
    if (!freshProduct) {
      setToast({ message: 'Product not found', type: 'error', isVisible: true });
      return;
    }

    if (freshProduct.stockQuantity <= 0) {
      setToast({ message: 'This product is out of stock', type: 'error', isVisible: true });
      return;
    }

    // Dispatch thunk → returns updated cart directly
    const updatedCart = await dispatch(
      addItemToCartWithNotification({
        userEmail: logInEmail,
        productId: Number(normalizedId),
        name: freshProduct.name,
        price: freshProduct.price,
        quantity: 1,
        image: freshProduct.image
      })
    );

    // Find item in updated cart
    const updatedItem = updatedCart.cartItems.find(
      item => Number(item.productId) === Number(normalizedId)
    );

    if (updatedItem) {
      setShowSuccessBadge(true);
      setToast({ message: '🎉 Added to cart successfully!', type: 'success', isVisible: true });
    } else {
      setToast({ message: 'Failed to update cart', type: 'error', isVisible: true });
    }

  } catch (error) {
    console.error('handleAddToCart: Error', error.message);
    setToast({ 
      message: error.message || 'Failed to add to cart', 
      type: 'error', 
      isVisible: true 
    });
  } finally {
    setAddToCartLoading(false);
    setTimeout(() => setShowSuccessBadge(false), 2000);
  }
}, 300);


  const handleReviewSubmit = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setToast({ 
        message: 'You must be logged in to submit a review', 
        type: 'warning', 
        isVisible: true 
      });
      return;
    }

    dispatch(addReview({
      userEmail: logInEmail,
      productId: parseInt(id),
      author: logInName,
      title: newReview.title,
      content: newReview.content,
      rating: newReview.rating,
      verified: false,
      userImage: userImage
    }));

    setNewReview({ title: "", content: "", rating: 5 });
    setShowReviewForm(false);
    setToast({ 
      message: 'Review submitted!', 
      type: 'success', 
      isVisible: true 
    });
  };

  const handleEditReview = (review) => {
    if (!isAuthenticated || review.userEmail !== logInEmail) {
      setToast({ 
        message: 'You can only edit your own reviews', 
        type: 'warning', 
        isVisible: true 
      });
      return;
    }

    setEditReview(review);
    setNewReview({ 
      title: review.title, 
      content: review.content, 
      rating: review.rating 
    });
    setShowReviewForm(true);
  };

  const handleUpdateReview = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !editReview || editReview.userEmail !== logInEmail) {
      setToast({ 
        message: 'You can only update your own reviews', 
        type: 'warning', 
        isVisible: true 
      });
      return;
    }

    dispatch(updateReview({
      id: editReview.id,
      userEmail: logInEmail,
      title: newReview.title,
      content: newReview.content,
      rating: newReview.rating
    }));

    setNewReview({ title: "", content: "", rating: 5 });
    setEditReview(null);
    setShowReviewForm(false);
    setToast({ 
      message: 'Review updated!', 
      type: 'success', 
      isVisible: true 
    });
  };

  const handleDeleteReview = (reviewId) => {
    const review = productReviews.find(r => r.id === reviewId);
    
    if (!isAuthenticated || !review || review.userEmail !== logInEmail) {
      setToast({ 
        message: 'You can only delete your own reviews', 
        type: 'warning', 
        isVisible: true 
      });
      return;
    }

    dispatch(deleteReview({ 
      id: reviewId, 
      userEmail: logInEmail 
    }));

    setToast({ 
      message: 'Review deleted!', 
      type: 'success', 
      isVisible: true 
    });
  };

  const handleReviewLike = (reviewId) => {
    if (!isAuthenticated) {
      setToast({ 
        message: 'You must be logged in to like reviews', 
        type: 'warning', 
        isVisible: true 
      });
      return;
    }
    dispatch(likeReview({ id: reviewId, userEmail: logInEmail }));
  };

  const handleReviewHelpful = (reviewId) => {
    if (!isAuthenticated) {
      setToast({ 
        message: 'You must be logged in to mark reviews as helpful', 
        type: 'warning', 
        isVisible: true 
      });
      return;
    }
    dispatch(markHelpful({ id: reviewId, userEmail: logInEmail }));
  };

  if (!product) {
    return (
      <motion.div
        className="text-center py-20 text-2xl text-gray-600"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Product not found!
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-8 py-20 space-y-24 max-w-7xl pt-40 md:pt-40 sm:pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Product Hero Section */}
      <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-gradient-to-br from-[#4B0082]/5 to-white rounded-3xl p-12 relative overflow-hidden">
        {/* Product Images */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.img
              key={mainImage}
              src={mainImage}
              alt={product.name}
              className="rounded-2xl w-full h-[500px] object-cover bg-white shadow-xl"
              variants={imageAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          </AnimatePresence>
          
          <div className="flex gap-4 mt-8 overflow-x-auto py-4">
            {[product.image, ...(product.lifestyleImages || [])].map((img, idx) => (
              <motion.img
                key={idx}
                src={img}
                alt={`${product.name}-${idx}`}
                className={`w-24 h-24 object-cover rounded-xl cursor-pointer border-3 transition-all duration-300 ${
                  img === mainImage ? "border-[#4B0082] shadow-lg" : "border-gray-200 hover:border-[#4B0082]/50"
                }`}
                variants={thumbnailAnimation}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center space-y-8 relative z-10">
          <div className="space-y-4">
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {product.name}
            </motion.h1>
            
            <motion.p 
              className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#4B0082] to-[#3B0062] bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              ${product.price}
            </motion.p>
          </div>
          
          <motion.p 
            className="text-gray-700 text-xl leading-relaxed"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            ref={productRef}
          >
            {product.description || 'No description available.'}
          </motion.p>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <span className="text-gray-600 text-lg">Stock:</span>
            <span className={`font-semibold text-lg px-3 py-1 rounded-full ${
              product.stockQuantity > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stockQuantity > 0 ? `${product.stockQuantity} available` : "Out of Stock"}
            </span>
          </motion.div>
          
          <motion.div 
            className="flex gap-6 relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button
              onClick={handleAddToCart}
              disabled={addToCartLoading || product.stockQuantity <= 0}
              className="bg-gradient-to-r from-[#4B0082] to-[#3B0062] text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              variants={addToCartAnimation}
              initial="initial"
              whileHover={!addToCartLoading ? "hover" : {}}
              whileTap={!addToCartLoading ? "tap" : {}}
              animate={addToCartLoading ? "success" : "initial"}
            >
              {addToCartLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                'Add to Cart'
              )}
              
              {addToCartLoading && (
                <motion.div
                  className="absolute inset-0 bg-white opacity-20 rounded-2xl"
                  initial={{ scale: 0, opacity: 0.3 }}
                  animate={{ scale: 4, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.button>

            <AnimatePresence>
              {showSuccessBadge && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                  variants={successBadgeAnimation}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  ✓ Added!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.section>

      {/* Features & Description Section */}
      <motion.section
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 bg-gradient-to-br from-gray-50 to-white p-12 rounded-3xl shadow-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-[#4B0082] to-[#3B0062] bg-clip-text text-transparent">
            Features
          </h2>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <p className="text-gray-700 text-xl leading-relaxed">
              {product.feature || 'No description available.'}
            </p>
          </div>
        </div>
        
        <div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-[#4B0082] to-[#3B0062] bg-clip-text text-transparent">
            Description
          </h2>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <p className="text-gray-700 text-xl leading-relaxed">
              {product.description || 'No description available.'}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Reviews Section */}
      <motion.section 
        className="space-y-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-10 bg-gradient-to-r from-[#4B0082] to-[#3B0062] bg-clip-text text-transparent">
          Customer Reviews
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {reviewStatus === 'loading' ? (
            <div className="col-span-full text-center py-16">
              <div className="w-8 h-8 border-2 border-[#4B0082] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading reviews...</p>
            </div>
          ) : productReviews.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-gray-400">💬</span>
              </div>
              <p className="text-xl text-gray-600">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            productReviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-[#4B0082]/30 transition-all duration-300 hover:shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center mb-5">
                  <img
                    src={review.avatar || "https://via.placeholder.com/64"}
                    alt={review.author}
                    className="w-16 h-16 rounded-full mr-4 border-3 border-[#4B0082]/20 shadow-sm"
                  />
                  <div>
                    <h4 className="font-semibold text-xl text-gray-900">{review.author}</h4>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 text-sm text-[#4B0082] font-medium bg-[#4B0082]/10 px-2 py-1 rounded-full">
                        <span>✓</span> Verified Buyer
                      </span>
                    )}
                  </div>
                </div>
                
                <h5 className="font-bold text-2xl mb-3 text-gray-800">{review.title}</h5>
                <p className="text-gray-700 mb-4 leading-relaxed text-lg">{review.content}</p>
                
                <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{review.date}</span>
                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => handleReviewLike(review.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`transition-colors duration-200 ${
                        (review.likedBy || []).some(email => email === logInEmail)
                          ? 'text-[#4B0082]'
                          : 'text-gray-500 hover:text-[#4B0082]'
                      }`}
                    >
                      👍 {review.likes || 0}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleReviewHelpful(review.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`transition-colors duration-200 ${
                        (review.markedHelpfulBy || []).some(email => email === logInEmail)
                          ? 'text-[#4B0082]'
                          : 'text-gray-500 hover:text-[#4B0082]'
                      }`}
                    >
                      💡 {review.helpful || 0}
                    </motion.button>
                    
                    {review.userEmail === logInEmail && (
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleEditReview(review)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-gray-500 hover:text-blue-500"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteReview(review.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-gray-500 hover:text-red-500"
                        >
                          Delete
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Review Form */}
        <div className="mt-16">
          {!showReviewForm ? (
            <motion.button
              onClick={() => {
                if (!isAuthenticated) {
                  setToast({ 
                    message: 'You must be logged in to write a review', 
                    type: 'warning', 
                    isVisible: true 
                  });
                  return;
                }
                setShowReviewForm(true);
              }}
              className="bg-gradient-to-r from-[#4B0082] to-[#3B0062] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Write a Review
            </motion.button>
          ) : (
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                {editReview ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              
              <form onSubmit={editReview ? handleUpdateReview : handleReviewSubmit}>
                <div className="mb-6">
                  <label htmlFor="rating" className="block text-lg font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`text-3xl ${star <= newReview.rating ? 'text-[#4B0082]' : 'text-gray-300'}`}
                      >
                        {star <= newReview.rating ? '★' : '☆'}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newReview.title}
                    onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4B0082] focus:border-[#4B0082] outline-none transition-all duration-200"
                    placeholder="Summary of your review"
                    required
                  />
                </div>
                
                <div className="mb-8">
                  <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2">
                    Review
                  </label>
                  <textarea
                    id="content"
                    value={newReview.content}
                    onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4B0082] focus:border-[#4B0082] outline-none transition-all duration-200 min-h-[150px]"
                    placeholder="Share your experience with this product"
                    required
                  />
                </div>
                
                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    className="bg-gradient-to-r from-[#4B0082] to-[#3B0062] text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex-1"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {editReview ? 'Update Review' : 'Submit Review'}
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditReview(null);
                      setNewReview({ title: "", content: "", rating: 5 });
                    }}
                    className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex-1"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({...toast, isVisible: false})} 
      />
    </motion.div>
  );
}