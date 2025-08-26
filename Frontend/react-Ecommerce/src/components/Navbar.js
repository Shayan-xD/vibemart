//Best Nvabar version - (8-21-2004)
import React, { useState, useEffect } from 'react';
import '../style/navbar2.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaBell, FaUser, FaEdit, FaMapMarkerAlt, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { Button, Typography, Dropdown, Avatar, List, Empty, Modal, Input, Form, message } from 'antd';
import { UserOutlined, ShoppingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, UpdateUserName, UpdateShippingAddress} from '../features/userSlice';
import { markAsRead, markAllAsRead, removeNotification } from '../features/notificationSlice';
import { motion, AnimatePresence } from 'framer-motion';

const { Text } = Typography;

// Animation variants
const bounceAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.3, 1],
    rotate: [0, -10, 10, -10, 0],
    transition: { 
      duration: 0.6,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const notificationItemVariants = {
  hidden: { opacity: 0, x: 50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    x: -50, 
    scale: 0.9,
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeOut" }
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" }
  }
};

function Navbar({ setLoginPage, isLogin, setIsLogin, showToast, setSignUpPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartAnimation, setCartAnimation] = useState(false);
  const [notificationAnimation, setNotificationAnimation] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux selectors
  const logInEmail = useSelector(state => state.users?.logInEmail);
  const logInName = useSelector(state => state.users?.logInName);
  const cartItemList = useSelector(state => state.cart?.cartItemList || []);
  const notifications = useSelector(state => 
    state.notifications?.notifications?.filter(n => n.userEmail === logInEmail) || []
  );
  const unreadNotificationCount = useSelector(state => 
    state.notifications?.notifications?.filter(n => n.userEmail === logInEmail && !n.read).length || 0
  );

  // Get current user data
  const users = useSelector(state => state.users?.users || []);
  const currentUser = users.find(user => user.email === logInEmail);

  // Get current user's cart
  const currentCart = cartItemList.find(cart => cart.userEmail === logInEmail);
  const cartItems = currentCart ? currentCart.cart : [];
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const [emailToShow, setEmailToShow] = useState(null);
  const [prevCartCount, setPrevCartCount] = useState(0);
  const [prevNotificationCount, setPrevNotificationCount] = useState(0);

  useEffect(() => {
    if (isLogin && logInName) {
      setEmailToShow(logInName);
    } else {
      setEmailToShow(null);
    }
  }, [isLogin, logInName]);

  const {loginInEmail} = useSelector(store=>store=>users);

  useEffect(() => {
    let timeoutId;
    if (isMenuOpen) {
      setShowDropdown(true);
    } else {
      timeoutId = setTimeout(() => setShowDropdown(false), 300);
    }
    return () => clearTimeout(timeoutId);
  }, [isMenuOpen]);

  // Cart count animation trigger
  useEffect(() => {
    if (cartCount > prevCartCount && prevCartCount > 0) {
      setCartAnimation(true);
      setTimeout(() => setCartAnimation(false), 600);
    }
    setPrevCartCount(cartCount);
  }, [cartCount, prevCartCount]);

  // Notification animation trigger
  useEffect(() => {
    if (unreadNotificationCount > prevNotificationCount && prevNotificationCount >= 0) {
      setNotificationAnimation(true);
      setTimeout(() => setNotificationAnimation(false), 600);
    }
    setPrevNotificationCount(unreadNotificationCount);
  }, [unreadNotificationCount, prevNotificationCount]);

  // Navigation helper for categories
  const goToProducts = (category, subCategory = null) => {
    navigate('/products', { state: { category, subCategory } });
  };

const handleLogOut = () => {

  const confirmVal = window.confirm("Are you sure you want to logOut?")

  if(confirmVal){
    dispatch(LogOut());
    setIsLogin(false);
    setIsProfileDropdownOpen(false);
    showToast("Logged out successfully!","info");
    navigate('/');
    return;
  }
  return;
  
};

  // Handle cart icon click
  const handleCartClick = () => {
    if (isLogin) {
      navigate('/cart');
    } else {
      if (showToast) {
        showToast("Please log in to view your cart", 'warning');
      }
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
    
    switch (notification.type) {
      case 'order':
        navigate('/orders');
        break;
      case 'cart':
        navigate('/cart');
        break;
      default:
        break;
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead(logInEmail));
  };

  // Handle edit name modal
  const handleEditName = () => {
    form.setFieldsValue({ name: logInName });
    setIsEditModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  // Handle edit address modal
  const handleEditAddress = () => {
    if (currentUser?.shippingAddress) {
      addressForm.setFieldsValue(currentUser.shippingAddress);
    }
    setIsAddressModalOpen(true);
    setIsProfileDropdownOpen(false);
  };

  // Handle name update
  // const handleNameUpdate = async (values) => {
  //   try {
  //      dispatch(UpdateNameAndAddress({ 
  //       email: logInEmail, 
  //       name: values.name 
  //     }));
  //     setIsEditModalOpen(false);
  //     if (showToast) {
  //       showToast("Name updated successfully!", 'success');
  //     }
  //   } catch (error) {
  //     if (showToast) {
  //       showToast("Failed to update name", 'error');
  //     }
  //   }
  // };

  // // Handle address update
  // const handleAddressUpdate = async (values) => {
  //   try {
  //     dispatch(UpdateNameAndAddress({ 
  //       email: logInEmail, 
  //       shippingAddress: values 
  //     }));
  //     setIsAddressModalOpen(false);
  //     if (showToast) {
  //       showToast("Address updated successfully!", 'success');
  //     }
  //   } catch (error) {
  //     if (showToast) {
  //       showToast("Failed to update address", 'error');
  //     }
  //   }
  // };

  // Handle name update - FIXED VERSION
  const handleNameUpdate = async (values) => {
    console.log("🔍 handleNameUpdate called with values:", values);
    console.log("📧 Email being sent:", logInEmail);

    try {
      // ✅ Add .unwrap() to properly handle the async action
      await dispatch(UpdateUserName({ 
        email: logInEmail, 
        newName: values.name  // ✅ Fixed parameter name (should be newName, not name)
      })).unwrap();   // ← .unwrap() is CRITICAL here

      console.log("✅ Name update dispatched successfully");
      setIsEditModalOpen(false);
      
      if (showToast) {
        showToast("Name updated successfully!", 'success');
      }
    } catch (error) {
      console.error("❌ Error in handleNameUpdate:", error);
      if (showToast) {
        showToast(error || "Failed to update name", 'error');
      }
    }
  };

  // Handle address update - FIXED VERSION  
  const handleAddressUpdate = async (values) => {
    console.log("🔍 handleAddressUpdate called with values:", values);
    console.log("📧 Email being sent:", logInEmail);

    try {
      // ✅ This one already has .unwrap() which is correct
      await dispatch(UpdateShippingAddress({ 
        email: logInEmail, 
        shippingAddress: values 
      })).unwrap();

      console.log("✅ Address update dispatched successfully");
      setIsAddressModalOpen(false);
      
      if (showToast) {
        showToast("Address updated successfully!", 'success');
      }
    } catch (error) {
      console.error("❌ Error in handleAddressUpdate:", error);
      if (showToast) {
        showToast(error || "Failed to update address", 'error');
      }
    }
  };


  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // User Profile Dropdown Content
  const userProfileDropdown = (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-w-72"
      style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <FaUser className="text-white text-lg" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 text-lg">{logInName || 'User'}</h3>
            <p className="text-gray-600 text-sm">{logInEmail}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <motion.div
          whileHover={{ 
            backgroundColor: '#f8fafc', 
            x: 6,
            scale: 1.02
          }}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0, 0.2, 1]
          }}
          className="px-6 py-3 cursor-pointer flex items-center space-x-3 group rounded-lg mx-2"
          onClick={handleEditName}
        >
          <motion.div 
            className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center transition-all duration-300"
            whileHover={{ 
              backgroundColor: '#dbeafe',
              rotate: 5,
              scale: 1.1
            }}
          >
            <FaEdit className="text-blue-600 text-sm transition-colors duration-300 group-hover:text-blue-700" />
          </motion.div>
          <div className="flex-1">
            <motion.p 
              className="font-medium text-gray-800 transition-colors duration-300 group-hover:text-gray-900"
              whileHover={{ x: 2 }}
            >
              Edit Name
            </motion.p>
            <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-600">Update your display name</p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronDown className="text-gray-400 text-xs rotate-[-90deg]" />
          </motion.div>
        </motion.div>

        <motion.div
          whileHover={{ 
            backgroundColor: '#f8fafc', 
            x: 6,
            scale: 1.02
          }}
          transition={{ 
            duration: 0.3, 
            ease: [0.4, 0, 0.2, 1]
          }}
          className="px-6 py-3 cursor-pointer flex items-center space-x-3 group rounded-lg mx-2"
          onClick={handleEditAddress}
        >
          <motion.div 
            className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center transition-all duration-300"
            whileHover={{ 
              backgroundColor: '#dcfce7',
              rotate: -5,
              scale: 1.1
            }}
          >
            <FaMapMarkerAlt className="text-green-600 text-sm transition-colors duration-300 group-hover:text-green-700" />
          </motion.div>
          <div className="flex-1">
            <motion.p 
              className="font-medium text-gray-800 transition-colors duration-300 group-hover:text-gray-900"
              whileHover={{ x: 2 }}
            >
              Shipping Address
            </motion.p>
            <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-600">Manage delivery address</p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FaChevronDown className="text-gray-400 text-xs rotate-[-90deg]" />
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="my-2 border-t border-gray-100"></div>

        <motion.div
          whileHover={{ backgroundColor: '#fef2f2', x: 4 }}
          transition={{ duration: 0.2 }}
          className="px-6 py-3 cursor-pointer flex items-center space-x-3 group"
          onClick={handleLogOut}
        >
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
            <FaSignOutAlt className="text-red-600 text-sm" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-red-600">Sign Out</p>
            <p className="text-xs text-gray-500">Logout from your account</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  // Notification dropdown content (unchanged from original)
  const notificationDropdownContent = (
    <div className="notification-dropdown-container" style={{ backgroundColor: '#f5f5f5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#f5f5f5]">
        <Text strong className="text-lg">Notifications</Text>
        {unreadNotificationCount > 0 && (
          <Button 
            type="text" 
            size="small" 
            onClick={handleMarkAllAsRead}
            className="text-[#4B0082] hover:text-[#3B0062]"
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      <div className="overflow-y-auto max-h-80 bg-[#f5f5f5]">
        {notifications.length === 0 ? (
          <div className="p-8">
            <Empty 
              description="No notifications yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <List
            dataSource={notifications.slice(0, 10)}
            renderItem={(notification) => (
              <motion.div
                variants={notificationItemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                key={notification.id}
              >
                <List.Item
                  className={`cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-l-[#4B0082]' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3 w-full p-2">
                    <div className="flex-shrink-0">
                      {notification.type === 'order' ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <ShoppingOutlined className="text-green-600" />
                        </div>
                      ) : notification.type === 'cart' ? (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaShoppingCart className="text-blue-600 text-sm" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaBell className="text-gray-600 text-sm" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Text strong className="text-sm text-gray-900 truncate">
                          {notification.title}
                        </Text>
                        <Text className="text-xs text-gray-500 ml-2">
                          {formatTimeAgo(notification.createdAt)}
                        </Text>
                      </div>
                      <Text className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </Text>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[#4B0082] rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                </List.Item>
              </motion.div>
            )}
          />
        )}
      </div>
      
      {notifications.length > 10 && (
        <div className="p-4 border-t border-gray-200 text-center bg-[#f5f5f5]">
          <Button type="text" className="text-[#4B0082] hover:text-[#3B0062]">
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className='header'>
      <nav className='navbar'>
        <div className='left-nav'>
          <img
            className="navImage"
            alt="navLogo"
            src='VibeMart-NavLogo.png'
            height="60px"
            width="180px"
            onClick={() => navigate('/')}
          />
          <div
            style={{ position: 'relative', display: "inline-block" }}
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            <Link className="nav-Link" to="/products">
              Categories
            </Link>

            {(isMenuOpen || showDropdown) && (
              <div className={`dropDown ${isMenuOpen ? 'show' : ''}`}>
                <div className='drop1'>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <b style={{ fontSize: '18px' }} onClick={() => goToProducts("Clothing")}>
                        <Link className="nav-Link2" to="#">Clothing</Link>
                      </b>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '1px' }}>
                      <div onClick={() => goToProducts("Clothing", "Men")} className='sub-link'>Men</div>
                      <div onClick={() => goToProducts("Clothing", "Women")} className='sub-link'>Women</div>
                      <div onClick={() => goToProducts("Clothing", "Kids")} className='sub-link'>Kids</div>
                      <div onClick={() => goToProducts("Clothing", "Shoes")} className='sub-link'>Shoes</div>
                      <div onClick={() => goToProducts("Clothing", "Accessories")} className='sub-link'>Accessories</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <b style={{ fontSize: '18px' }} onClick={() => goToProducts("Gaming")}>
                        <Link className="nav-Link2" to="#">Gaming</Link>
                      </b>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '1px' }}>
                      <div onClick={() => goToProducts("Gaming", "Consoles")} className='sub-link'>Consoles</div>
                      <div onClick={() => goToProducts("Gaming", "Games")} className='sub-link'>Games</div>
                      <div onClick={() => goToProducts("Gaming", "Accessories")} className='sub-link'>Accessories</div>
                      <div onClick={() => goToProducts("Gaming", "Controllers")} className='sub-link'>Controllers</div>
                      <div onClick={() => goToProducts("Gaming", "Headsets")} className='sub-link'>Headsets</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <b style={{ fontSize: '18px' }} onClick={() => goToProducts("Home")}>
                        <Link className="nav-Link2" to="#">Home</Link>
                      </b>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '1px' }}>
                      <div onClick={() => goToProducts("Home", "Furniture")} className='sub-link'>Furniture</div>
                      <div onClick={() => goToProducts("Home", "Kitchen")} className='sub-link'>Kitchen</div>
                      <div onClick={() => goToProducts("Home", "Decor")} className='sub-link'>Decor</div>
                      <div onClick={() => goToProducts("Home", "Bedding")} className='sub-link'>Bedding</div>
                      <div onClick={() => goToProducts("Home", "Appliances")} className='sub-link'>Appliances</div>
                    </div>
                  </div>
                </div>

                <div className='drop2'>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <b style={{ fontSize: '18px' }} onClick={() => goToProducts("Electronics")}>
                        <Link className="nav-Link2" to="#">Electronics</Link>
                      </b>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '1px' }}>
                      <div onClick={() => goToProducts("Electronics", "Mobiles")} className='sub-link'>Mobiles</div>
                      <div onClick={() => goToProducts("Electronics", "Laptops")} className='sub-link'>Laptops</div>
                      <div onClick={() => goToProducts("Electronics", "Cameras")} className='sub-link'>Cameras</div>
                      <div onClick={() => goToProducts("Electronics", "Tablets")} className='sub-link'>Tablets</div>
                      <div onClick={() => goToProducts("Electronics", "Wearables")} className='sub-link'>Wearables</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <b style={{ fontSize: '18px' }} onClick={() => goToProducts("Sports")}>
                        <Link className="nav-Link2" to="#">Sports</Link>
                      </b>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '1px' }}>
                      <div onClick={() => goToProducts("Sports", "Wearables")} className='sub-link'>Wearables</div>
                      <div onClick={() => goToProducts("Sports", "Equipment")} className='sub-link'>Equipment</div>
                      <div onClick={() => goToProducts("Sports", "Outdoor")} className='sub-link'>Outdoor</div>
                      <div onClick={() => goToProducts("Sports", "Footwear")} className='sub-link'>Footwear</div>
                      <div onClick={() => goToProducts("Sports", "Accessories")} className='sub-link'>Accessories</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='right-nav'>
          <div className='search-bar'>
            <input type="search" placeholder="Search" className='navSearch' />
            <button className='navSearchButton'>Search</button>
          </div>

          <div className='icons'>
            <div style={{ display: "flex", gap: "40px", alignItems: "center" }}>
              {/* Enhanced Cart Icon with Animation and Count */}
              <div style={{ position: 'relative' }}>
                <motion.div
                  variants={cartAnimation ? bounceAnimation : {}}
                  initial="initial"
                  animate={cartAnimation ? "animate" : "initial"}
                >
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <FaShoppingCart
                      className="icon"
                      fontSize={25}
                      onClick={handleCartClick}
                      style={{ cursor: 'pointer', color: cartCount > 0 ? '#4B0082' : 'inherit' }}
                    />
                    {cartCount > 0 && (
                      <span 
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-12px',
                          backgroundColor: '#ff4757',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </div>
                </motion.div>
                
                {cartCount > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-[#ffffff] rounded-full opacity-75"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                    style={{ pointerEvents: 'none', zIndex: "-100" }}
                  />
                )}
              </div>

              {/* Enhanced Notification Bell with Animation */}
              <div style={{ position: 'relative' }}>
                {isLogin ? (
                  <Dropdown
                    overlay={notificationDropdownContent}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="notification-dropdown"
                  >
                    <motion.div
                      variants={notificationAnimation ? bounceAnimation : {}}
                      initial="initial"
                      animate={notificationAnimation ? "animate" : "initial"}
                    >
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <FaBell 
                          className="icon" 
                          fontSize={25} 
                          style={{ 
                            cursor: 'pointer',
                            color: unreadNotificationCount > 0 ? '#4B0082' : 'inherit'
                          }}
                        />
                        {unreadNotificationCount > 0 && (
                          <span 
                            style={{
                              position: 'absolute',
                              top: '-10px',
                              right: '-10px',
                              backgroundColor: '#ff4757',
                              color: 'white',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            {unreadNotificationCount}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </Dropdown>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaBell 
                      className="icon" 
                      fontSize={25} 
                      onClick={() => showToast("Please log in to view notifications", 'warning')}
                      style={{ cursor: 'pointer' }}
                    />
                  </motion.div>
                )}
                
                {unreadNotificationCount > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-75"
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </div>
            </div>
            
            {isLogin === false && !logInEmail ? (
              <div className='loginButtons'>
                <Button type='default' className='signUp' onClick={() => setSignUpPage(true)}>Sign Up</Button>
                <Button type='primary' className='logIn' onClick={() => setLoginPage(true)}>
                  LogIn
                </Button>
              </div>
            ) : (
              <div className='profile'>
                {/* Enhanced User Profile Dropdown */}
                <Dropdown
                  overlay={userProfileDropdown}
                  trigger={['click']}
                  placement="bottomRight"
                  visible={isProfileDropdownOpen}
                  onVisibleChange={setIsProfileDropdownOpen}
                  overlayClassName="user-profile-dropdown"
                  overlayStyle={{
                    marginTop: '8px',
                    marginRight: '16px',
                    zIndex: 9999
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                    style={{ 
                      border: '1px solid #e5e7eb',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <UserOutlined style={{ fontSize: '18px', color: 'white' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text strong style={{ fontSize: "16px", color: '#374151' }} className="truncate block">
                        {emailToShow || 'User'}
                      </Text>
                      <Text style={{ fontSize: "12px", color: '#6b7280' }} className="block">
                        Click to manage
                      </Text>
                    </div>
                    <motion.div
                      animate={{ rotate: isProfileDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown style={{ fontSize: '12px', color: '#6b7280' }} />
                    </motion.div>
                  </motion.div>
                </Dropdown>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Edit Name Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FaEdit className="text-blue-600 text-sm" />
            </div>
            <span className="text-lg font-semibold text-gray-800">Edit Name</span>
          </div>
        }
        visible={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        className="edit-name-modal"
        centered
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleNameUpdate}
          className="mt-6"
        >
          <Form.Item
            label={<span className="text-gray-700 font-medium">Display Name</span>}
            name="name"
            rules={[
              { required: true, message: 'Please enter your name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 50, message: 'Name must be less than 50 characters' }
            ]}
          >
            <Input
              size="large"
              placeholder="Enter your full name"
              prefix={<FaUser className="text-gray-400" />}
              className="rounded-lg"
            />
          </Form.Item>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              onClick={() => setIsEditModalOpen(false)}
              className="px-6 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="px-6 py-2 rounded-lg"
              style={{ backgroundColor: '#4B0082', borderColor: '#4B0082' }}
            >
              Update Name
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Address Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <FaMapMarkerAlt className="text-green-600 text-sm" />
            </div>
            <span className="text-lg font-semibold text-gray-800">Shipping Address</span>
          </div>
        }
        visible={isAddressModalOpen}
        onCancel={() => setIsAddressModalOpen(false)}
        footer={null}
        className="edit-address-modal"
        centered
        width={600}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      >
        <Form
          form={addressForm}
          layout="vertical"
          onFinish={handleAddressUpdate}
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-gray-700 font-medium">Address Line 1</span>}
              name="addressLine1"
              rules={[{ required: true, message: 'Please enter address line 1' }]}
            >
              <Input
                size="large"
                placeholder="Street address, P.O. box"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Address Line 2</span>}
              name="addressLine2"
            >
              <Input
                size="large"
                placeholder="Apartment, suite, etc. (optional)"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">City</span>}
              name="city"
              rules={[{ required: true, message: 'Please enter city' }]}
            >
              <Input
                size="large"
                placeholder="Enter city"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">State/Province</span>}
              name="state"
              rules={[{ required: true, message: 'Please enter state/province' }]}
            >
              <Input
                size="large"
                placeholder="Enter state or province"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Postal Code</span>}
              name="postalCode"
              rules={[{ required: true, message: 'Please enter postal code' }]}
            >
              <Input
                size="large"
                placeholder="Enter postal code"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-700 font-medium">Country</span>}
              name="country"
              rules={[{ required: true, message: 'Please enter country' }]}
            >
              <Input
                size="large"
                placeholder="Enter country"
                className="rounded-lg"
              />
            </Form.Item>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              onClick={() => setIsAddressModalOpen(false)}
              className="px-6 py-2 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="px-6 py-2 rounded-lg"
              style={{ backgroundColor: '#4B0082', borderColor: '#4B0082' }}
            >
              Update Address
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default Navbar;

