import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addOrderNotification } from "./notificationSlice";

const initialState = {
  orders: [], // User-specific orders
  allOrders: [], // All orders
  loading: false,
  error: null,
};

// Async thunk for placing order with Stripe PaymentIntent
export const placeOrderAndNotify = createAsyncThunk(
  "orders/placeOrderAndNotify",
  async (orderData, { dispatch, rejectWithValue }) => {
    try {
      const { userEmail, cartItems, totalAmount, shippingAddress, currency } = orderData;

      // Basic validation
      if (!cartItems || cartItems.length === 0)
        throw new Error("Cannot place order with empty cart");

      if (
        !shippingAddress?.addressLine1 ||
        !shippingAddress?.city ||
        !shippingAddress?.state ||
        !shippingAddress?.postalCode ||
        !shippingAddress?.country
      )
        throw new Error("Please provide complete shipping address");

      if (!["USD", "PKR"].includes(currency))
        throw new Error("Invalid currency");

      // Step 1: Create order on the backend
      const orderPayload = {
        userEmail,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name || "Unknown Product",
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image || "https://via.placeholder.com/100",
        })),
        totalAmount: Number(totalAmount) || 0,
        currency,
        shippingAddress: {
          addressLine1: shippingAddress?.addressLine1 || "",
          addressLine2: shippingAddress?.addressLine2 || "",
          city: shippingAddress?.city || "",
          state: shippingAddress?.state || "",
          postalCode: shippingAddress?.postalCode || "",
          country: shippingAddress?.country || "",
        },
      };

      const orderResponse = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      let orderResult;
      try {
        orderResult = await orderResponse.json();
      } catch {
        const text = await orderResponse.text();
        return rejectWithValue(text || "Failed to create order");
      }

      if (!orderResponse.ok) {
        return rejectWithValue(orderResult?.message || "Failed to create order");
      }

      const orderId = orderResult.orderId;

      // Step 2: Create payment intent
      const paymentResponse = await fetch("http://localhost:8080/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: totalAmount,
          currency,
        }),
      });

      let paymentResult;
      try {
        paymentResult = await paymentResponse.json();
      } catch {
        const text = await paymentResponse.text();
        return rejectWithValue(text || "Failed to create payment intent");
      }

      if (!paymentResponse.ok) {
        return rejectWithValue(paymentResult?.message || "Failed to create payment intent");
      }

      // Add notification
      dispatch(
        addOrderNotification({
          userEmail,
          orderId,
          totalAmount,
          status: "pending",
          message: `Order #${orderId.slice(0, 8)} created. Awaiting payment confirmation.`,
        })
      );

      // Clear cart after order placement
      dispatch({ type: "cart/clearCart" });

      return { ...orderResult, clientSecret: paymentResult.clientSecret };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to place order");
    }
  }
);

// Async thunk for fetching orders by userEmail
export const fetchOrdersByUser = createAsyncThunk(
  "orders/fetchOrdersByUser",
  async (userEmail, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/user/${userEmail}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      let result;
      try {
        result = await response.json();
      } catch {
        const text = await response.text();
        return rejectWithValue(text || "Failed to fetch orders");
      }

      if (!response.ok) {
        return rejectWithValue(result?.message || "Failed to fetch orders");
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch orders");
    }
  }
);

// Async thunk for canceling an order
export const cancelOrderWithNotification = createAsyncThunk(
  "orders/cancelOrderWithNotification",
  async (orderId, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const order = state.orders.orders.find((o) => o.orderId === orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== "pending") {
        throw new Error("Only pending orders can be cancelled");
      }

      const response = await fetch(`http://localhost:8080/api/orders/${orderId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      let result;
      try {
        result = await response.json();
      } catch {
        const text = await response.text();
        return rejectWithValue(text || "Failed to cancel order");
      }

      if (!response.ok) {
        return rejectWithValue(result?.message || "Failed to cancel order");
      }

      // Add notification
      dispatch(
        addOrderNotification({
          userEmail: order.userEmail,
          orderId,
          totalAmount: order.totalAmount,
          status: "cancelled",
          message: `Order #${orderId.slice(0, 8)} cancelled`,
        })
      );

      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to cancel order");
    }
  }
);

// Async thunk for fetching all orders
export const fetchAllOrders = createAsyncThunk(
  "orders/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:8080/api/orders/getAllOrders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      let result;
      try {
        result = await response.json();
      } catch {
        const text = await response.text();
        return rejectWithValue(text || "Failed to fetch all orders");
      }

      if (!response.ok) {
        return rejectWithValue(result?.message || "Failed to fetch all orders");
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch all orders");
    }
  }
);

// Async thunk for updating order status
export const updateOrderStatusWithNotification = createAsyncThunk(
  "orders/updateOrderStatusWithNotification",
  async ({ orderId, status }, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState();
      const order = state.orders.allOrders.find((o) => o.orderId === orderId) || 
                   state.orders.orders.find((o) => o.orderId === orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status?status=${status}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      let result;
      try {
        result = await response.json();
      } catch {
        const text = await response.text();
        return rejectWithValue(text || "Failed to update order status");
      }

      if (!response.ok) {
        return rejectWithValue(result?.message || "Failed to update order status");
      }

      // Add notification
      dispatch(
        addOrderNotification({
          userEmail: order.userEmail,
          orderId,
          totalAmount: order.totalAmount,
          status,
          message: `Order #${orderId.slice(0, 8)} status updated to ${status}`,
        })
      );

      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update order status");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((o) => o.orderId === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        if (status === "confirmed" && order.paymentInfo) {
          order.paymentInfo.paid = true;
        }
      }
    },
    webhookOrderUpdate: (state, action) => {
      const { orderId, status, paymentInfo } = action.payload;
      const order = state.orders.find((o) => o.orderId === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        if (paymentInfo) {
          order.paymentInfo = { ...order.paymentInfo, ...paymentInfo };
        }
      }
    },
    syncOrderFromBackend: (state, action) => {
      const updatedOrder = action.payload;
      const index = state.orders.findIndex((o) => o.orderId === updatedOrder.orderId);
      if (index !== -1) {
        state.orders[index] = updatedOrder;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrderAndNotify.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrderAndNotify.fulfilled, (state, action) => {
        const { orderId, userEmail, items, totalAmount, currency, shippingAddress, paymentInfo, createdAt, updatedAt } = action.payload;

        const newOrder = {
          orderId,
          userEmail,
          items,
          totalAmount: Number(totalAmount) || 0,
          currency,
          shippingAddress,
          status: "pending",
          paymentInfo: {
            method: paymentInfo?.method || "Stripe",
            paymentIntentId: paymentInfo?.paymentIntentId || null,
            paid: paymentInfo?.paid || false,
          },
          createdAt: createdAt || new Date().toISOString(),
          updatedAt: updatedAt || new Date().toISOString(),
        };

        state.orders.push(newOrder);
        state.loading = false;
      })
      .addCase(placeOrderAndNotify.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to place order";
      })
      .addCase(fetchOrdersByUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByUser.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrdersByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })
      .addCase(cancelOrderWithNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrderWithNotification.fulfilled, (state, action) => {
        const order = state.orders.find((o) => o.orderId === action.payload.orderId);
        if (order) {
          order.status = action.payload.status;
          order.updatedAt = action.payload.updatedAt;
        }
        state.loading = false;
      })
      .addCase(cancelOrderWithNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to cancel order";
      })
      .addCase(updateOrderStatusWithNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusWithNotification.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        
        // Update in orders array (user-specific)
        const orderIndex = state.orders.findIndex((o) => o.orderId === updatedOrder.orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = { ...state.orders[orderIndex], ...updatedOrder };
        }
        
        // Update in allOrders array (admin view)
        const allOrderIndex = state.allOrders.findIndex((o) => o.orderId === updatedOrder.orderId);
        if (allOrderIndex !== -1) {
          state.allOrders[allOrderIndex] = { ...state.allOrders[allOrderIndex], ...updatedOrder };
        }
        
        state.loading = false;
      })
      .addCase(updateOrderStatusWithNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update order status";
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.allOrders = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch all orders";
      });
  },
});

export const { updateOrderStatus, webhookOrderUpdate, syncOrderFromBackend } = orderSlice.actions;
export default orderSlice.reducer;