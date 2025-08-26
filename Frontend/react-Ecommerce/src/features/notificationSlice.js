import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const { type, title, message, userEmail, data } = action.payload;
      const notification = {
        id: nanoid(),
        type, // 'order', 'cart', 'info', 'success', 'warning', 'error'
        title,
        message,
        userEmail,
        data: data || {},
        read: false,
        createdAt: new Date().toISOString(),
      };
      
      // Add to beginning of array (newest first)
      state.notifications.unshift(notification);
      state.unreadCount += 1;

      // Keep only last 100 notifications to prevent memory issues
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },

    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state, action) => {
      const userEmail = action.payload;
      state.notifications.forEach(notification => {
        if (notification.userEmail === userEmail && !notification.read) {
          notification.read = true;
        }
      });
      state.unreadCount = 0;
    },

    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    clearUserNotifications: (state, action) => {
      const userEmail = action.payload;
      const userNotifications = state.notifications.filter(n => n.userEmail === userEmail);
      const unreadUserNotifications = userNotifications.filter(n => !n.read);
      
      state.notifications = state.notifications.filter(n => n.userEmail !== userEmail);
      state.unreadCount = Math.max(0, state.unreadCount - unreadUserNotifications.length);
    },

    // Helper action to create order notifications
    addOrderNotification: (state, action) => {
      const { userEmail, orderId, totalAmount, status } = action.payload;
      
      let title, message;
      switch (status) {
        case 'placed':
          title = '🎉 Order Placed Successfully!';
          message = `Your order #${orderId} for $${totalAmount} has been placed successfully.`;
          break;
        case 'processing':
          title = '⚙️ Order Processing';
          message = `Your order #${orderId} is now being processed.`;
          break;
        case 'shipped':
          title = '🚚 Order Shipped';
          message = `Your order #${orderId} has been shipped and is on the way!`;
          break;
        case 'delivered':
          title = '✅ Order Delivered';
          message = `Your order #${orderId} has been delivered successfully.`;
          break;
        case 'cancelled':
          title = '❌ Order Cancelled';
          message = `Your order #${orderId} has been cancelled.`;
          break;
        default:
          title = '📦 Order Update';
          message = `Your order #${orderId} status has been updated.`;
      }

      const notification = {
        id: nanoid(),
        type: 'order',
        title,
        message,
        userEmail,
        data: { orderId, totalAmount, status },
        read: false,
        createdAt: new Date().toISOString(),
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    // Helper action to create cart notifications
    addCartNotification: (state, action) => {
      const { userEmail, productName, action: cartAction, quantity } = action.payload;
      
      let title, message;
      switch (cartAction) {
        case 'added':
          title = '🛒 Added to Cart';
          message = `${productName} has been added to your cart.`;
          break;
        case 'updated':
          title = '🔄 Cart Updated';
          message = `${productName} quantity updated to ${quantity}.`;
          break;
        case 'removed':
          title = '🗑️ Removed from Cart';
          message = `${productName} has been removed from your cart.`;
          break;
        default:
          title = '🛒 Cart Update';
          message = `Your cart has been updated.`;
      }

      const notification = {
        id: nanoid(),
        type: 'cart',
        title,
        message,
        userEmail,
        data: { productName, action: cartAction, quantity },
        read: false,
        createdAt: new Date().toISOString(),
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearUserNotifications,
  addOrderNotification,
  addCartNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;

//Backend Connected Notifications
// Backend Connected Notifications
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // Base URL for the backend API
// const API_BASE_URL = "http://localhost:8080/api/notifications";

// // Async thunk to add a notification
// export const addNotification = createAsyncThunk(
//   "notifications/addNotification",
//   async (notification, { rejectWithValue }) => {
//     try {
//       const response = await fetch(API_BASE_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(notification),
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return await response.json();
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Async thunk to add an order notification
// export const addOrderNotification = createAsyncThunk(
//   "notifications/addOrderNotification",
//   async (orderData, { rejectWithValue }) => {
//     try {
//       const { userEmail, orderId, totalAmount, status } = orderData;
      
//       let title, message;
//       switch (status) {
//         case 'placed':
//           title = '🎉 Order Placed Successfully!';
//           message = `Your order #${orderId} for $${totalAmount} has been placed successfully.`;
//           break;
//         case 'processing':
//           title = '⚙️ Order Processing';
//           message = `Your order #${orderId} is now being processed.`;
//           break;
//         case 'shipped':
//           title = '🚚 Order Shipped';
//           message = `Your order #${orderId} has been shipped and is on the way!`;
//           break;
//         case 'delivered':
//           title = '✅ Order Delivered';
//           message = `Your order #${orderId} has been delivered successfully.`;
//           break;
//         case 'cancelled':
//           title = '❌ Order Cancelled';
//           message = `Your order #${orderId} has been cancelled.`;
//           break;
//         default:
//           title = '📦 Order Update';
//           message = `Your order #${orderId} status has been updated.`;
//       }

//       const notification = {
//         type: 'order',
//         title,
//         message,
//         userEmail,
//         data: { orderId, totalAmount, status },
//         read: false,
//         createdAt: new Date().toISOString(),
//       };

//       const response = await fetch(API_BASE_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(notification),
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return await response.json();
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Async thunk to add a cart notification
// export const addCartNotification = createAsyncThunk(
//   "notifications/addCartNotification",
//   async (cartData, { rejectWithValue }) => {
//     try {
//       const { userEmail, productName, action: cartAction, quantity } = cartData;
      
//       let title, message;
//       switch (cartAction) {
//         case 'added':
//           title = '🛒 Added to Cart';
//           message = `${productName} has been added to your cart.`;
//           break;
//         case 'updated':
//           title = '🔄 Cart Updated';
//           message = `${productName} quantity updated to ${quantity}.`;
//           break;
//         case 'removed':
//           title = '🗑️ Removed from Cart';
//           message = `${productName} has been removed from your cart.`;
//           break;
//         default:
//           title = '🛒 Cart Update';
//           message = `Your cart has been updated.`;
//       }

//       const notification = {
//         type: 'cart',
//         title,
//         message,
//         userEmail,
//         data: { productName, action: cartAction, quantity },
//         read: false,
//         createdAt: new Date().toISOString(),
//       };

//       const response = await fetch(API_BASE_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(notification),
//       });
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return await response.json();
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Async thunk to fetch user notifications
// export const fetchUserNotifications = createAsyncThunk(
//   "notifications/fetchUserNotifications",
//   async (userEmail, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/user/${userEmail}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return await response.json();
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Async thunk to mark a notification as read
// export const markAsRead = createAsyncThunk(
//   "notifications/markAsRead",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/${id}/read`, {
//         method: "PATCH",
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return id; // Return the ID for state update
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Async thunk to mark all notifications as read for a user
// export const markAllAsRead = createAsyncThunk(
//   "notifications/markAllAsRead",
//   async (userEmail, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/user/${userEmail}/read-all`, {
//         method: "PATCH",
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return userEmail; // Return userEmail for state update
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Async thunk to remove a notification
// export const removeNotification = createAsyncThunk(
//   "notifications/removeNotification",
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/${id}`, {
//         method: "DELETE",
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return id; // Return the ID for state update
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// // Async thunk to clear all user notifications
// export const clearUserNotifications = createAsyncThunk(
//   "notifications/clearUserNotifications",
//   async (userEmail, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/user/${userEmail}`, {
//         method: "DELETE",
//       });
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       return userEmail; // Return userEmail for state update
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// const initialState = {
//   notifications: [],
//   unreadCount: 0,
//   status: "idle", // idle | loading | succeeded | failed
//   error: null,
// };

// const notificationSlice = createSlice({
//   name: "notifications",
//   initialState,
//   reducers: {
//     // Optional: Reset state if needed
//     resetNotifications: (state) => {
//       state.notifications = [];
//       state.unreadCount = 0;
//       state.status = "idle";
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     // Add Notification
//     builder
//       .addCase(addNotification.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(addNotification.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.notifications.unshift(action.payload);
//         state.unreadCount += action.payload.read ? 0 : 1;
//         if (state.notifications.length > 100) {
//           state.notifications = state.notifications.slice(0, 100);
//         }
//       })
//       .addCase(addNotification.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       });

//     // Add Order Notification
//     builder
//       .addCase(addOrderNotification.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(addOrderNotification.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.notifications.unshift(action.payload);
//         state.unreadCount += action.payload.read ? 0 : 1;
//         if (state.notifications.length > 100) {
//           state.notifications = state.notifications.slice(0, 100);
//         }
//       })
//       .addCase(addOrderNotification.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       });

//     // Add Cart Notification
//     builder
//       .addCase(addCartNotification.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(addCartNotification.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.notifications.unshift(action.payload);
//         state.unreadCount += action.payload.read ? 0 : 1;
//         if (state.notifications.length > 100) {
//           state.notifications = state.notifications.slice(0, 100);
//         }
//       })
//       .addCase(addCartNotification.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       });

//     // Fetch User Notifications
//     builder
//       .addCase(fetchUserNotifications.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(fetchUserNotifications.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.notifications = action.payload;
//         state.unreadCount = action.payload.filter((n) => !n.read).length;
//       })
//       .addCase(fetchUserNotifications.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       });

//     // Mark As Read
//     builder
//       .addCase(markAsRead.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(markAsRead.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         const notification = state.notifications.find((n) => n.id === action.payload);
//         if (notification && !notification.read) {
//           notification.read = true;
//           state.unreadCount = Math.max(0, state.unreadCount - 1);
//         }
//       })
//       .addCase(markAsRead.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       });

//     // Mark All As Read
//     builder
//       .addCase(markAllAsRead.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(markAllAsRead.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.notifications.forEach((notification) => {
//           if (notification.userEmail === action.payload && !notification.read) {
//             notification.read = true;
//           }
//         });
//         state.unreadCount = 0;
//       })
//       .addCase(markAllAsRead.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       });

//     // Remove Notification
//     builder
//       .addCase(removeNotification.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(removeNotification.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         const index = state.notifications.findIndex((n) => n.id === action.payload);
//         if (index !== -1) {
//           const notification = state.notifications[index];
//           if (!notification.read) {
//             state.unreadCount = Math.max(0, state.unreadCount - 1);
//           }
//           state.notifications.splice(index, 1);
//         }
//       })
//       .addCase(removeNotification.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       });

//     // Clear User Notifications
//     builder
//       .addCase(clearUserNotifications.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(clearUserNotifications.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         const userNotifications = state.notifications.filter(
//           (n) => n.userEmail === action.payload
//         );
//         const unreadUserNotifications = userNotifications.filter((n) => !n.read);
//         state.notifications = state.notifications.filter(
//           (n) => n.userEmail !== action.payload
//         );
//         state.unreadCount = Math.max(0, state.unreadCount - unreadUserNotifications.length);
//       })
//       .addCase(clearUserNotifications.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload;
//       });
//   },
// });

// export const { resetNotifications } = notificationSlice.actions;

// export default notificationSlice.reducer;