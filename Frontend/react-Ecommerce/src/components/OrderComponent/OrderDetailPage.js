import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Card, Badge, Spinner } from "flowbite-react";
import { HiArrowLeft, HiCheckCircle, HiTruck, HiCreditCard } from "react-icons/hi";
import { fetchOrdersByUser, cancelOrderWithNotification } from '../../features/orderSlice';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userEmail = useSelector((state) => state.users?.logInEmail || "");
  const isAuthenticated = useSelector((state) => state.users?.isAuthenticated || false);
  const order = useSelector((state) => {
    if (!state.orders?.orders) {
      console.warn("Redux state.orders.orders is undefined. Check order slice initial state.");
      return null;
    }
    return state.orders.orders.find(
      (o) => o.orderId === orderId && o.userEmail === userEmail
    ) || null;
  });
  const user = useSelector((state) => {
    if (!state.users?.users) {
      console.warn("Redux state.users.users is undefined. Check user slice initial state.");
      return null;
    }
    return state.users.users.find((u) => u.email === userEmail) || null;
  });
  const isLoading = useSelector((state) => state.orders?.loading);

  useEffect(()=>{
    window.scrollTo(0,0);
  },[])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else if (userEmail && !order) {
      dispatch(fetchOrdersByUser(userEmail));
    }
  }, [isAuthenticated, userEmail, order, dispatch, navigate]);

  if (isLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl flex justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case "shipped":
        return <HiTruck className="w-5 h-5 text-blue-500" />;
      default:
        return <HiCreditCard className="w-5 h-5 text-purple-500" />;
    }
  };

  const items = order.items || [];
  const taxRate = 0.1; // 10% tax rate, consistent with CartPage
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  ).toFixed(2);
  const tax = (subtotal * taxRate).toFixed(2);
  const shipping = parseFloat(subtotal) >= 50 ? 0 : 5.99;
  const totalAmount = (parseFloat(subtotal) + parseFloat(tax) + shipping).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
      style={{ paddingTop: "160px" }}
    >
      <Button
        onClick={() => navigate("/orders")}
        gradientMonochrome="purple"
        className="mb-6"
      >
        <HiArrowLeft className="mr-2 h-5 w-5" />
        Back to Orders
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {getStatusIcon(order.status)}
                Order #{order.orderId.slice(0, 8).toUpperCase()}
              </h2>
              <Badge color={
                order.status === "delivered" ? "success" :
                order.status === "shipped" ? "info" :
                order.status === "cancelled" ? "failure" : "warning"
              }>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-6">
              {items && items.length > 0 ? (
                items.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <img
                      src={item.image || "https://via.placeholder.com/100"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name || 'Unnamed Product'}</h3>
                      <p className="text-gray-600">
                        ${Number(item.price || 0).toFixed(2)} × {Number(item.quantity || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items found in this order
                </div>
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span>${tax}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={parseFloat(subtotal) >= 50 ? "text-green-600" : ""}>
                  {parseFloat(subtotal) >= 50 ? 'Free' : '$5.99'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${totalAmount}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Shipping Address</h4>
                <p className="text-gray-600">
                  {order.shippingAddress?.addressLine1 || 'Not provided'}<br />
                  {order.shippingAddress?.addressLine2 && (
                    <>
                      {order.shippingAddress.addressLine2}<br />
                    </>
                  )}
                  {order.shippingAddress?.city || ''} 
                  {order.shippingAddress?.state && order.shippingAddress?.city ? ', ' : ''} 
                  {order.shippingAddress?.state || ''} {order.shippingAddress?.postalCode || ''}<br />
                  {order.shippingAddress?.country || ''}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">User Information</h4>
                <p className="text-gray-600">
                  Name: {user?.name || 'Unknown'}<br />
                  Email: {user?.email || 'Unknown'}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Payment Information</h4>
                <p className="text-gray-600">
                  Method: {order.paymentInfo?.method || 'N/A'}<br />
                  Payment Intent ID: {order.paymentInfo?.paymentIntentId || 'N/A'}<br />
                  Status: {order.paymentInfo?.paid ? 'Paid' : 'Not Paid'}
                </p>
              </div>
            </div>
          </Card>

          {order.status === "pending" && (
            <Button
              gradientMonochrome="failure"
              className="w-full mt-4"
              onClick={() => {
                dispatch(cancelOrderWithNotification(order.orderId));
                navigate("/orders");
              }}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}