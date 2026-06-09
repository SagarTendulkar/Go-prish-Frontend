import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { SkeletonListItem } from "@/components/Skeletons";
import { Trash2, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

const Cart = () => {
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null); // track which item is being removed
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Fetch cart ────────────────────────────────────────────
  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get(`/cart/${user._id}`);
      setCart(res.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ── Remove from cart ──────────────────────────────────────
  const removeFromCart = async (productId, size, color) => {
    setRemoving(productId);
    try {
      await axiosInstance.post("/cart/remove", {
        userId: user._id,
        productId,
        size,
        color,
      });
      toast.success("Item removed from cart");
      fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  const handleCheckout = () => {
    if (cart.products.length === 0) {
      toast.error("Your cart is empty!");
      return navigate("/products");
    }
    navigate("/checkout");
  };

  // ── Totals ────────────────────────────────────────────────
  const subtotal = cart.products.reduce(
    (sum, item) => sum + item.basePrice * item.qty,
    0,
  );
  const totalItems = cart.products.reduce((sum, item) => sum + item.qty, 0);

  // ── Loading ───────────────────────────────────────────────
  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {[...Array(3)].map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    );

  // ── Empty state ───────────────────────────────────────────
  if (cart.products.length === 0)
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-raised flex items-center justify-center mb-5">
          <ShoppingCart size={32} className="text-ink-faint" />
        </div>
        <h2 className="font-serif text-2xl text-ink mb-2">
          Your cart is empty
        </h2>
        <p className="text-ink-muted text-sm mb-6 max-w-xs">
          Looks like you haven't added anything yet. Start exploring our
          collections!
        </p>
        <Link
          to="/products"
          className="flex items-center gap-2 px-6 py-3 bg-brand-dark text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,122,74,0.35)]"
        >
          <ShoppingBag size={15} />
          Browse Products
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Page header ───────────────────────────────────── */}
      <div className="bg-surface-raised border-b border-warm/20 py-7 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-1">
            Go Prish
          </p>
          <div className="flex items-end justify-between">
            <h1 className="font-serif text-2xl sm:text-3xl text-ink">
              Your Cart
            </h1>
            <p className="text-[13px] text-ink-muted">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Cart items list ──────────────────────────── */}
          <div className="flex-1 space-y-3">
            {cart.products.map((item) => (
              <div
                key={item.productId}
                className="group flex gap-4 bg-surface-card rounded-2xl p-4 border border-warm/15 hover:shadow-[0_4px_24px_rgba(140,90,60,0.08)] transition-all duration-300"
              >
                {/* Product image */}
                <Link to={`/products/${item.productId}`} className="shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-raised">
                    <img
                      src={item.thumbnailImage}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>

                {/* Product info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link to={`/products/${item.productId}`}>
                      <h3 className="text-[14px] font-medium text-ink line-clamp-2 leading-snug hover:text-brand transition-colors">
                        {item.name}
                      </h3>
                    </Link>

                    {/* Size + Color pills */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {item.size && (
                        <span className="text-[11px] font-medium text-ink-muted bg-surface-raised px-2.5 py-0.5 rounded-full border border-warm/20">
                          Size: {item.size}
                        </span>
                      )}
                      {item.color && (
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted bg-surface-raised px-2.5 py-0.5 rounded-full border border-warm/20">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-warm/30 inline-block shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          Color
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Price + qty */}
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-brand">
                        ₹{item.basePrice * item.qty}
                      </span>
                      {item.qty > 1 && (
                        <span className="text-[11px] text-ink-faint">
                          ₹{item.basePrice} × {item.qty}
                        </span>
                      )}
                    </div>

                    {/* Qty badge + Remove */}
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-ink-muted bg-surface-raised px-3 py-1 rounded-full border border-warm/20">
                        Qty: {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          removeFromCart(item.productId, item.size, item.color)
                        }
                        disabled={removing === item.productId}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl border border-warm/20 text-ink-faint transition-all duration-200
                          ${
                            removing === item.productId
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:border-red-300 hover:text-red-500 hover:bg-red-50"
                          }`}
                      >
                        <Trash2
                          size={14}
                          className={
                            removing === item.productId ? "animate-pulse" : ""
                          }
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping link */}
            <Link
              to="/products"
              className="flex items-center gap-2 text-[13px] text-ink-muted hover:text-brand transition-colors pt-1 w-fit"
            >
              <ArrowRight size={13} className="rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* ── Order summary ────────────────────────────── */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-surface-card rounded-2xl border border-warm/15 p-5 lg:sticky lg:top-24">
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-brand mb-4">
                Order Summary
              </p>

              {/* Line items */}
              <div className="space-y-2.5 pb-4 border-b border-warm/15">
                {cart.products.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between items-start gap-2"
                  >
                    <p className="text-[12px] text-ink-secondary line-clamp-2 flex-1">
                      {item.name}
                      <span className="text-ink-faint"> × {item.qty}</span>
                    </p>
                    <p className="text-[12px] font-medium text-ink shrink-0">
                      ₹{item.basePrice * item.qty}
                    </p>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center py-3.5 border-b border-warm/15">
                <p className="text-[13px] text-ink-muted">Subtotal</p>
                <p className="text-[13px] font-medium text-ink">₹{subtotal}</p>
              </div>

              {/* Shipping */}
              <div className="flex justify-between items-center py-3.5 border-b border-warm/15">
                <p className="text-[13px] text-ink-muted">Shipping</p>
                <p className="text-[13px] font-medium text-green-600">
                  {subtotal >= 999 ? "Free" : `₹49`}
                </p>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 pb-5">
                <p className="text-[14px] font-medium text-ink">Total</p>
                <p className="text-xl font-semibold text-brand">
                  ₹{subtotal >= 999 ? subtotal : subtotal + 49}
                </p>
              </div>

              {subtotal < 999 && (
                <p className="text-[11px] text-ink-muted bg-surface-raised rounded-xl px-3 py-2 mb-4 text-center">
                  Add ₹{999 - subtotal} more for free shipping 🚚
                </p>
              )}

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-dark text-white rounded-2xl text-[14px] font-medium transition-all duration-300 hover:bg-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,122,74,0.35)] cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
