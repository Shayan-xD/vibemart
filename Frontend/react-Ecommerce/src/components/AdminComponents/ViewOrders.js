import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOrderStatusWithNotification, fetchAllOrders } from '../../features/orderSlice';
import { fetchProducts } from '../../features/productSlice';
import Toast from '../Toast'; // Import the custom Toast component

// Custom Components
const Table = ({ children }) => (
  <div className="overflow-x-auto shadow-md rounded-lg">
    <table className="w-full text-sm text-left text-gray-700 bg-white">{children}</table>
  </div>
);

const TableHead = ({ children }) => (
  <thead className="text-xs uppercase bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-b-2 border-purple-200">{children}</thead>
);

const TableHeadCell = ({ children }) => (
  <th className="px-6 py-4 font-semibold">{children}</th>
);

const TableBody = ({ children }) => (
  <tbody>{children}</tbody>
);

const TableRow = ({ children, className = "", onClick }) => (
  <tr 
    className={`border-b hover:bg-gray-50 transition-colors ${className} ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

const TableCell = ({ children, className = "" }) => (
  <td className={`px-6 py-4 ${className}`}>{children}</td>
);

const Select = ({ value, onChange, disabled, children, className = "" }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
      disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
    } ${className}`}
  >
    {children}
  </select>
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block mb-2 text-sm font-medium text-gray-700">
    {children}
  </label>
);

const TextInput = ({ id, value, onChange, placeholder, className = "" }) => (
  <input
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${className}`}
  />
);

const StatusBadge = ({ status, isPaid }) => {
  const getStatusColor = (status, isPaid) => {
    if (!isPaid && status !== 'cancelled') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status, isPaid)}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
      {!isPaid && status !== 'cancelled' && (
        <span className="text-xs text-red-600 font-medium">⚠️ Unpaid</span>
      )}
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
    <div className="text-sm text-gray-700">
      Page {currentPage} of {totalPages}
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    <span className="ml-3 text-gray-600">Loading orders...</span>
  </div>
);

// Order Details Modal Component
const OrderDetailsModal = ({ order, isOpen, onClose, enrichOrderItems }) => {
  if (!isOpen || !order) return null;

  const isPaid = order.paymentInfo?.paid;

  return (
    <div 
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out ${
        isOpen ? 'bg-opacity-50' : 'bg-opacity-0'
      }`}
    >
      <div 
        className={`bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
          <div className="flex justify-between items-center">
            <div className="transform transition-all duration-500 ease-out delay-100">
              <h2 className="text-2xl font-bold text-purple-800">Order Details</h2>
              <p className="text-purple-600 font-mono text-sm">#{order.orderId.slice(0, 16)}...</p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-600 hover:text-purple-800 transition-all duration-200 p-2 hover:bg-purple-100 rounded-lg hover:scale-110 transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Info */}
            <div className="space-y-6 transform transition-all duration-700 ease-out delay-200">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Email:</span>
                    <span className="font-medium">{order.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg text-purple-600">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <StatusBadge status={order.status} isPaid={isPaid} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment:</span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isPaid ? '✓ Paid' : '✗ Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-blue-50 rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📍</span>
                  Shipping Address
                </h3>
                {order.shippingAddress ? (
                  <div className="space-y-3 text-gray-700">
                    <div className="space-y-2">
                      <p className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium min-w-[80px]">Address 1:</span>
                        <span className="font-medium">{order.shippingAddress.addressLine1 || 'N/A'}</span>
                      </p>
                      {order.shippingAddress.addressLine2 && (
                        <p className="flex items-start gap-2">
                          <span className="text-blue-600 font-medium min-w-[80px]">Address 2:</span>
                          <span>{order.shippingAddress.addressLine2}</span>
                        </p>
                      )}
                      <p className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium min-w-[80px]">City:</span>
                        <span>{order.shippingAddress.city || 'N/A'}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium min-w-[80px]">State:</span>
                        <span>{order.shippingAddress.state || 'N/A'}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium min-w-[80px]">Postal Code:</span>
                        <span>{order.shippingAddress.postalCode || 'N/A'}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium min-w-[80px]">Country:</span>
                        <span className="font-medium">{order.shippingAddress.country || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">📦 No shipping address available</p>
                    <p className="text-xs text-gray-400 mt-1">This might be a digital order or pickup</p>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="transform transition-all duration-700 ease-out delay-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  enrichOrderItems(order).map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] transform"
                      style={{ 
                        animationDelay: `${400 + index * 100}ms`,
                        animation: isOpen ? 'slideInUp 0.6s ease-out forwards' : 'none'
                      }}
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/80/80';
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {item.name}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Quantity:</span> {item.quantity || 1}
                            </p>
                            <p>
                              <span className="font-medium">Price:</span> ${parseFloat(item.price).toFixed(2)}
                            </p>
                            <p>
                              <span className="font-medium">Category:</span> {item.category}
                            </p>
                            <p>
                              <span className="font-medium">Stock:</span> 
                              <span className={`ml-1 ${item.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.stockQuantity}
                              </span>
                            </p>
                            <p className="col-span-2">
                              <span className="font-medium">Seller:</span> {item.sellerEmail}
                            </p>
                            <p className="col-span-2 font-semibold text-purple-600">
                              Subtotal: ${((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No items found in this order</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          {/* Footer is now empty since we only need the X button */}
        </div>
      </div>

      {/* Add CSS keyframes for animation */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// Status flow for admin operations
const getNextAvailableStatuses = (currentStatus, isPaid) => {
  if (!isPaid && currentStatus !== 'cancelled') {
    return [];
  }

  switch (currentStatus) {
    case 'pending':
      return isPaid ? ['confirmed'] : [];
    case 'confirmed':
      return ['processing'];
    case 'processing':
      return ['shipped'];
    case 'shipped':
      return ['delivered'];
    case 'delivered':
      return []; // Final state
    case 'cancelled':
      return []; // Final state
    default:
      return [];
  }
};

function ViewOrders() {
  const dispatch = useDispatch();
  const { allOrders, loading, error } = useSelector((state) => state.orders);
  const { productList } = useSelector((state) => state.products);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [toasts, setToasts] = useState([]); // State to manage multiple toasts
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Fetch all orders and products on component mount
  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Helper function to get product details from product slice
  const getProductDetails = (productId) => {
    const product = productList.find(p => p._id === productId || p._id === productId?.toString());
    return product || null;
  };

  // Helper function to enrich order items with product data
  const enrichOrderItems = (order) => {
    if (!order.items || !Array.isArray(order.items)) {
      return [];
    }

    return order.items.map(item => {
      const productDetails = getProductDetails(item.productId);
      return {
        ...item,
        // Use product data if available, fallback to order item data
        name: productDetails?.name || item.name || 'Unknown Product',
        image: productDetails?.image || item.image || '/api/placeholder/80/80',
        price: item.price || productDetails?.price || '0.00',
        sellerEmail: productDetails?.sellerEmail || item.sellerEmail || 'N/A',
        category: productDetails?.category || 'N/A',
        stockQuantity: productDetails?.stockQuantity || 0
      };
    });
  };

  // Filter orders based on search and filters
  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch = !orderSearch || 
      order.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(orderSearch.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesPayment = paymentFilter === 'all' || 
      (paymentFilter === 'paid' && order.paymentInfo?.paid) ||
      (paymentFilter === 'unpaid' && !order.paymentInfo?.paid);

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Add a new toast
  const addToast = (message, type) => {
    const id = Date.now(); // Unique ID for each toast
    setToasts((prevToasts) => [...prevToasts, { id, message, type, isVisible: true }]);
  };

  // Remove a toast
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.map((toast) =>
      toast.id === id ? { ...toast, isVisible: false } : toast
    ));
    // Clean up after animation
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 300);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const order = allOrders.find(o => o.orderId === orderId);
    if (!order) {
      addToast("Order not found", "error");
      return;
    }

    // Validate status change
    const availableStatuses = getNextAvailableStatuses(order.status, order.paymentInfo?.paid);
    if (!availableStatuses.includes(newStatus)) {
      addToast(
        `Cannot change status from ${order.status} to ${newStatus}. ${!order.paymentInfo?.paid ? 'Order must be paid first.' : 'Invalid status transition.'}`,
        "error"
      );
      return;
    }

    dispatch(updateOrderStatusWithNotification({ orderId, status: newStatus }))
      .unwrap()
      .then(() => {
        addToast(`Order #${orderId.slice(0, 8)} status updated to ${newStatus}`, "success");
      })
      .catch((error) => {
        addToast(`Failed to update status: ${error}`, "error");
      });
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [orderSearch, statusFilter, paymentFilter]);

  const orderStatuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading && allOrders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Render all toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => removeToast(toast.id)}
          duration={4000}
        />
      ))}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        enrichOrderItems={enrichOrderItems}
      />

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Order Management</h2>
        <button
          onClick={() => dispatch(fetchAllOrders())}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          Refresh Orders
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <Label htmlFor="orderSearch">Search Orders</Label>
          <TextInput
            id="orderSearch"
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            placeholder="Search by Order ID or User Email"
          />
        </div>
        <div>
          <Label htmlFor="statusFilter">Filter by Status</Label>
          <Select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="paymentFilter">Filter by Payment</Label>
          <Select
            id="paymentFilter"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid Only</option>
            <option value="unpaid">Unpaid Only</option>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-purple-600">{allOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Paid Orders</h3>
          <p className="text-2xl font-bold text-green-600">
            {allOrders.filter(o => o.paymentInfo?.paid).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Processing</h3>
          <p className="text-2xl font-bold text-blue-600">
            {allOrders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Delivered</h3>
          <p className="text-2xl font-bold text-purple-600">
            {allOrders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">No orders found matching your criteria.</p>
        </div>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Order ID</TableHeadCell>
                <TableHeadCell>User Email</TableHeadCell>
                <TableHeadCell>Items</TableHeadCell>
                <TableHeadCell>Total Amount</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Payment</TableHeadCell>
                <TableHeadCell>Created</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedOrders.map((order) => {
                const isPaid = order.paymentInfo?.paid;
                const availableStatuses = getNextAvailableStatuses(order.status, isPaid);
                const canUpdateStatus = availableStatuses.length > 0;

                return (
                  <TableRow 
                    key={order.orderId}
                    className="hover:bg-blue-50"
                  >
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span>{order.orderId.slice(0, 8)}...</span>
                        <span onClick={() => handleOrderClick(order)} style={{cursor : "pointer"}}className="text-xs text-blue-600">👁️ View</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.userEmail}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items?.length || 0} item(s)
                        {order.items?.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {(() => {
                              const enrichedItems = enrichOrderItems(order);
                              return enrichedItems.length > 0 ? (
                                <>
                                  {enrichedItems[0].name}
                                  {enrichedItems.length > 1 && ` +${enrichedItems.length - 1} more`}
                                </>
                              ) : 'No items';
                            })()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} isPaid={isPaid} />
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isPaid ? '✓ Paid' : '✗ Unpaid'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleStatusChange(order.orderId, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                        disabled={!canUpdateStatus || loading}
                        className="text-sm"
                      >
                        <option value={order.status}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </option>
                        {availableStatuses.map((status) => (
                          <option key={status} value={status}>
                            → {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </Select>
                      {!canUpdateStatus && (
                        <div className="text-xs text-gray-500 mt-1">
                          {!isPaid && order.status !== 'cancelled' ? 'Payment required' : 'No actions available'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default ViewOrders;