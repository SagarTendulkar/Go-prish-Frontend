import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import toast from "react-hot-toast";
import { Newspaper, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SkeletonDetails } from "@/components/Skeletons";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProduct, setSimilarProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        const prodRes = await axiosInstance.get(`/products`);
        const resReviews = await axiosInstance.get(`/products/${id}/reviews`);
        setProduct(res.data);
        setSimilarProduct(prodRes.data);
        setReviews(resReviews.data);
        // console.log("first", res.data);

        // Default setup — show first variant & first image
        if (res.data?.variants?.length > 0) {
          const firstVariant = res.data.variants[0];
          setSelectedColor(firstVariant);
          setMainImage(firstVariant.images[0]);
        } else {
          // fallback if no variants
          setMainImage(res.data.images?.[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // console.log(
  //   "selected size and color",
  //   selectedSize,
  //   selectedColor?.colorCode
  // );

  const toggleWishlist = () => {
    setWishlisted(!wishlisted);
    toast.success(
      wishlisted ? "Removed from Wishlist" : "Added to Wishlist ❤️"
    );
  };

  const handleAddToCart = async () => {
    try {
      await axiosInstance.post("/cart/add", {
        userId: user._id,
        productId: product._id,
        size: selectedSize,
        color: selectedColor.colorCode,
      });

      toast.success(`${product.name} added to cart 🛒`);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // console.log("user", user);
  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) {
      toast.error("Please add rating and comment");
      return;
    }
    try {
      const res = await axiosInstance.post(`/products/${id}/reviews`, {
        userId: user._id,
        name: user.name || "Anonymous",
        rating,
        comment,
      });

      toast.success("Review added successfully!");
      setReviews([res.data.review, ...reviews]);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  if (loading) return <SkeletonDetails />;

  if (!product)
    return (
      <div className="text-center p-10 text-gray-500">Product not found</div>
    );

  // Safeguard for sizes in current color
  const availableSizes = selectedColor?.sizes || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 bg-light text-dark">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* LEFT – Sticky image gallery */}
        <div className="md:sticky md:top-24 self-start">
          <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-card mb-4">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <div className="flex gap-3 justify-center">
            {(selectedColor?.images || product.images || []).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumb-${idx}`}
                onClick={() => setMainImage(img)}
                className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 ${
                  mainImage === img ? "border-primary" : "border-transparent"
                } hover:scale-105 transition`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT – Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Price Section */}
          <div className="flex items-baseline gap-4 mb-6">
            <p className="text-3xl font-bold text-primary">
              ₹
              {selectedSize
                ? availableSizes.find((s) => s.size === selectedSize)?.price ||
                  product.basePrice
                : product.basePrice}
            </p>
            <span className="text-gray-400 line-through text-lg">
              ₹
              {selectedSize
                ? availableSizes.find((s) => s.size === selectedSize)?.mrp ||
                  product.mrp
                : product.mrp}
            </span>
            <span className="text-green-600 font-semibold">
              {product.discount}% OFF
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-yellow-500 text-xl font-semibold">
              ⭐ {product.averageRating} /5
            </span>
            <span className="text-gray-500">
              ({product.reviews.length} reviews)
            </span>
          </div>

          {/* Low stock */}
          {availableSizes.some((s) => s.countInStock < 10) && (
            <p className="bg-red-100 text-red-600 inline-block px-3 py-1 rounded-md text-sm mb-4">
              Limited stock available!
            </p>
          )}

          {/* Color selector */}
          {product.variants?.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Select Color:</h3>
              <div className="flex gap-3">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedColor(variant);
                      setMainImage(variant.images[0]);
                      setSelectedSize("");
                    }}
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                      selectedColor?._id === variant._id
                        ? "border-primary scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: variant.colorCode }}
                  ></button>
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Select Size:</h3>
            <div className="flex gap-3 flex-wrap">
              {availableSizes.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setSelectedSize(s.size)}
                  disabled={s.countInStock <= 0}
                  className={`px-4 py-2 border rounded-lg ${
                    selectedSize === s.size
                      ? "bg-primary text-white"
                      : "border-gray-300 text-gray-600"
                  } hover:bg-accent hover:text-dark transition ${
                    s.countInStock <= 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          {/* 🛒 Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            {/* ✅ Add to Cart Button */}
            <button
              onClick={() => {
                if (!selectedSize) {
                  toast.error("Please select a size before adding to cart!");
                  return;
                }
                handleAddToCart();
              }}
              disabled={!selectedSize}
              className={`relative px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
                selectedSize
                  ? "bg-primary text-white hover:bg-accent cursor-pointer hover:shadow-md hover:scale-[1.02]"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
              title={!selectedSize ? "Select a size to enable Add to Cart" : ""}
            >
              Add to Cart
              {!selectedSize && (
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                  👕 Please select a size
                </span>
              )}
            </button>

            {/* ❤️ Wishlist Button */}
            <button
              onClick={toggleWishlist}
              className={`flex items-center gap-2 border px-8 py-3 rounded-xl transition-all duration-300 ${
                wishlisted
                  ? "border-red-400 bg-red-50 text-red-600 hover:bg-red-100"
                  : "border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500"
              }`}
            >
              {wishlisted ? (
                <>
                  <AiFillHeart className="text-red-500" /> Wishlisted
                </>
              ) : (
                <>
                  <AiOutlineHeart /> Add to Wishlist
                </>
              )}
            </button>
          </div>

          {/* 🧩 Key Features */}
          {product.keyFeatures?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3">Key Features</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-gray-700">
                {product.keyFeatures.map((f, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between border-b border-stone-300 mb-1"
                  >
                    <span className="text-sm text-gray-500">{f.label}</span>
                    <span className="text-lg font-medium mb-3">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📂 Accordion Section */}
          <div className="divide-y mt-10">
            <details className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer text-lg font-medium">
                <div className="flex items-center gap-2 px-2">
                  <Newspaper size={18} />
                  <span className="text-xl ml-2">Product Description</span>
                </div>
                <span className="transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-7 text-gray-700 leading-relaxed">
                {product.productDescription || product.description}
              </p>
            </details>

            {/* Reviews Section */}
            <details className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer text-lg font-medium">
                <div className="flex items-center gap-2 px-2">
                  <Star size={18} />
                  <span className="text-xl ml-2 flex items-center gap-2">
                    Customer Reviews
                    <span className="flex items-center text-yellow-500 font-semibold">
                      {product.averageRating
                        ? product.averageRating.toFixed(1)
                        : "0.0"}
                      <Star
                        size={18}
                        className="ml-1 fill-yellow-500 text-yellow-500"
                      />
                    </span>
                    <span className="text-gray-500  font-semibold">/ 5</span>
                    {product.reviews?.length > 0 && (
                      <span className="text-gray-500 text-sm ml-2">
                        ({product.reviews.length} Reviews)
                      </span>
                    )}
                  </span>
                </div>
                <span className="transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>

              <div className="mt-7">
                {/* ⭐ Add Review Form */}
                {user ? (
                  <div className="bg-gray-50 p-5 rounded-xl mb-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Write a Review
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl ${
                            rating >= star ? "text-yellow-500" : "text-gray-400"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full border rounded-lg p-3 focus:outline-primary"
                      rows="3"
                      placeholder="Share your experience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    <button
                      onClick={handleSubmitReview}
                      className="mt-3 bg-primary text-white px-6 py-2 rounded-lg hover:bg-accent transition"
                    >
                      Submit Review
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Please log in to write a review.
                  </p>
                )}

                {/* 📋 Display Reviews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.length > 0 ? (
                    reviews.slice(0, 6).map((r) => (
                      <div
                        key={r._id}
                        className="border-l-4 border-primary bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">
                            {r.name || "User"}
                          </span>
                          <span className="text-yellow-500 text-m">
                            {"★".repeat(r.rating)}
                            {"☆".repeat(5 - r.rating)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {r.comment}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2 text-center">
                      No reviews yet. Be the first!
                    </p>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* 🛍 Similar products */}
      <section className="mt-20">
        <h2 className="text-3xl font-serif text-primary text-center mb-8">
          Similar Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {similarProduct.slice(0, 3).map((prod) => (
            <Link
              target="_blank"
              to={`/products/${prod._id}`}
              key={prod._id}
              className="bg-white rounded-2xl shadow-card hover:shadow-lg transition-all duration-300 p-4 hover:-translate-y-1"
            >
              <img
                src={prod.thumbnailImage}
                alt={prod.name}
                className="w-full h-56 object-cover rounded-xl mb-4"
              />
              <h3 className="text-lg font-semibold text-dark">{prod.name}</h3>
              <p className="text-primary font-medium mt-1">₹{prod.basePrice}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
