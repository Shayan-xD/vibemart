import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/sellers'; // Adjust to your backend URL

// Async thunk for fetching all sellers
export const fetchSellers = createAsyncThunk('sellerList/fetchSellers', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

// Async thunk for adding a seller
export const AddSeller = createAsyncThunk('sellerList/addSeller', async (sellerData, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_URL, sellerData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add seller');
  }
});

// Async thunk for updating a seller
export const UpdateSeller = createAsyncThunk('sellerList/updateSeller', async ({ id, sellerData }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, sellerData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update seller');
  }
});

// Async thunk for deleting a seller
export const deleteSeller = createAsyncThunk('sellerList/deleteSeller', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete seller');
  }
});

const initialState = {
  sellerList: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const sellerSlice = createSlice({
  name: 'sellerList',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch sellers
    builder
      .addCase(fetchSellers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSellers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sellerList = action.payload;
      })
      .addCase(fetchSellers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch sellers';
      });

    // Add seller
    builder
      .addCase(AddSeller.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(AddSeller.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sellerList.push(action.payload);
      })
      .addCase(AddSeller.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        alert(action.payload);
      });

    // Update seller
    builder
      .addCase(UpdateSeller.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(UpdateSeller.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedSeller = action.payload;
        const index = state.sellerList.findIndex((s) => s.id === updatedSeller.id);
        if (index !== -1) {
          state.sellerList[index] = updatedSeller;
        }
      })
      .addCase(UpdateSeller.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        alert(action.payload);
      });

    // Delete seller
    builder
      .addCase(deleteSeller.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteSeller.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.sellerList = state.sellerList.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteSeller.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        alert(action.payload);
      });
  },
});

export default sellerSlice.reducer;