//Backend integration.(Working Slice except for main reviewSection)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/reviews';

const initialState = {
  reviews: [],
  status: 'idle',
  error: null,
  lastFetch: null
};

export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const lastFetch = state.reviews.lastFetch;

      if (!lastFetch || Date.now() - lastFetch >= 5000) {
        console.log('fetchReviews: Sending request to GET /api/reviews/all');
        const response = await axios.get(`${API_BASE_URL}/all`);
        console.log('fetchReviews: API response', response.data);
        const normalizedReviews = response.data.map(review => ({
          ...review,
          id: review.id.toString(),
          productId: parseInt(review.productId),
          rating: parseInt(review.rating),
          verified: review.verified === true || review.verified === '1',
          date: new Date(review.date).toISOString().split('T')[0],
          likedBy: review.likedBy || [],
          markedHelpfulBy: review.markedHelpfulBy || [],
          userEmail: review.userEmail || '',
          author: review.author || 'Anonymous',
          title: review.title || '',
          content: review.content || '',
          avatar: review.avatar || 'https://via.placeholder.com/64',
          likes: parseInt(review.likes) || 0,
          helpful: parseInt(review.helpful) || 0,
          comments: parseInt(review.comments) || 0
        }));
        console.log('fetchReviews: Normalized reviews', normalizedReviews);
        return normalizedReviews;
      } else {
        console.log('fetchReviews: Using cached data', state.reviews.reviews);
        return state.reviews.reviews;
      }
    } catch (error) {
      console.error('fetchReviews: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

// export const addReview = createAsyncThunk(
//   'reviews/addReview',
//   async (reviewData, { rejectWithValue }) => {
//     try {
//       console.log('addReview: Input review payload', JSON.stringify(reviewData, null, 2));
//       const payload = {
//         userEmail: reviewData.userEmail,
//         productId: reviewData.productId,
//         author: reviewData.author,
//         avatar: reviewData.userImage || 'https://via.placeholder.com/64',
//         rating: parseInt(reviewData.rating, 10),
//         title: reviewData.title,
//         content: reviewData.content,
//         verified: reviewData.verified || false,
//         badge: null,
//         likes: 0,
//         comments: 0,
//         helpful: 0
//       };
//       console.log('addReview: Sending payload to POST /api/reviews', JSON.stringify(payload, null, 2));
//       const response = await axios.post(`${API_BASE_URL}`, payload, {
//         headers: { 'Content-Type': 'application/json' }
//       });
//       console.log('addReview: API response', response.data);
//       return {
//         ...response.data,
//         id: response.data.id.toString(),
//         productId: parseInt(response.data.productId),
//         rating: parseInt(response.data.rating),
//         verified: response.data.verified === true || response.data.verified === '1',
//         date: new Date(response.data.date).toISOString().split('T')[0],
//         userImage: reviewData.userImage,
//         likedBy: [],
//         markedHelpfulBy: []
//       };
//     } catch (error) {
//       console.error('addReview: Error', error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || 'Failed to add review');
//     }
//   }
// );

export const addReview = createAsyncThunk(
  'reviews/addReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      console.log('addReview: Input review payload', JSON.stringify(reviewData, null, 2));
      const payload = {
      userEmail: reviewData.userEmail,
      productId: reviewData.productId,
      author: reviewData.author,
      avatar: reviewData.avatar || 'https://via.placeholder.com/64',
      rating: parseInt(reviewData.rating, 10),
      title: reviewData.title,
      content: reviewData.content,
      verified: reviewData.verified || false,
      badge: null,
      likes: 0,
      comments: 0,
      helpful: 0
    };
      
      console.log('addReview: Sending payload to POST /api/reviews', JSON.stringify(payload, null, 2));
      const response = await axios.post(`${API_BASE_URL}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('addReview: API response', response.data);
      return {
        ...response.data,
        id: response.data.id.toString(),
        productId: parseInt(response.data.productId),
        rating: parseInt(response.data.rating),
        verified: response.data.verified === true || response.data.verified === '1',
        date: new Date(response.data.date).toISOString().split('T')[0],
        avatar: response.data.avatar || payload.avatar, // Ensure avatar is preserved
        likedBy: [],
        markedHelpfulBy: []
      };
    } catch (error) {
      console.error('addReview: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const payload = {
        title: reviewData.title,
        content: reviewData.content,
        rating: parseInt(reviewData.rating, 10)
      };
      console.log(`updateReview: Sending payload to PUT /api/reviews/${reviewData.id}?userEmail=${reviewData.userEmail}`, JSON.stringify(payload, null, 2));
      const response = await axios.put(`${API_BASE_URL}/${reviewData.id}?userEmail=${encodeURIComponent(reviewData.userEmail)}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('updateReview: API response', response.data);
      return {
        ...response.data,
        id: response.data.id.toString(),
        productId: parseInt(response.data.productId),
        rating: parseInt(response.data.rating),
        verified: response.data.verified === true || response.data.verified === '1',
        date: new Date(response.data.date).toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('updateReview: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async ({ id, userEmail }, { rejectWithValue }) => {
    try {
      console.log(`deleteReview: Sending request to DELETE /api/reviews/${id}?userEmail=${userEmail}`);
      await axios.delete(`${API_BASE_URL}/${id}?userEmail=${encodeURIComponent(userEmail)}`);
      console.log('deleteReview: Review deleted', id);
      return { id, userEmail };
    } catch (error) {
      console.error('deleteReview: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

export const likeReview = createAsyncThunk(
  'reviews/likeReview',
  async ({ id, userEmail }, { rejectWithValue, getState }) => {
    try {
      console.log(`likeReview: Sending request to POST /api/reviews/${id}/like?userEmail=${userEmail}`);
      const state = getState();
      const review = state.reviews.reviews.find(r => r.id === id);
      const isLiked = (review?.likedBy || []).some(email => email === userEmail);
      
      const payload = {
        ...review,
        likes: isLiked ? (review?.likes || 0) - 1 : (review?.likes || 0) + 1,
        likedBy: isLiked
          ? (review?.likedBy || []).filter(email => email !== userEmail)
          : [...(review?.likedBy || []), userEmail]
      };
      
      const response = await axios.post(`${API_BASE_URL}/${id}/like?userEmail=${encodeURIComponent(userEmail)}`);
      console.log('likeReview: API response', response.data);
      return {
        ...response.data,
        id: response.data.id.toString(),
        productId: parseInt(response.data.productId),
        rating: parseInt(response.data.rating),
        verified: response.data.verified === true || response.data.verified === '1',
        date: new Date(response.data.date).toISOString().split('T')[0],
        likedBy: payload.likedBy
      };
    } catch (error) {
      console.error('likeReview: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to like review');
    }
  }
);

export const markHelpful = createAsyncThunk(
  'reviews/markHelpful',
  async ({ id, userEmail }, { rejectWithValue, getState }) => {
    try {
      console.log(`markHelpful: Sending request to POST /api/reviews/${id}/helpful?userEmail=${userEmail}`);
      const state = getState();
      const review = state.reviews.reviews.find(r => r.id === id);
      const isHelpful = (review?.markedHelpfulBy || []).some(email => email === userEmail);
      
      const payload = {
        ...review,
        helpful: isHelpful ? (review?.helpful || 0) - 1 : (review?.helpful || 0) + 1,
        markedHelpfulBy: isHelpful
          ? (review?.markedHelpfulBy || []).filter(email => email !== userEmail)
          : [...(review?.markedHelpfulBy || []), userEmail]
      };
      
      const response = await axios.post(`${API_BASE_URL}/${id}/helpful?userEmail=${encodeURIComponent(userEmail)}`);
      console.log('markHelpful: API response', response.data);
      return {
        ...response.data,
        id: response.data.id.toString(),
        productId: parseInt(response.data.productId),
        rating: parseInt(response.data.rating),
        verified: response.data.verified === true || response.data.verified === '1',
        date: new Date(response.data.date).toISOString().split('T')[0],
        markedHelpfulBy: payload.markedHelpfulBy
      };
    } catch (error) {
      console.error('markHelpful: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to mark helpful');
    }
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.status = 'loading';
        console.log('fetchReviews: Pending');
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastFetch = Date.now();
        state.reviews = action.payload;
        console.log('fetchReviews: Updated state.reviews', state.reviews);
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.log('fetchReviews: Rejected with error', action.payload);
      })
      .addCase(addReview.pending, (state) => {
        state.status = 'loading';
        console.log('addReview: Pending');
      })
      .addCase(addReview.fulfilled, (state, action) => {
        const { id } = action.payload;
        if (!state.reviews.some(r => r.id === id)) {
          state.reviews.push(action.payload);
        }
        state.status = 'succeeded';
        console.log('addReview: Fulfilled with payload', action.payload);
      })
      .addCase(addReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.log('addReview: Rejected with error', action.payload);
      })
      .addCase(updateReview.pending, (state) => {
        state.status = 'loading';
        console.log('updateReview: Pending');
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        } else {
          console.warn('updateReview: Review not found in store, adding new:', action.payload.id);
          state.reviews.push(action.payload);
        }
        state.status = 'succeeded';
        console.log('updateReview: Fulfilled with payload', action.payload);
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.log('updateReview: Rejected with error', action.payload);
      })
      .addCase(deleteReview.pending, (state) => {
        state.status = 'loading';
        console.log('deleteReview: Pending');
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r.id !== action.payload.id);
        state.status = 'succeeded';
        console.log('deleteReview: Fulfilled with payload', action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.log('deleteReview: Rejected with error', action.payload);
      })
      .addCase(likeReview.pending, (state) => {
        state.status = 'loading';
        console.log('likeReview: Pending');
      })
      .addCase(likeReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        state.status = 'succeeded';
        console.log('likeReview: Fulfilled with payload', action.payload);
      })
      .addCase(likeReview.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.log('likeReview: Rejected with error', action.payload);
      })
      .addCase(markHelpful.pending, (state) => {
        state.status = 'loading';
        console.log('markHelpful: Pending');
      })
      .addCase(markHelpful.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
        state.status = 'succeeded';
        console.log('markHelpful: Fulfilled with payload', action.payload);
      })
      .addCase(markHelpful.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.log('markHelpful: Rejected with error', action.payload);
      });
  }
});

export const selectAllReviews = state => state.reviews.reviews;
export const selectReviewStatus = state => state.reviews.status;
export const selectReviewError = state => state.reviews.error;

export default reviewSlice.reducer;