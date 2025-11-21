import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Package, MapPin, IndianRupee, Clock } from "lucide-react";

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get(`/orders/user/${user._id}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchOrders();
  }, [user]);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600">Loading your orders...</p>
    );
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-primary">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-60" />
          <p className="text-lg">No orders yet 🛍️</p>
          <p className="text-sm">
            Start shopping to see your order history here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all bg-white p-6"
            >
              {/* Header */}
              <div className="flex justify-between flex-wrap mb-4 border-b pb-3">
                <div>
                  <h3 className="font-semibold text-lg text-dark">
                    Order #{order._id.slice(-6)}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock size={14} />
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium self-start mt-2 lg:mt-0
                    ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {order.cart.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-3"
                  >
                    <div className="flex flex-col">
                      <p className="font-medium text-dark">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.qty} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ₹{item.qty * item.price}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-3 text-sm">
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin size={16} className="mt-1 shrink-0 text-primary" />
                  <p>
                    <strong>Address:</strong> {order.address}
                  </p>
                </div>
                <div className="flex items-center gap-2 font-semibold text-primary text-base">
                  <IndianRupee size={16} />
                  {order.totalAmount}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
