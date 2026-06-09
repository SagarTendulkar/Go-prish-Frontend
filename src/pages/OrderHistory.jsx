import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";
import {
  Package,
  MapPin,
  Clock,
  ChevronDown,
  ShoppingBag,
  CheckCircle2,
  Truck,
  Circle,
  XCircle,
  Timer,
  ClockFading,
} from "lucide-react";

// ── Status config ─────────────────────────────────────────────
const STATUS = {
  Pending: {
    icon: ClockFading,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  Processing: {
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  Shipped: {
    icon: Truck,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  Delivered: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  Cancelled: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

const getStatus = (status) =>
  STATUS[status] || {
    icon: Circle,
    color: "text-ink-muted",
    bg: "bg-surface-raised",
    border: "border-warm/20",
  };

// ── Single order card ─────────────────────────────────────────
const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const { icon: StatusIcon, color, bg, border } = getStatus(order.status);

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="bg-surface-card rounded-2xl border border-warm/15 overflow-hidden hover:shadow-[0_4px_24px_rgba(140,90,60,0.08)] transition-shadow duration-300"
      data-aos="fade-up"
    >
      {/* ── Card header ────────────────────────────────────── */}
      <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center shrink-0">
            <Package size={17} className="text-brand" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-ink">
              Order{" "}
              <span className="text-brand">
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock size={11} className="text-ink-faint" />
              <p className="text-[11px] text-ink-faint">
                {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status badge */}
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${color} ${bg} ${border}`}
          >
            <StatusIcon size={11} />
            {order.status}
          </span>

          {/* Total */}
          <span className="text-[14px] font-semibold text-brand">
            ₹{order.totalAmount}
          </span>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-warm/20 text-ink-muted hover:border-brand hover:text-brand transition-all duration-200"
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── Collapsed preview — first item + count ──────────── */}
      {!expanded && (
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {order.cart[0]?.image && (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-raised shrink-0">
                <img
                  src={order.cart[0].image}
                  alt={order.cart[0].name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-[12px] text-ink-secondary line-clamp-1">
              {order.cart[0]?.name}
              {order.cart.length > 1 && (
                <span className="text-ink-faint">
                  {" "}
                  +{order.cart.length - 1} more
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="text-[11px] text-brand hover:underline"
          >
            View details
          </button>
        </div>
      )}

      {/* ── Expanded details ────────────────────────────────── */}
      {expanded && (
        <div className="px-5 py-4 space-y-4">
          {/* Items list */}
          <div className="space-y-3">
            {order.cart.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image ? (
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-raised shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-surface-raised flex items-center justify-center shrink-0">
                    <Package size={20} className="text-ink-faint" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink line-clamp-1">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {item.size && (
                      <span className="text-[10px] font-medium text-ink-muted bg-surface-raised px-2 py-0.5 rounded-md border border-warm/20">
                        {item.size}
                      </span>
                    )}
                    {item.color && (
                      <span className="flex items-center gap-1 text-[10px] text-ink-muted bg-surface-raised px-2 py-0.5 rounded-md border border-warm/20">
                        <span
                          className="w-2 h-2 rounded-full border border-warm/30 shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        Color
                      </span>
                    )}
                    <span className="text-[11px] text-ink-faint">
                      × {item.qty}
                    </span>
                  </div>
                </div>
                <p className="text-[13px] font-semibold text-ink shrink-0">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-warm/10" />

          {/* Address + total row */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex items-start gap-2 text-[12px] text-ink-secondary">
              <MapPin size={13} className="text-brand mt-0.5 shrink-0" />
              <p className="leading-relaxed">{order.address}</p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[11px] text-ink-faint mb-0.5">Order Total</p>
              <p className="text-lg font-semibold text-brand">
                ₹{order.totalAmount}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    axiosInstance
      .get(`/orders/user/${user._id}`)
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, [user]);

  // ── Loading ───────────────────────────────────────────────
  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-card rounded-2xl border border-warm/15 p-5 animate-pulse"
          >
            <div className="flex justify-between mb-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-raised" />
                <div className="space-y-2">
                  <div className="w-32 h-3 bg-surface-raised rounded-full" />
                  <div className="w-24 h-2.5 bg-surface-raised rounded-full" />
                </div>
              </div>
              <div className="w-20 h-6 bg-surface-raised rounded-full" />
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-raised" />
              <div className="w-40 h-3 bg-surface-raised rounded-full mt-2" />
            </div>
          </div>
        ))}
      </div>
    );

  // ── Error ─────────────────────────────────────────────────
  if (error)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="font-serif text-xl text-ink mb-2">Something went wrong</p>
        <p className="text-ink-muted text-sm">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-surface-raised border-b border-warm/20 py-7 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-1">
            My Account
          </p>
          <div className="flex items-end justify-between">
            <h1 className="font-serif text-2xl sm:text-3xl text-ink">
              Order History
            </h1>
            {orders.length > 0 && (
              <p className="text-[13px] text-ink-muted">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Empty state ───────────────────────────────────── */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-raised flex items-center justify-center mb-5">
              <ShoppingBag size={32} className="text-ink-faint" />
            </div>
            <h2 className="font-serif text-xl text-ink mb-2">No orders yet</h2>
            <p className="text-ink-muted text-sm mb-6 max-w-xs">
              You haven't placed any orders yet. Start shopping to see your
              history here!
            </p>
            <Link
              to="/products"
              className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,122,74,0.35)]"
            >
              <ShoppingBag size={15} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
