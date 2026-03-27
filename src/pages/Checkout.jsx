import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Hash,
  ArrowRight,
  ShieldCheck,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Validation schema ─────────────────────────────────────────
const schema = yup.object().shape({
  name: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Must be 10 digits")
    .required("Phone is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  postalCode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Invalid postal code")
    .required("Postal code is required"),
});

// ── Reusable input field ──────────────────────────────────────
const Field = ({ icon: Icon, placeholder, error, register, type = "text" }) => (
  <div>
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-surface-card transition-all duration-200
      ${error ? "border-red-300 bg-red-50/30" : "border-warm/30 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"}`}
    >
      <Icon
        size={15}
        className={`shrink-0 ${error ? "text-red-400" : "text-ink-faint"}`}
      />
      <input
        type={type}
        {...register}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[13px] text-ink placeholder-ink-faint outline-none"
      />
    </div>
    {error && <p className="text-[11px] text-red-500 mt-1 ml-1">{error}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────
const Checkout = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const [cart, setCart] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDemoUser = user?.email === "demo@goprish.com";

  // ── Fetch cart ────────────────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get(`/cart/${user._id}`)
      .then((res) => setCart(res.data))
      .catch((err) => console.error("Error fetching cart:", err));
  }, []);

  // ── Totals ────────────────────────────────────────────────
  const subtotal =
    cart?.products?.reduce((sum, i) => sum + i.basePrice * i.qty, 0) || 0;
  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  // ── Submit handler ────────────────────────────────────────
  const onSubmit = async (data) => {
    try {
      if (!cart || cart.products.length === 0) {
        toast.error("Your cart is empty!");
        return;
      }

      // Create Razorpay order
      const res = await axiosInstance.post("/payment/create-order", {
        amount: total,
      });
      const order = res.data;

      const options = {
        key: "rzp_test_SHtrGV1qNX7Lm1",
        amount: order.amount,
        currency: order.currency,
        name: "GoPrish",
        description: "Clothing Purchase",
        order_id: order.id,
        prefill: {
          name: data.name,
          email: data.email,
          contact: data.phone,
        },
        theme: { color: "#c97a4a" },

        handler: async function (response) {
          const orderData = {
            userId: user._id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: `${data.address}, ${data.city} - ${data.postalCode}`,
            cart: cart.products.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.basePrice,
              qty: item.qty,
              image: item.thumbnailImage,
              size: item.size,
              color: item.color,
            })),
            totalAmount: total,
            paymentId: response.razorpay_payment_id,
          };

          const verifyRes = await axiosInstance.post("/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderData,
          });

          if (verifyRes.data.success) {
            toast.success("Order placed successfully! 🎉");
            navigate("/orderHistory");
            reset();
          } else {
            toast.error("Payment verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Payment failed to start");
    }
  };

  // ── Empty cart ────────────────────────────────────────────
  if (cart && cart.products.length === 0)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="font-serif text-xl text-ink mb-2">Your cart is empty</p>
        <p className="text-ink-muted text-sm mb-5">
          Add some items before checking out.
        </p>
        <Link
          to="/products"
          className="px-6 py-3 bg-brand-dark text-white rounded-full text-sm font-medium hover:bg-brand transition-all"
        >
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
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">Checkout</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          {/* ── LEFT: Shipping form ──────────────────────── */}
          <div className="bg-surface-card rounded-2xl border border-warm/15 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={16} className="text-brand" />
              <h2 className="text-[15px] font-medium text-ink">
                Shipping Details
              </h2>
            </div>

            {/* Demo user banner */}
            {isDemoUser && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[12px] px-4 py-3 rounded-xl mb-5">
                <ShieldCheck size={14} className="shrink-0" />
                Demo account — checkout is disabled for this user.
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <Field
                icon={User}
                placeholder="Full Name"
                register={register("name")}
                error={errors.name?.message}
              />
              <Field
                icon={Mail}
                placeholder="Email address"
                type="email"
                register={register("email")}
                error={errors.email?.message}
              />
              <Field
                icon={Phone}
                placeholder="10-digit phone number"
                type="tel"
                register={register("phone")}
                error={errors.phone?.message}
              />

              {/* Address textarea */}
              <div>
                <div
                  className={`flex items-start gap-3 px-4 py-3 rounded-xl border bg-surface-card transition-all duration-200
                  ${errors.address ? "border-red-300 bg-red-50/30" : "border-warm/30 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"}`}
                >
                  <MapPin
                    size={15}
                    className={`mt-0.5 shrink-0 ${errors.address ? "text-red-400" : "text-ink-faint"}`}
                  />
                  <textarea
                    {...register("address")}
                    placeholder="Street address, house no., landmark"
                    rows={2}
                    className="flex-1 bg-transparent text-[13px] text-ink placeholder-ink-faint outline-none resize-none"
                  />
                </div>
                {errors.address && (
                  <p className="text-[11px] text-red-500 mt-1 ml-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* City + Postal in a row */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  icon={Building}
                  placeholder="City"
                  register={register("city")}
                  error={errors.city?.message}
                />
                <Field
                  icon={Hash}
                  placeholder="Postal code"
                  register={register("postalCode")}
                  error={errors.postalCode?.message}
                />
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type={isDemoUser ? "button" : "submit"}
                  disabled={isDemoUser || isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-300
                    ${
                      isDemoUser
                        ? "bg-warm/30 text-ink-faint cursor-not-allowed"
                        : isSubmitting
                          ? "bg-brand-dark/70 text-white cursor-wait"
                          : "bg-brand-dark text-white hover:bg-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,122,74,0.35)] cursor-pointer"
                    }`}
                >
                  {isDemoUser ? (
                    <>
                      <Lock size={14} />
                      Demo Mode — Checkout Disabled
                    </>
                  ) : isSubmitting ? (
                    "Processing…"
                  ) : (
                    <>
                      Pay ₹{total}
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                {/* Security note */}
                {!isDemoUser && (
                  <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink-faint mt-3">
                    <ShieldCheck size={12} />
                    Secured by Razorpay — 100% safe checkout
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* ── RIGHT: Order summary ─────────────────────── */}
          <div className="space-y-4">
            <div className="bg-surface-card rounded-2xl border border-warm/15 p-5">
              <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-brand mb-4">
                Order Summary
              </p>

              {/* Items */}
              <div className="space-y-3 pb-4 border-b border-warm/15">
                {cart?.products?.map((item) => (
                  <div key={item.productId} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-raised shrink-0">
                      <img
                        src={item.thumbnailImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-ink line-clamp-1">
                        {item.name}
                      </p>
                      <div className="flex gap-1.5 mt-0.5">
                        {item.size && (
                          <span className="text-[10px] text-ink-muted bg-surface-raised px-1.5 py-0.5 rounded-md">
                            {item.size}
                          </span>
                        )}
                        <span className="text-[10px] text-ink-faint">
                          × {item.qty}
                        </span>
                      </div>
                    </div>
                    <p className="text-[12px] font-semibold text-ink shrink-0">
                      ₹{item.basePrice * item.qty}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-[13px]">
                  <span className="text-ink-muted">Subtotal</span>
                  <span className="text-ink font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-ink-muted">Shipping</span>
                  <span
                    className={
                      shipping === 0
                        ? "text-green-600 font-medium"
                        : "text-ink font-medium"
                    }
                  >
                    {shipping === 0 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-warm/15">
                  <span className="text-[14px] font-medium text-ink">
                    Total
                  </span>
                  <span className="text-xl font-semibold text-brand">
                    ₹{total}
                  </span>
                </div>
              </div>

              {/* Free shipping nudge */}
              {shipping > 0 && (
                <p className="text-[11px] text-ink-muted bg-surface-raised rounded-xl px-3 py-2 mt-3 text-center">
                  Add ₹{999 - subtotal} more for free shipping 🚚
                </p>
              )}
            </div>

            {/* Trust badges */}
            <div className="bg-surface-card rounded-2xl border border-warm/15 p-4 space-y-2.5">
              {[
                { icon: ShieldCheck, text: "100% Secure Payment" },
                { icon: Lock, text: "Your data is protected" },
                { icon: ArrowRight, text: "Easy 7-day returns" },
              ].map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-[12px] text-ink-muted"
                >
                  <Icon size={13} className="text-brand shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
