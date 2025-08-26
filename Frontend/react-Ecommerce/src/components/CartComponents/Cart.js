import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import { removeItemFromCart, updateItemQuantity, fetchCartByUserEmail, clearCart } from "../../features/cartSlice";
import { reduceProductQuantity, increaseProductQuantity, fetchProducts } from "../../features/productSlice";
import { placeOrderAndNotify, fetchOrdersByUser } from "../../features/orderSlice"; // Added fetchOrdersByUser
import { UpdateUser } from "../../features/userSlice";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Toast from "../Toast.js";
import { Button, Card, TextInput, Select } from "flowbite-react";
import { HiOutlineTrash, HiPlus, HiMinus, HiLockClosed, HiShoppingBag, HiCreditCard, HiArchive, HiX } from "react-icons/hi";

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RynqpJMgS2d0LaxZbX0K4jUXtumcFaCTq5p27LPauqs0dt6cIOXA3d68qsnTpbCImeqt5sigEJ8qZWbRMzLdG4R00CnHZGoib');

// Animation variants (unchanged)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: -100,
    scale: 0.8,
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
  hover: {
    y: -2,
    boxShadow: "0 8px 25px rgba(75, 0, 130, 0.15)",
    transition: {
      duration: 0.2,
    },
  },
};

const quantityVariants = {
  initial: { scale: 1 },
  bounce: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const buttonVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: "0 8px 25px rgba(75, 0, 130, 0.25)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Stripe Payment Form Component
const StripePaymentForm = ({ 
  totalAmount, 
  userEmail, 
  cartItems, 
  shippingAddress, 
  dispatch, 
  setToast, 
  setIsProcessing, 
  setShowCheckoutModal, 
  currentUser, 
  navigate, 
  isProcessing 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  // Calculate total with shipping included for checkout
  const calculateCheckoutTotal = () => {
    const subtotal = parseFloat(totalAmount);
    const shipping = subtotal >= 16.67 ? 0 : 1.67;
    return (subtotal + shipping).toFixed(2);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty');
      }

      if (!currentUser) {
        throw new Error('Please log in to place an order');
      }

      const checkoutTotal = calculateCheckoutTotal();

      // Step 1: Use placeOrderAndNotify to create order and payment intent
      const orderData = {
        userEmail,
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          name: item.name || 'Unnamed Product',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image || 'https://via.placeholder.com/100'
        })),
        totalAmount: Number(checkoutTotal) || 0,
        currency: 'USD',
        shippingAddress: {
          addressLine1: shippingAddress.addressLine1 || '',
          addressLine2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          postalCode: shippingAddress.postalCode || '',
          country: shippingAddress.country || 'Pakistan'
        },
      };

      const resultAction = await dispatch(placeOrderAndNotify(orderData)).unwrap();
      const { clientSecret, orderId } = resultAction;

      // Step 2: Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: userEmail,
            address: {
              line1: shippingAddress.addressLine1,
              line2: shippingAddress.addressLine2 || '',
              city: shippingAddress.city,
              state: shippingAddress.state,
              postal_code: shippingAddress.postalCode,
              country: shippingAddress.country === 'Pakistan' ? 'PK' : shippingAddress.country,
            },
          },
        },
      });

      console.log("Payment confirmation:", { error, paymentIntentId: paymentIntent?.id, status: paymentIntent?.status });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Clear the cart
        await dispatch(clearCart(userEmail)).unwrap();

        // Update user shipping address if changed
        if (currentUser && JSON.stringify(currentUser.shippingAddress || {}) !== JSON.stringify(shippingAddress)) {
          dispatch(UpdateUser({
            id: currentUser.id,
            name: currentUser.name || '',
            email: currentUser.email || '',
            password: currentUser.password || '',
            image: currentUser.image || '',
            shippingAddress
          }));
        }

        // Add delay to allow webhook to process
        console.log("Payment succeeded, waiting 3 seconds for webhook to update order");
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Fetch updated orders with retry mechanism
        let updatedOrders;
        for (let attempt = 1; attempt <= 3; attempt++) {
          console.log(`Fetching orders, attempt ${attempt}`);
          updatedOrders = await dispatch(fetchOrdersByUser(userEmail)).unwrap();
          console.log("Fetched orders after payment:", updatedOrders);
          
          // Check if the order is updated to confirmed and paid
          const order = updatedOrders.find(o => o.orderId === orderId);
          if (order && order.status === 'confirmed' && order.paymentInfo.paid) {
            console.log(`Order ${orderId} confirmed and paid, proceeding`);
            break;
          }
          // Wait before retrying
          if (attempt < 3) {
            console.log(`Order ${orderId} not yet confirmed, retrying in 2 seconds`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        setToast({
          message: `Order #${orderId.slice(0, 8)} placed successfully!`,
          type: 'success',
          isVisible: true
        });

        setTimeout(() => {
          navigate('/orders');
        }, 2000);
      }
    } catch (error) {
      console.error("Payment error:", error.message);
      setToast({
        message: error.message || 'Payment failed. Please try again.',
        type: 'error',
        isVisible: true
      });
    } finally {
      setIsProcessing(false);
      setShowCheckoutModal(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const checkoutTotal = calculateCheckoutTotal();

  return (
    <div className="space-y-4">
      {/* Display shipping cost in checkout */}
      <div className="bg-blue-50 rounded-xl p-4 mb-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Final Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal + Tax:</span>
            <span>${totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>{parseFloat(totalAmount) >= 16.67 ? 'FREE' : '$1.67'}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-blue-200">
            <span>Total:</span>
            <span>${checkoutTotal}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          💳 Payment Details
        </h3>
        <div className="p-3 border border-gray-300 rounded-lg bg-white">
          <CardElement 
            options={cardElementOptions}
            onChange={handleCardChange}
          />
        </div>
        {cardError && (
          <p className="text-red-500 text-sm mt-2">{cardError}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 justify-center">
          <motion.button
            type="submit"
            disabled={isProcessing || !stripe || !cardComplete}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 font-semibold rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            variants={buttonVariants}
            whileHover={isProcessing ? {} : "hover"}
            whileTap={isProcessing ? {} : "tap"}
            aria-label="Complete payment"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Payment...
              </div>
            ) : (
              `Pay $${checkoutTotal}`
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

// CheckoutForm Component (unchanged)
const CheckoutForm = ({ 
  totalAmount, 
  userEmail, 
  cartItems, 
  shippingAddress, 
  setShippingAddress, 
  dispatch, 
  setToast, 
  setIsProcessing, 
  setShowCheckoutModal, 
  currentUser, 
  navigate, 
  isProcessing 
}) => {
  const [errors, setErrors] = useState({});
  const [isReviewing, setIsReviewing] = useState(true);

  const validateInputs = () => {
    const newErrors = {};
    if (!shippingAddress.addressLine1) newErrors.addressLine1 = 'Address Line 1 is required';
    if (!shippingAddress.city) newErrors.city = 'City is required';
    if (!shippingAddress.state) newErrors.state = 'Province/State is required';
    if (!shippingAddress.postalCode) newErrors.postalCode = 'Postal Code is required';
    if (!shippingAddress.country) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (validateInputs()) {
      setIsReviewing(false);
    } else {
      setToast({
        message: 'Please fix the errors in the form',
        type: 'error',
        isVisible: true
      });
    }
  };

  const handleSaveAddress = () => {
    if (!currentUser) {
      setToast({
        message: "Please log in to save a shipping address",
        type: "warning",
        isVisible: true
      });
      return;
    }
    dispatch(UpdateUser({
      id: currentUser.id || '',
      name: currentUser.name || '',
      email: currentUser.email || '',
      password: currentUser.password || '',
      image: currentUser.image || '',
      shippingAddress
    }));
    setToast({
      message: "Shipping address saved successfully!",
      type: "success",
      isVisible: true
    });
  };

  return (
    <div className="space-y-4">
      {isReviewing ? (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            📍 Review Shipping Address
          </h3>
          <TextInput
            name="addressLine1"
            value={shippingAddress.addressLine1}
            onChange={handleAddressChange}
            placeholder="Address Line 1"
            required
            className="w-full mb-2"
            helperText={errors.addressLine1 && <span className="text-red-500 text-xs">{errors.addressLine1}</span>}
          />
          <TextInput
            name="addressLine2"
            value={shippingAddress.addressLine2}
            onChange={handleAddressChange}
            placeholder="Address Line 2 (optional)"
            className="w-full mb-2"
          />
          <TextInput
            name="city"
            value={shippingAddress.city}
            onChange={handleAddressChange}
            placeholder="City"
            required
            className="w-full mb-2"
            helperText={errors.city && <span className="text-red-500 text-xs">{errors.city}</span>}
          />
          <TextInput
            name="state"
            value={shippingAddress.state}
            onChange={handleAddressChange}
            placeholder="Province/State"
            required
            className="w-full mb-2"
            helperText={errors.state && <span className="text-red-500 text-xs">{errors.state}</span>}
          />
          <TextInput
            name="postalCode"
            value={shippingAddress.postalCode}
            onChange={handleAddressChange}
            placeholder="Postal Code"
            required
            className="w-full mb-2"
            helperText={errors.postalCode && <span className="text-red-500 text-xs">{errors.postalCode}</span>}
          />
          <TextInput
            name="country"
            value={shippingAddress.country}
            onChange={handleAddressChange}
            placeholder="Country"
            required
            disabled
            className="w-full mb-2"
            helperText={errors.country && <span className="text-red-500 text-xs">{errors.country}</span>}
          />
          <Button
            onClick={handleSaveAddress}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 mb-2"
            size="sm"
          >
            Save Address
          </Button>
          <motion.button
            onClick={handleReviewSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl mt-2"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Proceed to payment"
          >
            Proceed to Payment
          </motion.button>
        </div>
      ) : (
        <Elements stripe={stripePromise}>
          <StripePaymentForm
            totalAmount={totalAmount}
            userEmail={userEmail}
            cartItems={cartItems}
            shippingAddress={shippingAddress}
            dispatch={dispatch}
            setToast={setToast}
            setIsProcessing={setIsProcessing}
            setShowCheckoutModal={setShowCheckoutModal}
            currentUser={currentUser}
            navigate={navigate}
            isProcessing={isProcessing}
          />
        </Elements>
      )}
    </div>
  );
};

// Rest of CartPage.js remains unchanged
export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Helper function
  const normalizeProductId = (id) => {
    if (typeof id === 'string') return id;
    if (typeof id === 'number') return id.toString();
    return String(id);
  };

  // Redux state selectors with defensive checks
  const userEmail = useSelector((state) => state.users?.logInEmail || "");
  const isAuthenticated = useSelector((state) => state.users?.isAuthenticated || false);
  const cartItemList = useSelector((state) => state.cart?.cartItemList || []);
  const taxRate = useSelector((state) => state.cart?.taxRate || 0);
  const { loading: orderLoading, error: orderError } = useSelector((state) => state.orders || { loading: false, error: null });
  const currentUser = useSelector((state) => state.users?.users?.find((u) => u.email === state.users?.logInEmail) || null);
  const products = useSelector((state) => state.products?.productList || []);

  // Get current cart
  const currentCart = cartItemList.find((cart) => cart.userEmail === userEmail);
  const cartItems = currentCart ? currentCart.cart : [];

  // State management
  const [toast, setToast] = useState({ message: "", type: "", isVisible: false });
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(
    currentUser?.shippingAddress || {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Pakistan'
    }
  );

  // Effects
  useEffect(() => {
    document.title = "VibeMart - Shopping Bag";
    window.scrollTo(0, 0);
    dispatch(fetchCartByUserEmail(userEmail));
    dispatch(fetchProducts({ forceFetch: true }));
  }, [dispatch, userEmail]);

  useEffect(() => {
    if (!isAuthenticated) {
      setToast({
        message: "Please log in to view your cart",
        type: "warning",
        isVisible: true,
      });
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (orderError) {
      setToast({
        message: orderError,
        type: "error",
        isVisible: true
      });
    }
  }, [orderError]);

  useEffect(() => {
    if (currentUser) {
      setShippingAddress(currentUser.shippingAddress || {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Pakistan'
      });
    }
  }, [currentUser]);

  // Get product stock function
  const getProductStock = (productId) => {
    const normalizedId = normalizeProductId(productId);
    const product = products.find(p => {
      const pId = p._id || p.id;
      return normalizeProductId(pId) === normalizedId;
    });
    console.log('getProductStock:', { 
      productId, 
      normalizedId,
      foundProduct: product, 
      stock: product?.stockQuantity || 0
    });
    return product ? (product.stockQuantity || 0) : 0;
  };

  const handleRemoveItem = debounce(async (productId, quantity) => {
    console.log('handleRemoveItem: Starting', { productId, quantity });
    const normalizedId = normalizeProductId(productId);
    
    try {
      await dispatch(removeItemFromCart({ userEmail, productId })).unwrap();
      await dispatch(increaseProductQuantity({ 
        productId: String(productId), 
        quantity 
      })).unwrap();
      await dispatch(fetchProducts({ forceFetch: true }));
      setToast({ 
        message: "Item removed from cart!", 
        type: "success", 
        isVisible: true 
      });
      console.log('handleRemoveItem: Completed', { productId, quantity });
    } catch (error) {
      console.error('handleRemoveItem: Error', error);
      setToast({
        message: error.message || 'Failed to remove item from cart',
        type: 'error',
        isVisible: true
      });
    }
  }, 300);

  const handleUpdateQuantity = debounce(async (productId, currentQuantity, newQuantity) => {
    console.log('handleUpdateQuantity: Starting', { productId, currentQuantity, newQuantity });
    const normalizedId = normalizeProductId(productId);
    
    try {
      await dispatch(fetchProducts({ forceFetch: true }));
      const stock = getProductStock(productId);
      console.log('handleUpdateQuantity: Current stock', { productId, stock, currentQuantity, newQuantity });
      
      if (newQuantity < 0) return;
      
      if (newQuantity > currentQuantity) {
        const additionalQuantityNeeded = newQuantity - currentQuantity;
        if (additionalQuantityNeeded > stock) {
          setToast({
            message: `Only ${stock} more items available in stock! (Current in cart: ${currentQuantity})`,
            type: "warning",
            isVisible: true
          });
          return;
        }
        await dispatch(reduceProductQuantity({ 
          productId: String(productId), 
          quantity: additionalQuantityNeeded 
        })).unwrap();
      } else if (newQuantity < currentQuantity) {
        await dispatch(increaseProductQuantity({ 
          productId: String(productId), 
          quantity: currentQuantity - newQuantity 
        })).unwrap();
      }
      
      await dispatch(updateItemQuantity({ 
        userEmail, 
        productId, 
        quantity: newQuantity 
      })).unwrap();
      
      await dispatch(fetchProducts({ forceFetch: true }));
      setToast({ 
        message: "Quantity updated!", 
        type: "success", 
        isVisible: true 
      });
      console.log('handleUpdateQuantity: Completed', { productId, newQuantity });
    } catch (error) {
      console.error('handleUpdateQuantity: Error', error);
      setToast({
        message: error.message || 'Failed to update quantity',
        type: 'error',
        isVisible: true
      });
    }
  }, 300);

  const handleAddressChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveAddress = () => {
    if (!currentUser) {
      setToast({
        message: "Please log in to save a shipping address",
        type: "warning",
        isVisible: true
      });
      return;
    }
    dispatch(UpdateUser({
      id: currentUser.id || '',
      name: currentUser.name || '',
      email: currentUser.email || '',
      password: currentUser.password || '',
      image: currentUser.image || '',
      shippingAddress
    }));
    setToast({
      message: "Shipping address updated successfully!",
      type: "success",
      isVisible: true
    });
  };

  // Calculation functions
  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
      .toFixed(2);
  };

  const calculateTax = () => {
    return (
      cartItems.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0) *
      (Number(taxRate) || 0)
    ).toFixed(2);
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const tax = parseFloat(calculateTax());
    return (subtotal + tax).toFixed(2);
  };

  // Checkout handler
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setToast({
        message: "Your cart is empty",
        type: "warning",
        isVisible: true
      });
      return;
    }
    if (!isAuthenticated) {
      setToast({
        message: "Please log in to proceed to checkout",
        type: "warning",
        isVisible: true
      });
      navigate("/login");
      return;
    }
    if (!shippingAddress.addressLine1 || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      setToast({
        message: "Please complete all required shipping address fields",
        type: "warning",
        isVisible: true
      });
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleApplyPromo = () => {
    if (promoCode) {
      setToast({ 
        message: "Promo code applied!", 
        type: "success", 
        isVisible: true 
      });
    } else {
      setToast({
        message: "Please enter a valid promo code",
        type: "warning",
        isVisible: true,
      });
    }
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  // Render functions
  const renderCartItems = () => {
    return (
      <div className="space-y-4">
        {cartItems.map((item, index) => {
          const currentStock = getProductStock(item.productId);
          const currentQuantity = Number(item.quantity) || 1;
          const isOutOfStock = currentStock === 0;
          const canIncrease = currentQuantity < currentStock;
          
          console.log('Rendering cart item:', { 
            itemId: item.productId, 
            currentStock, 
            currentQuantity, 
            isOutOfStock, 
            canIncrease 
          });
          
          return (
            <motion.div
              key={`${item.productId}-${index}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover="hover"
              custom={index}
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <motion.div
                  className="relative overflow-hidden rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={item.image || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className="w-24 h-24 object-cover"
                    loading="lazy"
                  />
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">OUT OF STOCK</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
                </motion.div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.name || 'Unnamed Product'}
                  </h3>
                  <p className="text-2xl font-bold text-[#4B0082]">
                    ${Number(item.price).toFixed(2)}
                  </p>
                  <p className={`text-sm ${isOutOfStock ? 'text-red-500' : 'text-gray-500'}`}>
                    {isOutOfStock ? 'Out of stock' : `${currentStock} available`}
                  </p>
                </div>

                <motion.div
                  variants={quantityVariants}
                  animate={item.quantity ? "bounce" : "initial"}
                  key={`quantity-${item.productId}`}
                  className="flex items-center gap-3 bg-gray-50 rounded-full p-2"
                >
                  <motion.button
                    onClick={() => handleUpdateQuantity(item.productId, currentQuantity, currentQuantity - 1)}
                    className="w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center text-gray-600 hover:text-[#4B0082] transition-all duration-200"
                    disabled={currentQuantity <= 1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Decrease quantity of ${item.name || 'item'}`}
                  >
                    <HiMinus className="w-4 h-4" />
                  </motion.button>
                  
                  <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-center">
                    {currentQuantity}
                  </span>
                  
                  <motion.button
                    onClick={() => handleUpdateQuantity(item.productId, currentQuantity, currentQuantity + 1)}
                    className="w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md flex items-center justify-center text-gray-600 hover:text-[#4B0082] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canIncrease}
                    whileHover={canIncrease ? { scale: 1.1 } : {}}
                    whileTap={canIncrease ? { scale: 0.95 } : {}}
                    aria-label={`Increase quantity of ${item.name || 'item'}`}
                  >
                    <HiPlus className="w-4 h-4" />
                  </motion.button>
                </motion.div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${(Number(item.price) * currentQuantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                  
                  <motion.button
                    onClick={() => handleRemoveItem(item.productId, currentQuantity)}
                    className="w-12 h-12 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 hover:text-red-700 transition-all duration-200"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Remove ${item.name || 'item'} from cart`}
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Main render
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 pt-40 sm:pt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ paddingTop: "120px" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-6">
            <HiShoppingBag className="w-8 h-8 text-[#4B0082]" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#4B0082] to-[#3B0062] bg-clip-text text-transparent" style={{ paddingBottom: "5px" }}>
              Shopping Bag
            </h1>
          </div>
          {cartItems.length > 0 && (
            <p className="text-gray-600">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <motion.div
                className="bg-white rounded-2xl p-12 text-center shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HiShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-8">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      onClick={() => navigate("/products")}
                      className="bg-gradient-to-r from-[#4B0082] to-[#3B0062] text-white px-8 py-4 text-lg font-semibold rounded-xl"
                      aria-label="Start shopping"
                    >
                      Start Shopping
                    </Button>
                  </motion.div>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      onClick={handleViewOrders}
                      className="bg-white text-[#4B0082] border border-[#4B0082] hover:bg-purple-50 px-8 py-4 text-lg font-semibold rounded-xl"
                      aria-label="View previous orders"
                    >
                      <HiArchive className="mr-2 h-5 w-5" />
                      View Previous Orders
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              renderCartItems()
            )}
          </div>

          {/* Order Summary Section */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white rounded-2xl p-6 shadow-lg sticky top-32"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <HiLockClosed className="w-6 h-6 text-green-500" />
                  Order Summary
                </h2>

                {/* Shipping Address */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                  <div className="space-y-2">
                    <TextInput
                      name="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleAddressChange}
                      placeholder="Address Line 1"
                      className="w-full text-sm"
                    />
                    <TextInput
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleAddressChange}
                      placeholder="Address Line 2 (optional)"
                      className="w-full text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        className="w-full text-sm"
                      />
                      <TextInput
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        className="w-full text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleAddressChange}
                        placeholder="Postal Code"
                        className="w-full text-sm"
                      />
                      <TextInput
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleAddressChange}
                        placeholder="Country"
                        disabled
                        className="w-full text-sm"
                      />
                    </div>
                    <Button
                      onClick={handleSaveAddress}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 mt-2"
                      size="sm"
                    >
                      Save Address
                    </Button>
                  </div>
                </div>

                {/* Payment Method Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-500">💳</span>
                    <p className="font-semibold text-blue-800">Stripe Payment</p>
                  </div>
                  <p className="text-blue-700 text-sm">Secure payment with credit/debit cards via Stripe</p>
                </div>

                {/* Order Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%)</span>
                    <span className="font-semibold">${calculateTax()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[#4B0082] pt-3 border-t">
                    <span>Total</span>
                    <span>${calculateTotal()}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <span className="font-medium">Note:</span> Shipping cost ($1.67 or FREE for orders ≥ $16.67) will be calculated at checkout.
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <TextInput
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0 || !isAuthenticated}
                    className="w-full bg-gradient-to-r from-[#4B0082] to-[#3B0062] hover:from-[#5A00A3] hover:to-[#4A0082] text-white py-4 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Proceed to checkout"
                  >
                    <HiCreditCard className="mr-2 h-6 w-6" />
                    Proceed to Checkout
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCheckoutModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isProcessing}
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>

                <CheckoutForm
                  totalAmount={calculateTotal()}
                  userEmail={userEmail}
                  cartItems={cartItems}
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  dispatch={dispatch}
                  setToast={setToast}
                  setIsProcessing={setIsProcessing}
                  setShowCheckoutModal={setShowCheckoutModal}
                  currentUser={currentUser}
                  navigate={navigate}
                  isProcessing={isProcessing}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      </div>
    </motion.div>
  );
}