import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Products from './components/Products';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import Toast from './components/Toast';
import { useEffect, useState } from 'react';
import ProductDetailPage from './components/ProductComponents/ProductDetail';
import CartPage from './components/CartComponents/Cart';
import OrderHistoryPage from './components/OrderComponent/OrderHistoryPage';
import OrderDetailPage from './components/OrderComponent/OrderDetailPage';
import SignUpForm from './components/SignUpForm';
import AdminDashboard from './components/AdminComponents/AdminDashboard';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchProducts } from './features/productSlice'

// Create a wrapper component to handle conditional rendering
function AppContent() {
  const [loginPage, setLoginPage] = useState(false);
  const [signUpPage, setSignUpPage] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success',
  });
  const [adminLogin, setAdminLogin] = useState(false);

  const location = useLocation(); // Get the current route
  const isAdminDashboard = location.pathname === '/adminDashboard'; // Check if the route is /adminDashboard

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message,
      type,
    });
  };

  const dispatch = useDispatch();

  const status = useSelector(store => store.products?.status || 'idle');
  useEffect(() => {
    // Only fetch if we haven't loaded products yet or if status is idle
    if (status === 'idle') {
      dispatch(fetchProducts());
      console.log("Products Fetched")
    }
  }, [dispatch, status]);
  

  const hideToast = () => {
    setToast((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  const favicon = document.getElementById('favicon');
  if (favicon) {
    favicon.href = 'VibeMart3.png';
  }

  // Handle backdrop click to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setLoginPage(false);
    }
  };

  return (
    <div>
      {/* Conditionally render Navbar */}
      {!isAdminDashboard && (
        <Navbar
          setLoginPage={setLoginPage}
          setSignUpPage={setSignUpPage}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          showToast={showToast}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderHistoryPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />
        <Route path="/adminDashboard" element={<AdminDashboard setAdminLogin={setAdminLogin} adminLogin={adminLogin} />} />
      </Routes>

      {/* Conditionally render Footer */}
      {!isAdminDashboard && <Footer />}

      {/* Login Form */}
      {loginPage && (
        <div className="backdrop-login" onClick={handleBackdropClick}>
          <LoginForm
            setLoginPage={setLoginPage}
            setSignUpPage={setSignUpPage}
            setIsLogin={setIsLogin}
            showToast={showToast}
            setAdminLogin={setAdminLogin}
          />
        </div>
      )}

      {/* SignUp Form */}
      {signUpPage && (
        <div className="backdrop-login" onClick={handleBackdropClick}>
          <SignUpForm
            setSignUpPage={setSignUpPage}
            showToast={showToast}
            setLoginPage={setLoginPage}
            setIsLogin={setIsLogin}
          />
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;