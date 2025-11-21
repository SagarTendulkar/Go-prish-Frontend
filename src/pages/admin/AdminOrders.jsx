import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // ✅ Update Order Status
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${id}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // ✅ Filter Orders
  const filteredOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  if (loading) {
    return <p className="text-center mt-10 text-dark/70">Loading orders...</p>;
  }

  return (
    <div className="bg-light p-8 font-sans text-dark">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-semibold text-primary">
          Orders
        </h2>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-accent bg-light rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30"
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <p className="text-dark/60 text-center">No orders found.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/40 border-b">
                <th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3">Total</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b hover:bg-accent/10 transition"
                >
                  <td className="py-2 px-3 font-medium">{order.name}</td>
                  <td className="py-2 px-3 text-dark/70">{order.email}</td>
                  <td className="py-2 px-3 text-dark/70">{order.phone}</td>
                  <td className="py-2 px-3 font-semibold text-primary">
                    ₹{order.totalAmount}
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="border border-accent bg-light rounded px-2 py-1 focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-2 px-3 text-dark/60">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-primary text-light rounded hover:opacity-90 cursor-pointer text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-7 text-dark-700 hover:text-red-600 text-2xl cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4 text-primary">
              Order Details
            </h3>

            {/* Customer Info */}
            <div className="mb-4 space-y-1 text-dark/80 text-sm">
              <p>
                <strong>Name:</strong> {selectedOrder.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.phone}
              </p>
              <p>
                <strong>Address:</strong> {selectedOrder.address}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
            </div>

            {/* Cart Items */}
            <h4 className="font-semibold mb-2 text-dark">Items:</h4>
            <div className="max-h-60 overflow-y-auto border rounded-xl divide-y">
              {selectedOrder.cart.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-dark/60">
                      Qty: {item.qty} × ₹{item.price}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    ₹{item.qty * item.price}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end mt-4">
              <p className="text-lg font-semibold text-primary">
                Total: ₹{selectedOrder.totalAmount}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
