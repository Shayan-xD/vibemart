import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const userList = [{
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  password: "user1",
  image: "https://randomuser.me/api/portraits/men/10.jpg",
  shippingAddress: {
    addressLine1: "72 P, Model Town",
    addressLine2: "Near Central Park",
    city: "Lahore",
    state: "Punjab",
    postalCode: "54700",
    country: "Pakistan"
  }
}];

const initialState = {
  users: [],
  isAuthenticated: false,
  logInEmail: '',
  logInName: '',
  userImage : '',
  error: null
};

// Async thunks for API calls
export const fetchUsers = createAsyncThunk('user/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('http://localhost:8080/api/users');
    return response.data.length === 0 ? userList : response.data;
  } catch (error) {
    return rejectWithValue(userList); // Fallback to dummy data on error
  }
});

export const login = createAsyncThunk('user/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    console.log('📤 Sending login request to backend with:', { email, password });
    
    const response = await axios.post('http://localhost:8080/api/users/login', { email, password });
    
    console.log('📥 Backend response:', response.data);
    return response.data;
  } catch (error) {
    console.error('🚨 Login API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    return rejectWithValue(error.response?.data?.message || 'Invalid Email or Password');
  }
});

export const RegisterUser = createAsyncThunk('user/RegisterUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post('http://localhost:8080/api/users', userData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Email already exists');
  }
});

export const DeleteUser = createAsyncThunk('user/DeleteUser', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`http://localhost:8080/api/users/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'User not found');
  }
});

export const UpdateUser = createAsyncThunk('user/UpdateUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.put(`http://localhost:8080/api/users/${userData.id}`, userData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'User not found');
  }
});

export const UpdateUserName = createAsyncThunk(
  'user/UpdateUserName',
  async ({ email, newName }, { getState, rejectWithValue }) => {
    try {
      console.log("🔵 UpdateUserName called with:", { email, newName });

      const state = getState();
      
      // Find the user in Redux state to get their ID
      const user = state.users.users.find(user => user.email === email);
      if (!user) {
        throw new Error('User not found in Redux state');
      }
      
      if (!user.id) {
        throw new Error('User ID not available');
      }

      console.log("👤 Found user with ID:", user.id);

      const payload = { 
        name: newName,
        shippingAddress: user.shippingAddress 
      };
      
      console.log("📤 Sending PATCH request to backend...");

      const response = await axios.patch(
        `http://localhost:8080/api/users/${user.id}/name-address`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      console.log("✅ API Response:", response.data);

      return { 
        email, 
        newName: response.data.name, 
        shippingAddress: response.data.shippingAddress 
      };
    } catch (error) {
      console.error("❌ UpdateUserName Error:", error);
      console.error("Error response:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

export const UpdateShippingAddress = createAsyncThunk(
  'user/UpdateShippingAddress',
  async ({ email, shippingAddress }, { getState, rejectWithValue }) => {
    try {
      console.log("🔵 UpdateShippingAddress called with:", { email, shippingAddress });

      const state = getState();
      
      // Find the user in Redux state to get their ID
      const user = state.users.users.find(user => user.email === email);
      if (!user) {
        throw new Error('User not found in Redux state');
      }
      
      if (!user.id) {
        throw new Error('User ID not available');
      }

      console.log("👤 Found user with ID:", user.id);

      const payload = { 
        shippingAddress,
        name: user.name 
      };
      
      console.log("📤 Sending PATCH request to backend...");

      const response = await axios.patch(
        `http://localhost:8080/api/users/${user.id}/name-address`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      console.log("✅ API Response:", response.data);

      return { 
        email, 
        shippingAddress: response.data.shippingAddress, 
        newName: response.data.name 
      };
    } catch (error) {
      console.error("❌ UpdateShippingAddress Error:", error);
      console.error("Error response:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
  }
);

export const UpdateNameAndAddress = createAsyncThunk('user/UpdateNameAndAddress', async ({ email, name, shippingAddress }, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    
    // Find the user in Redux state to get their ID
    const user = state.users.users.find(user => user.email === email);
    if (!user) {
      throw new Error('User not found in Redux state');
    }
    
    if (!user.id) {
      throw new Error('User ID not available');
    }

    const response = await axios.patch(
      `http://localhost:8080/api/users/${user.id}/name-address`, 
      { name, shippingAddress }, 
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    
    return { 
      email, 
      name: response.data.name, 
      shippingAddress: response.data.shippingAddress 
    };
  } catch (error) {
    console.error("UpdateNameAndAddress Error:", error);
    return rejectWithValue(error.response?.data?.message || 'Update failed');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    LogOut(state) {
      state.isAuthenticated = false;
      state.logInEmail = '';
      state.logInName = '';
      state.userImage = '';
      state.error = null;
      localStorage.removeItem('token');
    },
    ClearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.logInEmail = action.payload.user.email;
        state.logInName = action.payload.user.name;
        state.userImage = action.payload.user.image;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
        
        // CRITICAL FIX: Add the logged-in user to the users array with their ID
        const userExists = state.users.some(user => user.id === action.payload.user.id);
        if (!userExists && action.payload.user.id) {
          state.users.push(action.payload.user);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.logInEmail = '';
        state.logInName = '';
        state.error = action.payload;
      })
      .addCase(RegisterUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(RegisterUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(DeleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
        state.error = null;
      })
      .addCase(DeleteUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(UpdateUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const userIndex = state.users.findIndex(user => user.id === updatedUser.id);
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser;
        } else {
          state.users.push(updatedUser);
        }
        if (state.logInEmail === updatedUser.email) {
          state.logInName = updatedUser.name;
        }
        state.error = null;
      })
      .addCase(UpdateUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(UpdateUserName.fulfilled, (state, action) => {
        const { email, newName, shippingAddress } = action.payload;
        const user = state.users.find(user => user.email === email);
        if (user) {
          user.name = newName;
          user.shippingAddress = shippingAddress; // Also update address to keep in sync
          if (state.logInEmail === email) {
            state.logInName = newName;
          }
          state.error = null;
        } else {
          state.error = 'User not found';
        }
      })
      .addCase(UpdateUserName.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(UpdateShippingAddress.fulfilled, (state, action) => {
        const { email, shippingAddress, newName } = action.payload;
        const user = state.users.find(user => user.email === email);
        if (user) {
          user.shippingAddress = shippingAddress;
          user.name = newName; // Also update name to keep in sync
          if (state.logInEmail === email) {
            state.logInName = newName;
          }
          state.error = null;
        } else {
          state.error = 'User not found';
        }
      })
      .addCase(UpdateShippingAddress.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(UpdateNameAndAddress.fulfilled, (state, action) => {
        const { email, name, shippingAddress } = action.payload;
        const user = state.users.find(user => user.email === email);
        if (user) {
          if (name) {
            user.name = name;
            if (state.logInEmail === email) {
              state.logInName = name;
            }
          }
          if (shippingAddress) {
            user.shippingAddress = shippingAddress;
          }
          state.error = null;
        } else {
          state.error = 'User not found';
        }
      })
      .addCase(UpdateNameAndAddress.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { LogOut, ClearError } = userSlice.actions;

export default userSlice.reducer;