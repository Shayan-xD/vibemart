import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ProductForm from './ProductForm';
import ViewProducts from './ViewProducts';
import SellerForm from './SellerForm';
import ViewSellers from './ViewSellers';
import ViewOrders from './ViewOrders';
import { fetchSellers } from '../../features/sellerSlice';
import { fetchAllOrders } from '../../features/orderSlice';
import { fetchProducts } from '../../features/productSlice';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Toast Component
const Toast = ({ message, type = 'error', show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-[slideInRight_0.3s_ease-out]">
      <div className={`px-6 py-4 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-500 text-white' : 
        type === 'success' ? 'bg-green-500 text-white' : 
        'bg-blue-500 text-white'
      } max-w-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2">
              {type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}
            </span>
            <span className="font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Custom Sidebar Component with smooth animations
const CustomSidebar = ({ children }) => (
  <div className="w-72 bg-gradient-to-b from-white to-gray-50 shadow-lg h-full border-r border-gray-100 transform transition-all duration-300 ease-in-out">
    {children}
  </div>
);

const SidebarItems = ({ children }) => (
  <div className="p-6">
    <div className="mb-8">
      <h1 className="text-2xl font-light text-gray-800 opacity-0 animate-[fadeInSlideDown_0.8s_ease-out_0.2s_forwards]">
        Admin <span className="font-semibold" style={{ color: '#4B0082' }}>Dashboard</span>
      </h1>
      <div className="w-16 h-0.5 mt-3 bg-gradient-to-r from-purple-600 to-transparent opacity-0 animate-[expandWidth_1s_ease-out_0.5s_forwards]"></div>
    </div>
    {children}
  </div>
);

const SidebarItemGroup = ({ children }) => (
  <div className="space-y-3">
    {children}
  </div>
);

const SidebarCollapse = ({ label, defaultOpen, children, delay = 0 }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen || false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`mb-6 transform transition-all duration-500 ${hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-between w-full p-4 text-left text-gray-700 hover:bg-white hover:shadow-md rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:-translate-y-0.5"
        style={{ backgroundColor: isOpen ? '#f8fafc' : 'transparent' }}
      >
        <span className="font-medium text-lg group-hover:text-purple-700 transition-colors duration-300">
          {label}
        </span>
        <span
          className={`transform transition-all duration-300 ease-out text-purple-600 ${
            isOpen ? 'rotate-90 scale-110' : 'group-hover:scale-110'
          }`}
        >
          ▶
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="ml-6 mt-3 space-y-2 border-l-2 border-gray-100 pl-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ children, onClick, isActive = false }) => (
  <button
    onClick={onClick}
    className={`group block w-full text-left p-3 rounded-lg transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg relative overflow-hidden ${
      isActive
        ? 'bg-purple-50 text-purple-700 shadow-md'
        : 'text-gray-600 hover:bg-white hover:text-gray-800'
    }`}
  >
    <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 transform transition-transform duration-300 ${
      isActive ? 'translate-x-0' : 'translate-x-full'
    } group-hover:translate-x-0 opacity-10`}></div>
    <span className="relative z-10 font-medium">
      {children}
    </span>
  </button>
);

// Custom Modal Component with backdrop blur and smooth animations
const CustomModal = ({ show, onClose, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-300 ${
        show
          ? 'opacity-100 backdrop-blur-sm bg-black/30'
          : 'opacity-0 backdrop-blur-none bg-black/0'
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out ${
          show
            ? 'scale-100 translate-y-0 opacity-100'
            : 'scale-95 translate-y-8 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ children }) => (
  <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-semibold text-gray-800 animate-[fadeInSlideRight_0.4s_ease-out]">
        {children}
      </h3>
    </div>
  </div>
);

const ModalBody = ({ children }) => (
  <div className="px-8 py-6">{children}</div>
);

// Floating close button
const FloatingCloseButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out transform hover:scale-110 hover:rotate-90 flex items-center justify-center group"
  >
    <span className="text-gray-500 group-hover:text-gray-700 text-xl leading-none transition-colors duration-300">
      ×
    </span>
  </button>
);

// Main content area with smooth transitions
const MainContent = ({ children, section }) => (
  <div className="flex-1 bg-gradient-to-br from-gray-50 to-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/20 rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50/30 rounded-full translate-y-32 -translate-x-32"></div>
    <div className="relative z-10 p-8 h-full overflow-auto">
      <div
        key={section}
        className="animate-[fadeInSlideUp_0.6s_ease-out] transform transition-all duration-500"
      >
        {children}
      </div>
    </div>
  </div>
);

// Logout Button Component
const LogoutButton = ({ onLogout }) => (
  <div className="p-4 border-t border-gray-100 mt-auto">
    <button
      onClick={onLogout}
      className="w-full flex items-center justify-center p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300 ease-out transform hover:scale-105 group"
    >
      <span className="mr-2 text-lg">🚪</span>
      <span className="font-medium">Logout</span>
    </button>
  </div>
);

// Analytics Dashboard Component
// Fixed seller revenue calculation logic for AnalyticsDashboard component

const AnalyticsDashboard = () => {
  // ... existing useSelector calls remain the same ...
  const products = useSelector((state) => state.products?.productList || []);
  const sellers = useSelector((state) => state.sellerList?.sellerList || []);
  const orders = useSelector((state) => state.orders?.allOrders || []);
  const orderLoading = useSelector((state) => state.orders?.loading || false);
  const productLoading = useSelector((state) => state.products?.loading || false);
  const sellerLoading = useSelector((state) => state.sellerList?.loading || false);
  const orderError = useSelector((state) => state.orders?.error || null);
  const productError = useSelector((state) => state.products?.error || null);
  const sellerError = useSelector((state) => state.sellerList?.error || null);

  // Create a product lookup map for efficient access
  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach(product => {
      // Handle both _id and id properties that might exist
      const productId = product._id || product.id;
      if (productId) {
        map.set(String(productId), product);
      }
    });
    return map;
  }, [products]);

  // Calculate seller revenue with proper item-based calculation
  const sellerRevenue = useMemo(() => {
    console.log('Starting revenue calculation...');
    console.log('Products:', products.length);
    console.log('Orders:', orders.length);
    console.log('Product Map:', productMap);

    // Initialize revenue for all sellers
    const revenue = {};
    sellers.forEach(seller => {
      revenue[seller.email] = 0;
    });

    // Process each order
    orders.forEach(order => {
      // Only count confirmed orders that are paid
      if (order.status === 'pending' || !order.paymentInfo?.paid) {
        return;
      }

      console.log('Processing order:', order.orderId, 'with', order.items?.length, 'items');

      // Process each item in the order
      order.items?.forEach(item => {
        const productId = String(item.productId);
        const product = productMap.get(productId);
        
        if (product && product.sellerEmail) {
          // Calculate revenue for this specific item
          const itemRevenue = item.price * item.quantity;
          
          // Add to seller's total revenue
          if (revenue.hasOwnProperty(product.sellerEmail)) {
            revenue[product.sellerEmail] += itemRevenue;
          }

          console.log(`Item: ${item.name}, Seller: ${product.sellerEmail}, Revenue: $${itemRevenue}`);
        } else {
          console.log(`Product not found for ID: ${productId}`);
        }
      });
    });

    console.log('Final seller revenue:', revenue);
    return revenue;
  }, [orders, products, sellers, productMap]);

  // Debug logging
  useEffect(() => {
    console.log('AnalyticsDashboard Data Debug:', {
      ordersCount: orders.length,
      productsCount: products.length,
      sellersCount: sellers.length,
      sampleOrder: orders[0],
      sampleOrderItems: orders[0]?.items,
      sampleProduct: products[0],
      productMapSize: productMap.size,
      sellerRevenueEntries: Object.entries(sellerRevenue),
      errors: { orderError, productError, sellerError }
    });
  }, [orders, products, sellers, productMap, sellerRevenue, orderError, productError, sellerError]);

  // Calculate total revenue from all confirmed, paid orders
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => {
      if (order.status !== 'pending' && order.paymentInfo?.paid) {
        // Calculate from individual items to ensure accuracy
        const orderTotal = order.items?.reduce((itemSum, item) => {
          return itemSum + (item.price * item.quantity);
        }, 0) || 0;
        
        return sum + orderTotal;
      }
      return sum;
    }, 0);
  }, [orders]);

  // Prepare data for bar chart
  const revenueChartData = {
    labels: sellers.map((seller) => seller.email.length > 20 ? 
      seller.email.substring(0, 17) + '...' : seller.email),
    datasets: [
      {
        label: 'Revenue by Seller ($)',
        data: sellers.map((seller) => sellerRevenue[seller.email] || 0),
        backgroundColor: 'rgba(75, 0, 130, 0.6)',
        borderColor: '#4B0082',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75, 0, 130, 0.8)',
        hoverBorderColor: '#4B0082',
      },
    ],
  };

  // Enhanced chart options with better formatting
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 14,
          },
          color: '#374151',
        },
      },
      title: {
        display: true,
        text: 'Revenue by Seller',
        font: {
          family: "'Inter', sans-serif",
          size: 18,
          weight: 'bold',
        },
        color: '#374151',
      },
      tooltip: {
        backgroundColor: '#4B0082',
        titleFont: { family: "'Inter', sans-serif", size: 14 },
        bodyFont: { family: "'Inter', sans-serif", size: 12 },
        callbacks: {
          label: (context) => {
            const sellerEmail = sellers[context.dataIndex]?.email || 'Unknown';
            return [`Seller: ${sellerEmail}`, `Revenue: $${context.raw.toFixed(2)}`];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)',
          font: { family: "'Inter', sans-serif", size: 14 },
          color: '#374151',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 12 },
          color: '#374151',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        },
      },
      x: {
        title: {
          display: true,
          text: 'Sellers',
          font: { family: "'Inter', sans-serif", size: 14 },
          color: '#374151',
        },
        grid: {
          display: false,
        },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 10 },
          color: '#374151',
          maxRotation: 45,
        },
      },
    },
  };

  // Calculate other statistics
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
  const activeSellers = sellers.filter((seller) => seller.status === 'active').length;

  // Check if chart data is meaningful
  const hasChartData = sellers.length > 0 && Object.values(sellerRevenue).some((revenue) => revenue > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
      
      {/* Loading indicator */}
      {(orderLoading || productLoading || sellerLoading) && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading data...</span>
        </div>
      )}
      
      {/* Error display */}
      {(orderError || productError || sellerError) && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <strong>Error:</strong> {orderError || productError || sellerError}
        </div>
      )}
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
          <p className="text-3xl font-bold text-purple-600">{products.length}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Sellers</h3>
          <p className="text-3xl font-bold text-purple-600">{sellers.length}</p>
          <p className="text-sm text-gray-500">Active: {activeSellers}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
          <p className="text-3xl font-bold text-purple-600">{orders.length}</p>
          <p className="text-sm text-gray-500">
            Delivered: {deliveredOrders} | Pending: {pendingOrders}
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          <p className="text-sm text-gray-500">From confirmed & paid orders</p>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        {hasChartData ? (
          <div style={{ height: '400px' }}>
            <Bar data={revenueChartData} options={chartOptions} />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p className="text-lg font-medium">No revenue data available</p>
            <p className="text-sm">
              {sellers.length === 0
                ? 'No sellers found.'
                : orders.length === 0
                ? 'No orders found.'
                : products.length === 0
                ? 'No products found.'
                : 'No confirmed and paid orders found.'}
            </p>
          </div>
        )}
      </div>
      
      {/* Detailed Revenue Table */}
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Seller Revenue Breakdown</h3>
        {sellers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-gray-700 font-semibold">Seller Email</th>
                  <th className="py-3 px-4 text-gray-700 font-semibold">Revenue</th>
                  <th className="py-3 px-4 text-gray-700 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {sellers
                  .slice() // Create a copy for sorting
                  .sort((a, b) => (sellerRevenue[b.email] || 0) - (sellerRevenue[a.email] || 0))
                  .map((seller) => (
                  <tr key={seller.email} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-600">{seller.email}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-purple-600">
                        ${(sellerRevenue[seller.email] || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        seller.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {seller.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No sellers available.</p>
        )}
      </div>
    </div>
  );
};

function AdminDashboard({ adminLogin, setAdminLogin }) {
  const [section, setSection] = useState('analytics');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Session handling - Check authentication on component mount and when adminLogin changes
  useEffect(() => {
    if (!adminLogin) {
      setToastMessage('Access denied. Please login as admin.');
      setShowToast(true);

      const timer = setTimeout(() => {
        navigate('/');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [adminLogin, navigate]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Fetch sellers, products, and all orders on mount
  useEffect(() => {
    dispatch(fetchSellers());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const openEditModal = (item, type) => {
    setEditItem(item);
    setModalType(type);
    setShowModal(true);
  };

  const handleLogout = () => {
    setToastMessage('Logging out...');
    setShowToast(true);

    setAdminLogin(false);

    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  if (!adminLogin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-gray-100 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <style jsx>{`
        @keyframes fadeInSlideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInSlideRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes expandWidth {
          from {
            width: 0;
          }
          to {
            width: 4rem;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <CustomSidebar>
        <div className="flex flex-col h-full">
          <SidebarItems>
            <SidebarItemGroup>
              <div className="transform transition-all duration-500 delay-1000 opacity-0 translate-y-4 animate-[fadeInSlideUp_0.5s_ease-out_1s_forwards]">
                <SidebarItem
                  onClick={() => setSection('analytics')}
                  isActive={section === 'analytics'}
                >
                  📊 Analytics
                </SidebarItem>
              </div>
              <SidebarCollapse label="Products" defaultOpen={true} delay={600}>
                <SidebarItem
                  onClick={() => setSection('addProduct')}
                  isActive={section === 'addProduct'}
                >
                  Add Product
                </SidebarItem>
                <SidebarItem
                  onClick={() => setSection('viewProducts')}
                  isActive={section === 'viewProducts'}
                >
                  View Products
                </SidebarItem>
              </SidebarCollapse>
              <SidebarCollapse label="Sellers" delay={800}>
                <SidebarItem
                  onClick={() => setSection('addSeller')}
                  isActive={section === 'addSeller'}
                >
                  Add Seller
                </SidebarItem>
                <SidebarItem
                  onClick={() => setSection('viewSellers')}
                  isActive={section === 'viewSellers'}
                >
                  View Sellers
                </SidebarItem>
              </SidebarCollapse>
              <div className="transform transition-all duration-500 delay-1000 opacity-0 translate-y-4 animate-[fadeInSlideUp_0.5s_ease-out_1s_forwards]">
                <SidebarItem
                  onClick={() => setSection('viewOrders')}
                  isActive={section === 'viewOrders'}
                >
                  📋 Orders
                </SidebarItem>
              </div>
            </SidebarItemGroup>
          </SidebarItems>
          <LogoutButton onLogout={handleLogout} />
        </div>
      </CustomSidebar>

      <MainContent section={section}>
        {section === 'analytics' && <AnalyticsDashboard />}
        {section === 'addProduct' && <ProductForm />}
        {section === 'viewProducts' && <ViewProducts onEdit={(product) => openEditModal(product, 'product')} />}
        {section === 'addSeller' && <SellerForm />}
        {section === 'viewSellers' && <ViewSellers onEdit={(seller) => openEditModal(seller, 'seller')} />}
        {section === 'viewOrders' && <ViewOrders />}
      </MainContent>

      <CustomModal show={showModal} onClose={() => setShowModal(false)}>
        <FloatingCloseButton onClick={() => setShowModal(false)} />
        <ModalHeader>
          Edit {modalType === 'product' ? 'Product' : 'Seller'}
        </ModalHeader>
        <ModalBody>
          {modalType === 'product' && (
            <ProductForm
              productToEdit={editItem}
              onClose={() => setShowModal(false)}
            />
          )}
          {modalType === 'seller' && (
            <SellerForm
              sellerToEdit={editItem}
              onClose={() => setShowModal(false)}
            />
          )}
        </ModalBody>
      </CustomModal>

      <Toast 
        message={toastMessage} 
        type="error" 
        show={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
}

export default AdminDashboard;