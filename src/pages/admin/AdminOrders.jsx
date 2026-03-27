import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { X, Package, MapPin, Phone, Mail, User } from "lucide-react";
import toast from "react-hot-toast";

const STATUSES = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-600 border-amber-200",
  Processing: "bg-blue-50 text-blue-600 border-blue-200",
  Shipped: "bg-indigo-50 text-indigo-600 border-indigo-200",
  Delivered: "bg-green-50 text-green-600 border-green-200",
  Cancelled: "bg-red-50 text-red-500 border-red-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${STATUS_STYLES[status] || "bg-surface-raised text-ink-muted border-warm/20"}`}
  >
    {status}
  </span>
);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/orders/${id}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o)),
      );
      if (selectedOrder?._id === id) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      toast.success("Status updated");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  const filteredOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  // ── Loading skeleton ──────────────────────────────────────
  if (loading)
    return (
      <div className="p-6 sm:p-8 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-card rounded-xl border border-warm/15 p-4 animate-pulse flex gap-4"
          >
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface-raised rounded-full w-32" />
              <div className="h-2.5 bg-surface-raised rounded-full w-48" />
            </div>
            <div className="h-6 bg-surface-raised rounded-full w-20" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-1">
            Management
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">Orders</h1>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-200
                ${
                  statusFilter === s
                    ? "bg-brand-dark text-white border-brand-dark"
                    : "bg-surface-card text-ink-muted border-warm/20 hover:border-brand hover:text-brand"
                }`}
            >
              {s}
              {s !== "All" && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  ({orders.filter((o) => o.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders table ──────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <div className="bg-surface-card rounded-2xl border border-warm/15 py-16 text-center">
          <Package size={32} className="text-ink-faint mx-auto mb-3" />
          <p className="text-ink-muted text-sm">No orders found</p>
        </div>
      ) : (
        <div className="bg-surface-card rounded-2xl border border-warm/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-left">
              <thead>
                <tr className="border-b border-warm/10">
                  {[
                    "Customer",
                    "Email",
                    "Phone",
                    "Total",
                    "Status",
                    "Date",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-[11px] font-medium tracking-[1px] uppercase text-ink-muted whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-warm/8 hover:bg-surface-raised transition-colors"
                  >
                    <td className="py-3 px-4 text-[13px] font-medium text-ink whitespace-nowrap">
                      {order.name}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-ink-muted">
                      {order.email}
                    </td>
                    <td className="py-3 px-4 text-[12px] text-ink-muted">
                      {order.phone}
                    </td>
                    <td className="py-3 px-4 text-[13px] font-semibold text-brand whitespace-nowrap">
                      ₹{order.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      {/* Inline status select */}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="text-[12px] font-medium bg-surface-raised border border-warm/20 rounded-xl px-2 py-1.5 outline-none cursor-pointer focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                      >
                        {STATUSES.slice(1).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-[12px] text-ink-muted whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-brand/10 text-brand border border-brand/20 rounded-xl text-[12px] font-medium hover:bg-brand hover:text-white transition-all duration-200"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Order detail modal ────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface-card rounded-2xl border border-warm/15 w-full max-w-lg shadow-[0_24px_64px_rgba(0,0,0,0.15)] overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm/10">
              <div>
                <p className="text-[13px] font-medium text-ink">
                  Order{" "}
                  <span className="text-brand">
                    #{selectedOrder._id.slice(-8).toUpperCase()}
                  </span>
                </p>
                <p className="text-[11px] text-ink-faint mt-0.5">
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedOrder.status} />
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-warm/20 text-ink-muted hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Customer info */}
            <div className="px-5 py-4 border-b border-warm/10 grid grid-cols-2 gap-3">
              {[
                { icon: User, label: "Name", val: selectedOrder.name },
                { icon: Mail, label: "Email", val: selectedOrder.email },
                { icon: Phone, label: "Phone", val: selectedOrder.phone },
                { icon: MapPin, label: "Address", val: selectedOrder.address },
              ].map(({ icon: Icon, label, val }) => (
                <div
                  key={label}
                  className={label === "Address" ? "col-span-2" : ""}
                >
                  <div className="flex items-start gap-2">
                    <Icon size={12} className="text-brand mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-ink-faint uppercase tracking-[1px]">
                        {label}
                      </p>
                      <p className="text-[12px] text-ink-secondary">{val}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="px-5 py-3 border-b border-warm/10 max-h-52 overflow-y-auto space-y-3">
              {selectedOrder.cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-raised shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={16} className="text-ink-faint" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-ink line-clamp-1">
                      {item.name}
                    </p>
                    <div className="flex gap-2 mt-0.5">
                      {item.size && (
                        <span className="text-[10px] text-ink-muted bg-surface-raised px-1.5 py-0.5 rounded-md border border-warm/20">
                          {item.size}
                        </span>
                      )}
                      <span className="text-[10px] text-ink-faint">
                        × {item.qty}
                      </span>
                    </div>
                  </div>
                  <p className="text-[12px] font-semibold text-ink shrink-0">
                    ₹{item.price * item.qty}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-ink-faint mb-1">Update Status</p>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder._id, e.target.value)
                  }
                  className="text-[12px] font-medium bg-surface-raised border border-warm/20 rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-brand"
                >
                  {STATUSES.slice(1).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-ink-faint mb-0.5">Total</p>
                <p className="text-xl font-semibold text-brand">
                  ₹{selectedOrder.totalAmount}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
