import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";

// ✅ Validation Schema
const schema = yup.object().shape({
  name: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  postalCode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Invalid postal code")
    .required("Postal code is required"),
});

const Checkout = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });
  // const userId = "tempUser"; // replace with actual user id
  const [cart, setCart] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axiosInstance.get(`/cart/${user._id}`);
        setCart(res.data);
        console.log("setCart", res.data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (!cart || cart.products.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      // 🧮 Calculate total amount
      const totalAmount = cart.products.reduce(
        (sum, item) => sum + item.basePrice * item.qty,
        0
      );

      // 🧾 Combine form + cart data
      const orderData = {
        userId: user._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        cart: cart.products.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.basePrice,
          qty: item.qty,
          image: item.image,
          size: item.size,
          color: item.color,
        })),
        totalAmount,
      };

      // 🚀 Send order to backend
      await axiosInstance.post("/orders", orderData);
      console.log("orderDataorderData", orderData);
      // 🧹 Clear Cart after successful order
      await axiosInstance.delete(`/cart/clear/${user._id}`);
      setCart({ userId: user._id, products: [] });

      alert("✅ Order placed successfully!");
      reset();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("❌ Something went wrong, please try again!");
    }
  };

  if (!cart || cart.products.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Your cart is empty. <br />
        <a href="/products" className="text-primary underline">
          Shop Now
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 grid md:grid-cols-2 gap-8">
      {/* Left: Checkout Form */}
      <div className="bg-white shadow-soft rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          Shipping Details
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Inputs same as before, but replace yellow focus ring with brand color */}
          <div>
            <input
              {...register("name")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-primary/30"
              placeholder="Full Name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs">{errors.name.message}</p>
            )}
          </div>
          <div>
            <input
              {...register("email")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-yellow-200"
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>
          <div>
            <input
              {...register("phone")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-yellow-200"
              placeholder="10-digit number"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs">{errors.phone.message}</p>
            )}
          </div>
          <div>
            <textarea
              {...register("address")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-yellow-200"
              placeholder="Street, house no., landmark"
            />
            {errors.address && (
              <p className="text-red-500 text-xs">{errors.address.message}</p>
            )}
          </div>
          <div>
            <input
              {...register("city")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-yellow-200"
              placeholder="City name"
            />
            {errors.city && (
              <p className="text-red-500 text-xs">{errors.city.message}</p>
            )}
          </div>
          <div>
            <input
              {...register("postalCode")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-yellow-200"
              placeholder="e.g. 560001"
            />
            {errors.postalCode && (
              <p className="text-red-500 text-xs">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white py-3 rounded-lg hover:bg-accent transition font-semibold"
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>

      {/* Right: Order Summary */}
      <div className="bg-light rounded-2xl shadow-inner p-6">
        <h3 className="text-xl font-semibold mb-4 text-dark">Order Summary</h3>
        {cart?.products?.map((item) => (
          <div key={item.productId} className="flex justify-between mb-3">
            <span>
              {item.name} × {item.qty}
            </span>
            <span className="font-medium text-primary">
              ₹{item.basePrice * item.qty}
            </span>
          </div>
        ))}
        <hr className="my-4" />
        <p className="text-lg font-bold text-dark">
          Total:{" "}
          <span className="text-primary">
            ₹{cart?.products?.reduce((sum, i) => sum + i.basePrice * i.qty, 0)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Checkout;
