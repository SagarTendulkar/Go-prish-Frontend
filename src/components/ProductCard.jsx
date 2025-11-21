import { Link } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart, AiFillShopping } from "react-icons/ai";

const ProductCard = ({
  product,
  wishlist = [],
  toggleWishlist,
  removeFromWishlist,
  isWishlistPage = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 relative overflow-hidden">
      <Link target="_blank" to={`/products/${product._id}`}>
        <div className="overflow-hidden">
          <img
            src={product.thumbnailImage}
            alt={product.name}
            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>

      {!isWishlistPage && (
        <button
          onClick={(e) => toggleWishlist(product._id, e)}
          className="absolute top-3 right-3 bg-white/80 p-2 rounded-full backdrop-blur-md shadow"
        >
          {wishlist.includes(product._id) ? (
            <AiFillHeart className="text-red-500 text-xl" />
          ) : (
            <AiOutlineHeart className="text-gray-600 text-xl" />
          )}
        </button>
      )}

      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {product.category
            ? product.category.parentCategory
              ? ` ${product.category.name}`
              : product.category.name
            : "—"}
        </p>
        <p className="text-lg font-bold text-primary mt-2">
          ₹{product.basePrice}
        </p>

        <div className="flex flex-col gap-2 mt-4">
          {isWishlistPage && (
            <button
              onClick={() => removeFromWishlist(product._id)}
              className="w-full bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
