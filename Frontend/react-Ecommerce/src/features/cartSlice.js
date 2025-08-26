import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { addCartNotification } from './notificationSlice';
import { reduceProductQuantity } from './productSlice';

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:8080/api/carts';

const initialState = {
  cartItemList: [], // [{ userEmail: string, cart: Array<{ productId: number, name: string, price: number, quantity: number, image: string, addedAt: string|null }> }]
  taxRate: 0.08,
  status: 'idle',
  error: null
};

// Helper function to ensure price is a number
const ensureNumberPrice = (price) => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const num = parseFloat(price.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

// Helper function to normalize cart item from backend
const normalizeCartItem = (item) => {
  console.log('normalizeCartItem: Normalizing item', item);
  return {
    productId: Number(item.productId) || 0,
    name: item.name || 'Unknown Product',
    price: ensureNumberPrice(item.price),
    quantity: Number(item.quantity) || 0,
    image: item.image || '',
    addedAt: item.addedAt || new Date().toISOString()
  };
};

// Async thunk for adding an item to the cart
export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async ({ userEmail, productId, name, price, quantity, image }, { rejectWithValue }) => {
    try {
      console.log('addItemToCart: Sending request to POST /api/carts/{userEmail}/items', {
        userEmail,
        itemDTO: { productId, name, price, quantity, image }
      });
      const response = await axios.post(`${API_BASE_URL}/${userEmail}/items`, {
        productId: Number(productId),
        name: name || 'Unknown Product',
        price: ensureNumberPrice(price),
        quantity: Number(quantity),
        image: image || '',
        addedAt: new Date().toISOString()
      });
      console.log('addItemToCart: API response', response.data);
      return response.data; // { userEmail, cartItems }
    } catch (error) {
      console.error('addItemToCart: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

// Async thunk for updating item quantity
export const updateItemQuantity = createAsyncThunk(
  'cart/updateItemQuantity',
  async ({ userEmail, productId, quantity }, { rejectWithValue }) => {
    try {
      console.log('updateItemQuantity: Sending request to PUT /api/carts/{userEmail}/items/{productId}', { quantity });
      const response = await axios.put(
        `${API_BASE_URL}/${userEmail}/items/${Number(productId)}?quantity=${quantity}`
      );
      console.log('updateItemQuantity: API response', response.data);
      return response.data; // { userEmail, cartItems }
    } catch (error) {
      console.error('updateItemQuantity: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update item quantity');
    }
  }
);

// Async thunk for removing an item from the cart
export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async ({ userEmail, productId }, { rejectWithValue }) => {
    try {
      console.log('removeItemFromCart: Sending request to DELETE /api/carts/{userEmail}/items/{productId}');
      const response = await axios.delete(`${API_BASE_URL}/${userEmail}/items/${Number(productId)}`);
      console.log('removeItemFromCart: API response', response.data);
      return response.data; // { userEmail, cartItems }
    } catch (error) {
      console.error('removeItemFromCart: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

// Async thunk for clearing a user's cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (userEmail, { rejectWithValue }) => {
    try {
      console.log('clearCart: Sending request to DELETE /api/carts/{userEmail}');
      await axios.delete(`${API_BASE_URL}/${userEmail}`);
      console.log('clearCart: Cart cleared for', userEmail);
      return userEmail;
    } catch (error) {
      console.error('clearCart: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// Async thunk for clearing all carts
export const clearAllCarts = createAsyncThunk(
  'cart/clearAllCarts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('clearAllCarts: Sending request to DELETE /api/carts');
      await axios.delete(`${API_BASE_URL}`);
      console.log('clearAllCarts: All carts cleared');
      return null;
    } catch (error) {
      console.error('clearAllCarts: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to clear all carts');
    }
  }
);

// Async thunk for fetching a user's cart
export const fetchCartByUserEmail = createAsyncThunk(
  'cart/fetchCartByUserEmail',
  async (userEmail, { rejectWithValue }) => {
    try {
      console.log('fetchCartByUserEmail: Sending request to GET /api/carts/{userEmail}');
      const response = await axios.get(`${API_BASE_URL}/${userEmail}`);
      console.log('fetchCartByUserEmail: API response', response.data);
      return response.data; // { userEmail, cartItems }
    } catch (error) {
      console.error('fetchCartByUserEmail: Error', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Thunk action to add item to cart with notification and stock reduction
export const addItemToCartWithNotification = (itemData) => async (dispatch, getState) => {
  try {
    const { userEmail, name, quantity = 1, productId } = itemData;

    // Check stock availability
    const state = getState();
    const product = state.products.productList.find((p) => p.id === Number(productId));

    if (!product || product.stockQuantity < quantity) {
      throw new Error('Not enough stock available');
    }

    // Add to cart via API
    const result = await dispatch(
      addItemToCart({
        ...itemData,
        productId: Number(productId),
        price: ensureNumberPrice(itemData.price)
      })
    ).unwrap();

    // Reduce stock quantity
    try {
      await dispatch(reduceProductQuantity({ productId: Number(productId), quantity })).unwrap();
    } catch (error) {
      console.error('addItemToCartWithNotification: Failed to reduce stock', error.message);
      dispatch(
        addCartNotification({
          userEmail,
          productName: name,
          action: 'warning',
          quantity,
          message: `Item "${name}" added to cart, but stock update failed: ${error.message}`,
          productId: Number(productId)
        })
      );
    }

    // Show success notification
    console.log('addItemToCartWithNotification: Dispatching addCartNotification', {
      userEmail,
      productName: name,
      action: 'added',
      quantity,
      message: `Item "${name}" added to cart!`,
      productId: Number(productId)
    });
    dispatch(
      addCartNotification({
        userEmail,
        productName: name,
        action: 'added',
        quantity,
        message: `Item "${name}" added to cart!`,
        productId: Number(productId)
      })
    );

    return result; // Return CartDTO
  } catch (error) {
    console.error('addItemToCartWithNotification: Error', error.message);
    dispatch(
      addCartNotification({
        userEmail: itemData.userEmail,
        productName: itemData.name,
        action: 'error',
        quantity: itemData.quantity,
        message: `Failed to add "${itemData.name}" to cart: ${error.message}`,
        productId: Number(itemData.productId)
      })
    );
    throw error; // Let the caller handle the error
  }
};

// Thunk action to update item quantity with notification
export const updateItemQuantityWithNotification = (updateData) => async (dispatch, getState) => {
  const { userEmail, productId, quantity } = updateData;

  // Get current item to check if it exists
  const state = getState();
  const userCart = state.cart.cartItemList.find((cart) => cart.userEmail === userEmail);
  const item = userCart?.cart.find((item) => item.productId === Number(productId));

  if (item) {
    const oldQuantity = item.quantity;

    // Update quantity via API
    await dispatch(updateItemQuantity({ ...updateData, productId: Number(productId) })).unwrap();

    // Add notification if quantity changed significantly or item was removed
    if (quantity <= 0) {
      dispatch(
        addCartNotification({
          userEmail,
          productName: item.name,
          action: 'removed',
          quantity: 0,
          message: `Item "${item.name}" removed from cart`,
          productId: Number(productId)
        })
      );
    } else if (Math.abs(quantity - oldQuantity) > 0) {
      dispatch(
        addCartNotification({
          userEmail,
          productName: item.name,
          action: 'updated',
          quantity,
          message: `Updated "${item.name}" quantity to ${quantity}`,
          productId: Number(productId)
        })
      );
    }
  }
};

// Thunk action to remove item with notification
export const removeItemFromCartWithNotification = (removeData) => async (dispatch, getState) => {
  const { userEmail, productId } = removeData;

  // Get item name before removing
  const state = getState();
  const userCart = state.cart.cartItemList.find((cart) => cart.userEmail === userEmail);
  const item = userCart?.cart.find((item) => item.productId === Number(productId));

  if (item) {
    // Remove item via API
    await dispatch(removeItemFromCart({ ...removeData, productId: Number(productId) })).unwrap();

    // Add notification
    dispatch(
      addCartNotification({
        userEmail,
        productName: item.name,
        action: 'removed',
        quantity: 0,
        message: `Item "${item.name}" removed from cart`,
        productId: Number(productId)
      })
    );
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setTaxRate: (state, action) => {
      state.taxRate = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle addItemToCart
      .addCase(addItemToCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        console.log('addItemToCart: Pending');
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        const cartDTO = action.payload;
        const userCart = state.cartItemList.find((cart) => cart.userEmail === cartDTO.userEmail);
        const normalizedCartItems = Array.isArray(cartDTO.cartItems)
          ? cartDTO.cartItems.map(normalizeCartItem)
          : [];
        if (userCart) {
          userCart.cart = normalizedCartItems;
        } else {
          state.cartItemList.push({
            userEmail: cartDTO.userEmail,
            cart: normalizedCartItems
          });
        }
        console.log('addItemToCart: Fulfilled', state.cartItemList);
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('addItemToCart: Rejected', action.payload);
      })
      // Handle updateItemQuantity
      .addCase(updateItemQuantity.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        console.log('updateItemQuantity: Pending');
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        const cartDTO = action.payload;
        const userCart = state.cartItemList.find((cart) => cart.userEmail === cartDTO.userEmail);
        if (userCart) {
          userCart.cart = Array.isArray(cartDTO.cartItems)
            ? cartDTO.cartItems.map(normalizeCartItem)
            : [];
        }
        console.log('updateItemQuantity: Fulfilled', state.cartItemList);
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('updateItemQuantity: Rejected', action.payload);
      })
      // Handle removeItemFromCart
      .addCase(removeItemFromCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        console.log('removeItemFromCart: Pending');
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        const cartDTO = action.payload;
        const userCart = state.cartItemList.find((cart) => cart.userEmail === cartDTO.userEmail);
        if (userCart) {
          userCart.cart = Array.isArray(cartDTO.cartItems)
            ? cartDTO.cartItems.map(normalizeCartItem)
            : [];
        }
        console.log('removeItemFromCart: Fulfilled', state.cartItemList);
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('removeItemFromCart: Rejected', action.payload);
      })
      // Handle clearCart
      .addCase(clearCart.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        console.log('clearCart: Pending');
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        const userEmail = action.payload;
        const userCart = state.cartItemList.find((cart) => cart.userEmail === userEmail);
        if (userCart) {
          userCart.cart = [];
        }
        console.log('clearCart: Fulfilled', state.cartItemList);
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('clearCart: Rejected', action.payload);
      })
      // Handle clearAllCarts
      .addCase(clearAllCarts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        console.log('clearAllCarts: Pending');
      })
      .addCase(clearAllCarts.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
        state.cartItemList = [];
        console.log('clearAllCarts: Fulfilled', state.cartItemList);
      })
      .addCase(clearAllCarts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('clearAllCarts: Rejected', action.payload);
      })
      // Handle fetchCartByUserEmail
      .addCase(fetchCartByUserEmail.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        console.log('fetchCartByUserEmail: Pending');
      })
      .addCase(fetchCartByUserEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        const cartDTO = action.payload;
        const userCart = state.cartItemList.find((cart) => cart.userEmail === cartDTO.userEmail);
        const normalizedCartItems = Array.isArray(cartDTO.cartItems)
          ? cartDTO.cartItems.map(normalizeCartItem)
          : [];
        if (userCart) {
          userCart.cart = normalizedCartItems;
        } else {
          state.cartItemList.push({
            userEmail: cartDTO.userEmail,
            cart: normalizedCartItems
          });
        }
        console.log('fetchCartByUserEmail: Fulfilled', state.cartItemList);
      })
      .addCase(fetchCartByUserEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        console.error('fetchCartByUserEmail: Rejected', action.payload);
      });
  }
});

export const { setTaxRate } = cartSlice.actions;

export default cartSlice.reducer;