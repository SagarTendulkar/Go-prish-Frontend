import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { SkeletonCard } from "@/components/Skeletons";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id) return; // prevent error on first render
    const fetchWishlist = async () => {
      try {
        const response = await axiosInstance.get(`/wishlist/${user._id}`);
        setWishlist(response.data.products || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast.error("Failed to load wishlist.");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (productId) => {
    try {
      await axiosInstance.delete(`/wishlist/${user._id}/${productId}`);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      toast.success("Removed from wishlist 💔");
      await window.refreshNavCounts?.();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Could not remove item. Try again!");
    }
  };

  const addToCart = async (productId) => {
    try {
      await axiosInstance.post(`/cart/add`, {
        userId: user._id,
        productId,
      });
      toast.success("Added to cart 🛒");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Could not add to cart. Try again!");
    }
  };

  if (loading)
    return (
      <div className="max-w-7xl container mx-auto mt-20 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 💎 Product Grid Skeleton (75%) */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center mt-20 text-center">
        <p className="text-gray-500 text-lg mb-4">Your wishlist is empty ❤️</p>
        <a
          href="/products"
          className="bg-primary text-white px-6 py-2 rounded-full shadow-md hover:bg-accent transition"
        >
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-10 text-primary">
        Your Wishlist ❤️
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <ProductCard
            key={item._id}
            product={item}
            addToCart={addToCart}
            removeFromWishlist={removeFromWishlist}
            isWishlistPage={true}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
