//Backend Integrated
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReviews, likeReview, markHelpful } from '../../features/reviewSlice';

const filterOptions = ["All Reviews", "Verified Only", "Top Rated", "Most Recent", "Most Helpful"];

export default function ReviewSection() {
  const dispatch = useDispatch();
  const reviews = useSelector(state => state.reviews?.reviews || []);
  const status = useSelector(state => state.reviews?.status || 'idle');
  const error = useSelector(state => state.reviews?.error || null);
  const isAuthenticated = useSelector(state => state.users?.isAuthenticated);
  const logInEmail = useSelector(state => state.users?.logInEmail);

  const [activeFilter, setActiveFilter] = useState("All Reviews");
  const [hoveredReview, setHoveredReview] = useState(null);
  const [localReviews, setLocalReviews] = useState(reviews);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', isVisible: false });

  // Fetch reviews on mount
  useEffect(() => {
    console.log('ReviewSection: Dispatching fetchReviews');
    dispatch(fetchReviews());
  }, [dispatch]);

  // Sync localReviews with Redux reviews
  useEffect(() => {
    console.log('ReviewSection: Syncing localReviews with Redux reviews', reviews);
    setLocalReviews(reviews);
  }, [reviews]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('ReviewSection: Error from Redux', error);
      setToast({ message: error, type: 'error', isVisible: true });
    }
  }, [error]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => {
        setToast({ ...toast, isVisible: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const filteredReviews = localReviews.filter(review => {
    switch (activeFilter) {
      case "Verified Only":
        return review.verified === true || review.verified === '1';
      case "Top Rated":
        return review.rating >= 4;
      case "Most Recent":
        return new Date(review.date) >= new Date("2025-08-12");
      case "Most Helpful":
        return review.helpful >= 100;
      default:
        return true;
    }
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (activeFilter) {
      case "Most Recent":
        return new Date(b.date) - new Date(a.date);
      case "Most Helpful":
        return b.helpful - a.helpful;
      case "Top Rated":
        return b.rating - a.rating;
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  const displayedReviews = showAll ? sortedReviews : sortedReviews.slice(0, 10);

  const handleLike = (reviewId) => {
    if (!isAuthenticated) {
      setToast({ 
        message: 'You must be logged in to like reviews', 
        type: 'warning', 
        isVisible: true 
      });
      return;
    }

    setLocalReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              likes: (review.likedBy || []).some(email => email === logInEmail)
                ? review.likes - 1
                : review.likes + 1,
              likedBy: (review.likedBy || []).some(email => email === logInEmail)
                ? (review.likedBy || []).filter(email => email !== logInEmail)
                : [...(review.likedBy || []), logInEmail]
            }
          : review
      )
    );

    dispatch(likeReview({ id: reviewId, userEmail: logInEmail }));
  };

  const handleHelpful = (reviewId) => {
    if (!isAuthenticated) {
      setToast({ 
        message: 'You must be logged in to mark reviews as helpful', 
        type: 'warning', 
        isVisible: true 
      });
      return;
    }

    setLocalReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? {
              ...review,
              helpful: (review.markedHelpfulBy || []).some(email => email === logInEmail)
                ? review.helpful - 1
                : review.helpful + 1,
              markedHelpfulBy: (review.markedHelpfulBy || []).some(email => email === logInEmail)
                ? (review.markedHelpfulBy || []).filter(email => email !== logInEmail)
                : [...(review.markedHelpfulBy || []), logInEmail]
            }
          : review
      )
    );

    dispatch(markHelpful({ id: reviewId, userEmail: logInEmail }));
  };

  return (
    <div className="bg-gray-50">
      {/* Toast Notification */}
      {toast.isVisible && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
          toast.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500' :
          'bg-green-100 text-green-800 border-l-4 border-green-500'
        }`}>
          <div className="flex items-center">
            <span className="mr-3">
              {toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : '✅'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <section className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-[#4B0082] font-medium px-6 py-2 bg-[#4B0082]/5 rounded-full mb-4">
            Customer Reviews
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            What Our <span className="text-[#4B0082]">Customers</span> Say
          </h2>
          <div className="flex justify-center gap-8 text-gray-600">
            <div>
              <span className="font-bold text-2xl text-[#4B0082]">{localReviews.filter(r => r.verified === true || r.verified === '1').length}</span>
              <p>Verified Reviews</p>
            </div>
            <div>
              <span className="font-bold text-2xl text-[#4B0082]">
                {(localReviews.length > 0 ? localReviews.reduce((acc, r) => acc + parseInt(r.rating), 0) / localReviews.length : 0).toFixed(1)}
              </span>
              <p>Average Rating</p>
            </div>
            <div>
              <span className="font-bold text-2xl text-[#4B0082]">{localReviews.length}</span>
              <p>Total Reviews</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-4">
          {filterOptions.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${activeFilter === filter ? 'bg-[#4B0082] text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-[#4B0082]/5'}`}
            >
              {filter}
              {filter !== "All Reviews" && (
                <span className="ml-2 text-sm">
                  ({filteredReviews.filter(r => {
                    switch (filter) {
                      case "Verified Only": return r.verified === true || r.verified === '1';
                      case "Top Rated": return r.rating >= 4;
                      case "Most Recent": return new Date(r.date) >= new Date("2025-08-12");
                      case "Most Helpful": return r.helpful >= 100;
                      default: return true;
                    }
                  }).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {status === 'loading' ? (
            <div className="text-center col-span-full py-16">
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          ) : localReviews.length === 0 ? (
            <div className="text-center col-span-full py-16">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Found</h3>
              <p className="text-gray-600">Be the first to share your experience with this product!</p>
            </div>
          ) : displayedReviews.length === 0 ? (
            <div className="text-center col-span-full py-16">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Match Your Filter</h3>
              <p className="text-gray-600">Try selecting a different filter option.</p>
            </div>
          ) : (
            displayedReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onMouseEnter={() => setHoveredReview(review.id)}
                onMouseLeave={() => setHoveredReview(null)}
              >
                {/* Review Header */}
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.author}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < review.rating ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{review.rating}.0</span>
                    </div>
                  </div>
                  {review.verified && (
                    <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                {/* Review Content */}
                <div className="mb-4">
                  <h5 className="font-bold text-gray-900 mb-2">{review.title}</h5>
                  <p className="text-gray-600 line-clamp-3">{review.content}</p>
                </div>

                {/* Review Date */}
                <div className="text-sm text-gray-500 mb-4">
                  {new Date(review.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                {/* Review Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(review.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      (review.likedBy || []).some(email => email === logInEmail)
                        ? 'text-[#4B0082]'
                        : 'text-gray-500 hover:text-[#4B0082]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{review.likes}</span>
                  </button>
                  <button
                    onClick={() => handleHelpful(review.id)}
                    className={`flex items-center gap-2 transition-colors ${
                      (review.markedHelpfulBy || []).some(email => email === logInEmail)
                        ? 'text-[#4B0082]'
                        : 'text-gray-500 hover:text-[#4B0082]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                    </svg>
                    <span>Helpful ({review.helpful})</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {sortedReviews.length > 10 && !showAll && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(true)}
              className="px-8 py-3 bg-[#4B0082] text-white rounded-full font-medium hover:bg-[#4B0082]/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Load More Reviews ({sortedReviews.length - 10} more)
            </button>
          </div>
        )}

        {/* Show Less Button */}
        {showAll && sortedReviews.length > 10 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(false)}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-all duration-300"
            >
              Show Less
            </button>
          </div>
        )}
      </section>
    </div>
  );
}