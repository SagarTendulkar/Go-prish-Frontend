import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const ProductCard = ({
  product,
  wishlist = [],
  toggleWishlist,
  removeFromWishlist,
  isWishlistPage = false,
}) => {
  const isWishlisted = wishlist.includes(product._id);
  const discountPercent =
    product.mrp > product.basePrice
      ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)
      : null;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-brand/15 hover:shadow-[0_8px_32px_rgba(140,90,60,0.12)] transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link
        to={`/products/${product._id}`}
        className="block overflow-hidden aspect-square"
        target="_blank"
      >
        <img
          src={product.thumbnailImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Discount badge */}
      {discountPercent && (
        <div className="absolute top-3 left-3 bg-brand text-white text-[10px] font-semibold px-2 py-1 rounded-full">
          -{discountPercent}%
        </div>
      )}

      {/* Wishlist button */}
      {!isWishlistPage && (
        <button
          onClick={(e) => toggleWishlist(product._id, e)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-200
            ${
              isWishlisted
                ? "bg-red-50 border-red-200 text-red-500"
                : "bg-white/80 border-white/60 text-ink-muted hover:text-red-500 hover:bg-red-50"
            }`}
        >
          <Heart size={14} className={isWishlisted ? "fill-red-500" : ""} />
        </button>
      )}

      {/* Info */}
      <div className="p-3 pt-2.5">
        <p className="text-[11px] text-ink-faint mb-0.5">
          {product.category?.name || ""}
        </p>
        <h3 className="text-[13px] font-medium text-brand-dark line-clamp-2 leading-snug mb-1.5">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-brand font-semibold text-sm">
            ₹{product.basePrice}
          </p>
          {product.mrp > product.basePrice && (
            <p className="text-[11px] text-ink-faint line-through">
              ₹{product.mrp}
            </p>
          )}
        </div>

        {/* Wishlist page remove button */}
        {isWishlistPage && (
          <button
            onClick={() => removeFromWishlist(product._id)}
            className="w-full mt-3 py-1.5 rounded-xl text-[12px] font-medium text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors duration-200"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
