//Correctly working for the fetching, adding and deleting
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import data from '../components/ProductComponents/ProductData';

const { products } = data;

// Transform imported products to match ProductResponseDTO structure
const transformedProducts = Array.isArray(products) ? products.map(product => ({
  _id: product.id.toString(), // Convert to string to match backend
  name: product.name,
  category: product.category,
  subCategory: product.subCategory,
  price: product.price.replace('$', ''), // Remove $ for consistency
  image: product.image,
  lifestyleImages: product.lifestyleImages,
  stockQuantity: product.stockQuantity,
  createdAt: product.createdAt || new Date().toISOString()
})) : [];

const initialState = {
  productList: [],
  status: 'idle',
  error: null
};

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8080/api/products';

// In your fetchProducts thunk
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const lastFetch = state.products.lastFetch;

      // Skip fetch if within 5 seconds
      if (lastFetch && Date.now() - lastFetch < 5000) {
        console.log('Skipping fetch - too recent');
        return state.products.productList; // Return current products
      }

      console.log('fetchProducts: Sending request to GET /api/products/all');
      const response = await axios.get(`${API_BASE_URL}/all`);
      console.log('fetchProducts: API response', response.data);
      return response.data.length > 0 ? response.data : transformedProducts;
    } catch (error) {
      console.error('fetchProducts: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Async thunk for AddProduct
export const AddProduct = createAsyncThunk(
  'products/addProduct',
  async (product, { rejectWithValue }) => {
    try {
      console.log('AddProduct: Input product payload', JSON.stringify(product, null, 2));
      
      // Prepare payload matching ProductDTO
      const payload = {
        name: product.name,
        category: product.category,
        subCategory: product.subCategory,
        price: product.price, // String, e.g., "499.00"
        image: product.image, // Base64 string
        lifestyleImages: product.lifestyleImages, // Array of base64 strings
        stockQuantity: parseInt(product.stockQuantity, 10),
        feature: product.feature,
        description: product.description,
        sellerEmail: product.sellerEmail
      };
      
      console.log('AddProduct: Final payload being sent', JSON.stringify({
        ...payload,
        image: payload.image ? `${payload.image.substring(0, 50)}...` : 'empty',
        lifestyleImages: payload.lifestyleImages ? `Array(${payload.lifestyleImages.length})` : 'empty'
      }, null, 2));

      console.log("Seller Email : ",payload.sellerEmail);
      
      console.log('AddProduct: Sending payload to POST /api/products/add');
      const response = await axios.post(`${API_BASE_URL}/add`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('AddProduct: API response', response.data);
      return { ...response.data, _id: response.data.id.toString() }; // Map id to _id as string
    } catch (error) {
      console.error('AddProduct: Full error details', error);
      console.error('AddProduct: Error response', error.response);
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

// Async thunk for DeleteProduct
export const DeleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      console.log('DeleteProduct: Sending request to DELETE /api/products/delete/' + id);
      await axios.delete(`${API_BASE_URL}/delete/${id}`);
      console.log('DeleteProduct: Product deleted', id);
      return id;
    } catch (error) {
      console.error('DeleteProduct: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

// Async thunk for UpdateProduct
export const UpdateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, product }, { rejectWithValue }) => {
    try {
      // Prepare payload matching ProductDTO
      const payload = {
        name: product.name,
        category: product.category,
        subCategory: product.subCategory,
        price: product.price, // String, e.g., "499.00"
        image: product.image, // Base64 string or URL
        lifestyleImages: product.lifestyleImages, // Array of base64 strings or URLs
        stockQuantity: parseInt(product.stockQuantity, 10),
        feature: product.feature,
        description: product.description,
        sellerEmail: product.sellerEmail
      };
      console.log('UpdateProduct: Sending payload to PUT /api/products/update/' + id, payload);
      const response = await axios.put(`${API_BASE_URL}/update/${id}`, payload);
      console.log('UpdateProduct: API response', response.data);
      return { ...response.data, _id: response.data.id.toString() }; // Map id to _id as string
    } catch (error) {
      console.error('UpdateProduct: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

// Update your reduceProductQuantity and increaseProductQuantity thunks
export const reduceProductQuantity = createAsyncThunk(
  'products/reduceProductQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      // Convert to number for backend (assuming backend expects Long)
      const numericId = Number(productId);
      console.log('reduceProductQuantity: Sending request for product', numericId, 'quantity:', quantity);
      
      await axios.patch(`${API_BASE_URL}/reduce-stock/${numericId}?quantity=${quantity}`);
      console.log('reduceProductQuantity: Quantity reduced for product', numericId);
      return { productId: numericId.toString(), quantity }; // Return as string for consistency
    } catch (error) {
      console.error('reduceProductQuantity: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to reduce product quantity');
    }
  }
);

export const increaseProductQuantity = createAsyncThunk(
  'products/increaseProductQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const numericId = Number(productId);
      console.log('increaseProductQuantity: Sending request for product', numericId, 'quantity:', quantity);
      
      await axios.patch(`${API_BASE_URL}/increase-stock/${numericId}?quantity=${quantity}`);
      console.log('increaseProductQuantity: Quantity increased for product', numericId);
      return { productId: numericId.toString(), quantity };
    } catch (error) {
      console.error('increaseProductQuantity: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to increase product quantity');
    }
  }
);


const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    resetProductStatus(state) {
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Handle fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        console.log('fetchProducts: Pending');
      })
      // Update the fulfilled case
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.lastFetch = Date.now(); // Update timestamp
        
        // Only update if data changed
        const newProducts = action.payload.map(product => ({ 
          ...product, 
          _id: product.id ? product.id.toString() : product._id 
        }));
        
        state.productList = newProducts;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.log('fetchProducts: Rejected with error', action.payload);
      })
      // Handle AddProduct
      .addCase(AddProduct.pending, (state) => {
        state.status = 'loading';
        console.log('AddProduct: Pending');
      })
      .addCase(AddProduct.fulfilled, (state, action) => {
        console.log('AddProduct: Fulfilled with payload', action.payload);
        const { _id } = action.payload;
        const exists = state.productList.some(product => product._id === _id);
        if (exists) {
          state.error = "Product already exists";
          state.status = 'failed';
          console.log('AddProduct: Product already exists', _id);
          return;
        }
        state.productList.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(AddProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.log('AddProduct: Rejected with error', action.payload);
      })
      // Handle DeleteProduct
      .addCase(DeleteProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(DeleteProduct.fulfilled, (state, action) => {
        state.productList = state.productList.filter(
          product => product._id !== action.payload
        );
        state.status = 'succeeded';
      })
      .addCase(DeleteProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle UpdateProduct
      .addCase(UpdateProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(UpdateProduct.fulfilled, (state, action) => {
        const index = state.productList.findIndex(
          product => product._id === action.payload._id
        );
        if (index !== -1) {
          state.productList[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(UpdateProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle reduceProductQuantity
      .addCase(reduceProductQuantity.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(reduceProductQuantity.fulfilled, (state, action) => {
        const { productId, quantity } = action.payload;
        const product = state.productList.find(pro => pro._id === productId);
        if (product) {
          product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
        }
        state.status = 'succeeded';
      })
      .addCase(reduceProductQuantity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle increaseProductQuantity
      .addCase(increaseProductQuantity.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(increaseProductQuantity.fulfilled, (state, action) => {
        const { productId, quantity } = action.payload;
        const product = state.productList.find(pro => pro._id === productId);
        if (product) {
          product.stockQuantity += quantity; // increase stock
        }
        state.status = 'succeeded';
      })
      .addCase(increaseProductQuantity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

  }
});

export const { resetProductStatus } = productSlice.actions;

export const selectAllProducts = state => state.products.productList;
export const selectProductStatus = state => state.products.status;
export const selectProductError = state => state.products.error;

export default productSlice.reducer;



//For fixing the updating thunk
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// import data from '../components/ProductComponents/ProductData';

// const { products } = data;

// // Transform imported products to match ProductResponseDTO structure
// const transformedProducts = Array.isArray(products) ? products.map(product => ({
//   _id: product.id.toString(), // Convert to string to match frontend
//   name: product.name,
//   category: product.category,
//   subCategory: product.subCategory,
//   price: product.price.replace('$', ''), // Remove $ for consistency
//   image: product.image,
//   lifestyleImages: product.lifestyleImages,
//   stockQuantity: product.stockQuantity,
//   createdAt: product.createdAt || new Date().toISOString()
// })) : [];

// const initialState = {
//   productList: transformedProducts,
//   status: 'idle',
//   error: null,
//   lastFetch: null // Track last fetch time
// };

// // Base URL for the backend API
// const API_BASE_URL = 'http://localhost:8080/api/products';

// // In your fetchProducts thunk
// export const fetchProducts = createAsyncThunk(
//   'products/fetchProducts',
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const state = getState();
//       const lastFetch = state.products.lastFetch;

//       // Skip fetch if within 5 seconds
//       if (lastFetch && Date.now() - lastFetch < 5000) {
//         console.log('Skipping fetch - too recent');
//         return state.products.productList; // Return current products
//       }

//       console.log('fetchProducts: Sending request to GET /api/products/all');
//       const response = await axios.get(`${API_BASE_URL}/all`);
//       console.log('fetchProducts: API response', response.data);
//       return response.data.length > 0 ? response.data.map(p => ({ ...p, _id: p.id.toString() })) : transformedProducts;
//     } catch (error) {
//       console.error('fetchProducts: Error', error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
//     }
//   }
// );

// // Async thunk for AddProduct
// export const AddProduct = createAsyncThunk(
//   'products/addProduct',
//   async (product, { rejectWithValue }) => {
//     try {
//       const payload = {
//         name: product.name,
//         category: product.category,
//         subCategory: product.subCategory,
//         price: product.price,
//         image: product.image,
//         lifestyleImages: product.lifestyleImages,
//         stockQuantity: parseInt(product.stockQuantity, 10),
//         features: product.features,
//         description: product.description,
//         sellerEmail: product.sellerEmail
//       };
//       console.log('AddProduct: Sending payload to POST /api/products/add', payload);
//       const response = await axios.post(`${API_BASE_URL}/add`, payload, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       return { ...response.data, _id: response.data.id.toString() };
//     } catch (error) {
//       console.error('AddProduct: Error', error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || 'Failed to add product');
//     }
//   }
// );

// // Async thunk for DeleteProduct
// export const DeleteProduct = createAsyncThunk(
//   'products/deleteProduct',
//   async (id, { rejectWithValue }) => {
//     try {
//       console.log('DeleteProduct: Sending request to DELETE /api/products/delete/' + id);
//       await axios.delete(`${API_BASE_URL}/delete/${id}`);
//       return id;
//     } catch (error) {
//       console.error('DeleteProduct: Error', error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
//     }
//   }
// );

// // Async thunk for UpdateProduct
// export const UpdateProduct = createAsyncThunk(
//   'products/updateProduct',
//   async ({ id, product }, { rejectWithValue }) => {
//     try {
//       const payload = {
//         name: product.name,
//         category: product.category,
//         subCategory: product.subCategory,
//         price: product.price,
//         image: product.image,
//         lifestyleImages: product.lifestyleImages,
//         stockQuantity: parseInt(product.stockQuantity, 10),
//         features: product.features,
//         description: product.description,
//         sellerEmail: product.sellerEmail
//       };
//       console.log('UpdateProduct: Sending payload to PUT /api/products/update/' + id, payload);
//       const response = await axios.put(`${API_BASE_URL}/update/${parseInt(id)}`, payload); // Ensure id is parsed as Long
//       console.log('UpdateProduct: API response', response.data);
//       return { ...response.data, _id: response.data.id.toString() };
//     } catch (error) {
//       console.error('UpdateProduct: Error', error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || 'Failed to update product');
//     }
//   }
// );

// // Async thunk for reduceProductQuantity
// export const reduceProductQuantity = createAsyncThunk(
//   'products/reduceProductQuantity',
//   async ({ productId, quantity }, { rejectWithValue }) => {
//     try {
//       console.log('reduceProductQuantity: Sending request to PATCH /api/products/reduce-stock/' + productId, { quantity });
//       await axios.patch(`${API_BASE_URL}/reduce-stock/${productId}?quantity=${quantity}`);
//       return { productId, quantity };
//     } catch (error) {
//       console.error('reduceProductQuantity: Error', error.response?.data || error.message);
//       return rejectWithValue(error.response?.data?.message || 'Failed to reduce product quantity');
//     }
//   }
// );

// const productSlice = createSlice({
//   name: 'products',
//   initialState,
//   reducers: {
//     resetProductStatus(state) {
//       state.status = 'idle';
//       state.error = null;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchProducts.pending, (state) => {
//         state.status = 'loading';
//         console.log('fetchProducts: Pending');
//       })
//       .addCase(fetchProducts.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.lastFetch = Date.now();
//         state.productList = action.payload.map(p => ({ ...p, _id: p.id ? p.id.toString() : p._id }));
//       })
//       .addCase(fetchProducts.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//         console.log('fetchProducts: Rejected with error', action.payload);
//       })
//       .addCase(AddProduct.pending, (state) => {
//         state.status = 'loading';
//         console.log('AddProduct: Pending');
//       })
//       .addCase(AddProduct.fulfilled, (state, action) => {
//         const { _id } = action.payload;
//         if (!state.productList.some(p => p._id === _id)) {
//           state.productList.push(action.payload);
//         }
//         state.status = 'succeeded';
//       })
//       .addCase(AddProduct.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//         console.log('AddProduct: Rejected with error', action.payload);
//       })
//       .addCase(DeleteProduct.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(DeleteProduct.fulfilled, (state, action) => {
//         state.productList = state.productList.filter(p => p._id !== action.payload);
//         state.status = 'succeeded';
//       })
//       .addCase(DeleteProduct.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })
//       .addCase(UpdateProduct.pending, (state) => {
//         state.status = 'loading';
//         console.log('UpdateProduct: Pending');
//       })
//       .addCase(UpdateProduct.fulfilled, (state, action) => {
//         const index = state.productList.findIndex(p => p._id === action.payload._id);
//         if (index !== -1) {
//           state.productList[index] = action.payload;
//         } else {
//           console.warn('UpdateProduct: Product not found in store, adding new:', action.payload._id);
//           state.productList.push(action.payload);
//         }
//         state.status = 'succeeded';
//         console.log('UpdateProduct: Fulfilled with payload', action.payload);
//       })
//       .addCase(UpdateProduct.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//         console.log('UpdateProduct: Rejected with error', action.payload);
//       })
//       .addCase(reduceProductQuantity.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(reduceProductQuantity.fulfilled, (state, action) => {
//         const { productId, quantity } = action.payload;
//         const product = state.productList.find(p => p._id === productId);
//         if (product) {
//           product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
//         }
//         state.status = 'succeeded';
//       })
//       .addCase(reduceProductQuantity.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       });
//   }
// });

// export const { resetProductStatus } = productSlice.actions;

// export const selectAllProducts = state => state.products.productList;
// export const selectProductStatus = state => state.products.status;
// export const selectProductError = state => state.products.error;

// export default productSlice.reducer;