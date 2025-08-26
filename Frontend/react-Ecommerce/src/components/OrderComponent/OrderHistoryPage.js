import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Card, Badge, Spinner } from "flowbite-react";
import { HiShoppingBag, HiHome } from "react-icons/hi";
import { fetchOrdersByUser, cancelOrderWithNotification } from '../../features/orderSlice';

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userEmail = useSelector((state) => state.users?.logInEmail);
  const orders = useSelector((state) => 
    state.orders?.orders?.filter(order => order.userEmail === userEmail) || []
  );
  const isAuthenticated = useSelector((state) => state.users?.isAuthenticated);
  const isLoading = useSelector((state) => state.orders?.loading);
  const error = useSelector((state) => state.orders?.error);

  useEffect(()=>{
    window.scrollTo(0,0);
  },[])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (userEmail) {
      dispatch(fetchOrdersByUser(userEmail));
    }
  }, [isAuthenticated, userEmail, dispatch, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge color="warning" className="w-fit">Pending</Badge>;
      case "processing":
        return <Badge color="warning" className="w-fit">Processing</Badge>;
      case "shipped":
        return <Badge color="info" className="w-fit">Shipped</Badge>;
      case "delivered":
        return <Badge color="success" className="w-fit">Delivered</Badge>;
      case "cancelled":
        return <Badge color="failure" className="w-fit">Cancelled</Badge>;
      default:
        return <Badge color="gray" className="w-fit">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl flex justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl text-center">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => dispatch(fetchOrdersByUser(userEmail))} gradientMonochrome="purple" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-7xl"
      style={{ paddingTop: "160px" }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HiShoppingBag className="w-8 h-8 text-purple-700" />
          Order History
        </h1>
        <Button onClick={() => navigate("/")} gradientMonochrome="purple">
          <HiHome className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
      </div>

      {!orders || orders.length === 0 ? (
        <Card className="text-center py-12">
          <div className="flex justify-center">
            <HiShoppingBag className="w-12 h-12 text-gray-400 mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 mb-6">
            Your placed orders will appear here
          </p>
          <Button onClick={() => navigate("/products")} gradientMonochrome="purple">
            Start Shopping
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((order) => (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-xl font-semibold">
                          Order #{order.orderId.slice(0, 8).toUpperCase()}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">
                        {order.items?.length || 0} items • Total: ${parseFloat(order.totalAmount || 0).toFixed(2)}
                      </p>
                      <p className="text-gray-600">
                        Payment: {order.paymentInfo?.paid ? "Paid" : "Not Paid"}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                        gradientMonochrome="purple"
                        outline
                      >
                        View Details
                      </Button>
                      {order.status === "pending" && (
                        <Button
                          gradientMonochrome="failure"
                          outline
                          onClick={() => dispatch(cancelOrderWithNotification(order.orderId))}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </div>

                  {order.items && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex overflow-x-auto gap-4 pb-2">
                        {order.items.slice(0, 4).map((item) => (
                          <div key={item.productId} className="flex-shrink-0">
                            <img
                              src={item.image || "https://via.placeholder.com/100"}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg">
                            +{order.items.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
        </div>
      )}
    </motion.div>
  );
}