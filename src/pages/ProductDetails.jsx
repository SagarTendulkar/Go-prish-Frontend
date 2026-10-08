import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { Heart, ShoppingCart, ChevronDown, Star, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { SkeletonDetails } from "@/components/Skeletons";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false); // ← prevent double click
  const [mainImage, setMainImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  // ── Fetch product + wishlist status ──────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Build requests — add wishlist fetch only if user is logged in
        const requests = [
          axiosInstance.get(`/products/${id}`),
          axiosInstance.get(`/products`),
          axiosInstance.get(`/products/${id}/reviews`),
        ];
        if (user?._id) {
          requests.push(axiosInstance.get(`/wishlist/${user._id}`));
        }

        const [res, allRes, reviewsRes, wishlistRes] =
          await Promise.all(requests);

        setProduct(res.data);
        setSimilarProducts(allRes.data?.slice(0, 4) || []);
        setReviews(reviewsRes.data);

        // ✅ Check if this product is already in wishlist
        if (wishlistRes) {
          const wishlistIds =
            wishlistRes.data.products?.map((p) =>
              typeof p === "object" ? p._id : p,
            ) || [];
          setWishlisted(wishlistIds.includes(id));
        }

        // Set default color + image
        if (res.data?.variants?.length > 0) {
          const first = res.data.variants[0];
          setSelectedColor(first);
          setMainImage(first.images[0]);
        } else {
          setMainImage(res.data.images?.[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, user?._id]);

  // ── Toggle wishlist — calls API ───────────────────────────
  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please login to use wishlist");
      return;
    }
    if (wishlistLoading) return; // prevent spam clicks

    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await axiosInstance.delete(`/wishlist/${user._id}/${id}`);
        setWishlisted(false);
        toast.success("Removed from wishlist");
        await window.refreshNavCounts?.();
      } else {
        await axiosInstance.post(`/wishlist/${user._id}/${id}`);
        setWishlisted(true);
        toast.success("Added to wishlist ❤️");
        await window.refreshNavCounts?.();
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Something went wrong");
    } finally {
      setWishlistLoading(false);
    }
  };

  // ── Add to cart ───────────────────────────────────────────
  const handleAddToCart = async () => {
    try {
      await axiosInstance.post("/cart/add", {
        userId: user._id,
        productId: product._id,
        size: selectedSize,
        color: selectedColor.colorCode,
        colorName: selectedColor.color,
      });
      toast.success(`${product.name} added to cart 🛒`);
      await window.refreshNavCounts?.();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  // ── Submit review ─────────────────────────────────────────
  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) {
      toast.error("Please add a rating and comment");
      return;
    }
    try {
      const res = await axiosInstance.post(`/products/${id}/reviews`, {
        userId: user._id,
        name: user.name || "Anonymous",
        rating,
        comment,
      });
      toast.success("Review added!");
      setReviews([res.data.review, ...reviews]);
      setRating(0);
      setComment("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    }
  };

  if (loading) return <SkeletonDetails />;
  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-muted">
        Product not found
      </div>
    );

  const availableSizes = selectedColor?.sizes || [];
  const currentPrice = selectedSize
    ? availableSizes.find((s) => s.size === selectedSize)?.price ||
      product.basePrice
    : product.basePrice;
  const currentMrp = selectedSize
    ? availableSizes.find((s) => s.size === selectedSize)?.mrp || product.mrp
    : product.mrp;
  const discountPercent =
    currentMrp > currentPrice
      ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100)
      : product.discount;

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Main product section ─────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* ── LEFT: Image gallery ───────────────────────────── */}
          <div className="md:sticky md:top-24 self-start" data-aos="fade-right">
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-surface-raised mb-3">
              <img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(selectedColor?.images || product.images || []).map(
                (img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0
                    ${
                      mainImage === img
                        ? "border-brand scale-105"
                        : "border-transparent hover:border-warm"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ),
              )}
            </div>
          </div>

          {/* ── RIGHT: Product info ───────────────────────────── */}
          <div data-aos="fade-left">
            {/* Category breadcrumb */}
            <p className="text-[11px] font-medium tracking-[2px] uppercase text-brand mb-2">
              {product.category?.parentCategory?.name
                ? `${product.category.parentCategory.name} / ${product.category.name}`
                : product.category?.name || ""}
            </p>

            {/* Name */}
            <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal leading-snug mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    className={
                      s <= Math.round(product.averageRating)
                        ? "text-[#e8a87c] fill-[#e8a87c]"
                        : "text-warm"
                    }
                  />
                ))}
              </div>
              <span className="text-[12px] text-ink-muted">
                {product.averageRating?.toFixed(1)} ({product.reviews?.length}{" "}
                reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-warm/20">
              <span className="text-2xl sm:text-3xl font-semibold text-brand">
                ₹{currentPrice}
              </span>
              {currentMrp > currentPrice && (
                <>
                  <span className="text-ink-faint line-through text-base">
                    ₹{currentMrp}
                  </span>
                  <span className="text-[12px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Low stock */}
            {availableSizes.some(
              (s) => s.countInStock > 0 && s.countInStock < 10,
            ) && (
              <p className="text-[12px] font-medium text-red-500 bg-red-50 border border-red-100 inline-block px-3 py-1.5 rounded-full mb-4">
                Only a few left — order soon!
              </p>
            )}

            {/* Color selector */}
            {product.variants?.length > 0 && (
              <div className="mb-5">
                <p className="text-[12px] font-medium text-ink-muted uppercase tracking-[1px] mb-2">
                  Color
                  {selectedColor?.color && (
                    <span className="ml-2 normal-case font-normal text-ink">
                      — {selectedColor.color}
                    </span>
                  )}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedColor(variant);
                        setMainImage(variant.images[0]);
                        setSelectedSize("");
                      }}
                      title={variant.color}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-200 shrink-0
                        ${
                          selectedColor?._id === variant._id
                            ? "border-brand scale-110 shadow-[0_0_0_3px_rgba(201,122,74,0.2)]"
                            : "border-warm/50 hover:scale-110"
                        }`}
                      style={{ backgroundColor: variant.colorCode }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div className="mb-6">
              <p className="text-[12px] font-medium text-ink-muted uppercase tracking-[1px] mb-2">
                Size
                {selectedSize && (
                  <span className="ml-2 normal-case font-normal text-ink">
                    — {selectedSize}
                  </span>
                )}
              </p>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedSize(s.size)}
                    disabled={s.countInStock <= 0}
                    className={`min-w-11 px-3 py-2 rounded-xl text-[13px] font-medium border transition-all duration-200
                      ${
                        selectedSize === s.size
                          ? "bg-brand-dark text-white border-brand-dark"
                          : s.countInStock <= 0
                            ? "opacity-35 cursor-not-allowed border-warm/30 text-ink-faint line-through"
                            : "border-warm/40 text-ink-secondary hover:border-brand hover:text-brand"
                      }`}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-[11px] text-ink-faint mt-2">
                  Please select a size
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => {
                  if (!selectedSize) {
                    toast.error("Please select a size first!");
                    return;
                  }
                  handleAddToCart();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-300
                  ${
                    selectedSize
                      ? "bg-brand-dark text-white hover:bg-brand hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(201,122,74,0.35)] cursor-pointer"
                      : "bg-warm/30 text-ink-faint cursor-not-allowed"
                  }`}
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>

              {/* ✅ Wishlist button — now calls API */}
              <button
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                className={`w-14 flex items-center justify-center rounded-2xl border-2 transition-all duration-200
                  ${
                    wishlisted
                      ? "border-red-300 bg-red-50 text-red-500"
                      : "border-warm/40 text-ink-muted hover:border-red-300 hover:text-red-500 hover:bg-red-50"
                  }
                  ${wishlistLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Heart
                  size={18}
                  className={`transition-all duration-200 ${wishlisted ? "fill-red-500" : ""} ${wishlistLoading ? "animate-pulse" : ""}`}
                />
              </button>
            </div>

            {/* Key features */}
            {product.keyFeatures?.length > 0 && (
              <div className="mb-6 p-4 bg-surface-raised rounded-2xl">
                <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-brand mb-3">
                  Key Features
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {product.keyFeatures.map((f, i) => (
                    <div key={i}>
                      <p className="text-[11px] text-ink-faint">{f.label}</p>
                      <p className="text-[13px] font-medium text-ink mt-0.5">
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accordions */}
            <div className="space-y-2">
              {/* Description */}
              <div className="border border-warm/20 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setDescOpen((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-surface-card hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-2 text-[14px] font-medium text-ink">
                    <FileText size={15} className="text-brand" />
                    Product Description
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-ink-muted transition-transform duration-200 ${descOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${descOpen ? "max-h-96" : "max-h-0"}`}
                >
                  <p className="px-4 pb-4 pt-1 text-[13px] text-ink-secondary leading-relaxed">
                    {product.productDescription ||
                      product.description ||
                      "No description available."}
                  </p>
                </div>
              </div>

              {/* Reviews */}
              <div className="border border-warm/20 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setReviewOpen((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-surface-card hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-2 text-[14px] font-medium text-ink">
                    <Star size={15} className="text-brand" />
                    Customer Reviews
                    <span className="text-[12px] text-ink-muted font-normal">
                      ({product.reviews?.length || 0})
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-ink-muted transition-transform duration-200 ${reviewOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${reviewOpen ? "max-h-[1000px]" : "max-h-0"}`}
                >
                  <div className="px-4 pb-5 pt-2 space-y-4">
                    {/* Write review form */}
                    {user ? (
                      <div className="bg-surface-raised rounded-xl p-4">
                        <p className="text-[13px] font-medium text-ink mb-3">
                          Write a Review
                        </p>
                        <div className="flex gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                size={20}
                                className={`${
                                  star <= (hoverRating || rating)
                                    ? "text-[#e8a87c] fill-[#e8a87c]"
                                    : "text-warm"
                                } transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          className="w-full border border-warm/30 rounded-xl p-3 text-[13px] text-ink bg-surface-card placeholder-ink-faint outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 resize-none transition-all"
                          rows="3"
                          placeholder="Share your experience…"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <button
                          onClick={handleSubmitReview}
                          className="mt-2 px-5 py-2 bg-brand-dark text-white rounded-full text-[13px] font-medium hover:bg-brand transition-colors duration-200"
                        >
                          Submit Review
                        </button>
                      </div>
                    ) : (
                      <p className="text-[13px] text-ink-muted italic">
                        Please log in to write a review.
                      </p>
                    )}

                    {/* Review list */}
                    {reviews.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {reviews.slice(0, 6).map((r) => (
                          <div
                            key={r._id}
                            className="bg-surface-card rounded-xl p-3.5 border border-warm/15"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[13px] font-medium text-ink">
                                {r.name || "User"}
                              </span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={11}
                                    className={
                                      s <= r.rating
                                        ? "text-[#e8a87c] fill-[#e8a87c]"
                                        : "text-warm"
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-[12px] text-ink-secondary leading-relaxed">
                              {r.comment}
                            </p>
                            <p className="text-[11px] text-ink-faint mt-1.5">
                              {new Date(r.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-ink-muted text-center py-4">
                        No reviews yet. Be the first!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Products ─────────────────────────────────── */}
      {similarProducts.length > 0 && (
        <section className="bg-surface-raised py-12 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8" data-aos="fade-up">
              <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-2">
                You May Also Like
              </p>
              <h2 className="font-serif text-2xl text-ink">Similar Products</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
              {similarProducts.map((prod, i) => (
                <Link
                  key={prod._id}
                  to={`/products/${prod._id}`}
                  data-aos="fade-up"
                  data-aos-delay={i * 80}
                  className="group bg-surface-card rounded-2xl overflow-hidden border border-warm/15 hover:shadow-[0_8px_32px_rgba(140,90,60,0.1)] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={prod.thumbnailImage}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-[13px] font-medium text-ink line-clamp-2 leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-brand font-semibold text-sm mt-1">
                      ₹{prod.basePrice}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
