import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import { SkeletonListItem } from "@/components/Skeletons";

const Cart = () => {
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // const userId = "tempUser"; // temporary until login implemented
  // Fetch cart items
  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get(`/cart/${user._id}`);
      setCart(res.data);
      console.log("useruseruseruser", res.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      await axiosInstance.post("/cart/remove", {
        userId: user._id,
        productId,
      });
      fetchCart(); // refresh cart after removal
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const handleCheckout = () => {
    if (cart.products.length === 0) {
      alert("Your cart is empty!");
      return navigate("/products");
    }
    navigate("/checkout");
  };

  if (loading)
    return (
      <div className="p-6 mx-70 mt-16">
        {[...Array(4)].map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    );

  if (cart.products.length === 0)
    return (
      <div className="text-center mt-20 text-gray-600 text-lg">
        Your cart is empty
      </div>
    );

  // Calculate total
  const total = cart.products.reduce(
    (sum, item) => sum + item.basePrice * item.qty,
    0
  );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-primary text-center">
        Your Cart
      </h2>

      {cart.products.map((item) => (
        <div
          key={item.productId}
          className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl shadow-soft p-4 mb-4 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <img
              src={item.thumbnailImage}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
            <div>
              <h3 className="font-semibold text-dark">{item.name}</h3>
              <p className="text-gray-500 text-sm">{item.category}</p>
              <p className="font-bold text-primary">₹{item.basePrice}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <p className="text-gray-600 font-medium">Qty: {item.qty}</p>
            <button
              onClick={() => removeFromCart(item.productId)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {/* Summary Section */}
      <div className="text-right mt-8 border-t border-gray-200 pt-4">
        <p className="text-xl font-semibold">
          Total: <span className="text-primary font-bold">₹{total}</span>
        </p>
        <button
          onClick={handleCheckout}
          className="mt-3 bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
