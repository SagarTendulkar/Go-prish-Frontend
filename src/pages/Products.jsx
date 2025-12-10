import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FiltersSidebar";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import SortDropdown from "../components/SortDropdown";
import { useLocation, useParams } from "react-router-dom";
import { SkeletonCard } from "@/components/Skeletons";
import { Filter } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("relevance");
  const [filterOpen, setFilterOpen] = useState(false);

  const { user } = useAuth();
  const { slug } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");
  const isFeatured =
    new URLSearchParams(location.search).get("featured") === "true";

  console.log("first", filterOpen);

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let res;

        if (query) {
          res = await axiosInstance.get(`/products?search=${query}`);
        } else if (slug) {
          res = await axiosInstance.get(`/products/by-slug/${slug}`);
        } else if (isFeatured) {
          res = await axiosInstance.get("/products/featured");
        } else {
          res = await axiosInstance.get("/products");
        }

        setProducts(res.data.products || res.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug, query, isFeatured]);

  // ✅ Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?._id) return;
      try {
        const res = await axiosInstance.get(`/wishlist/${user._id}`);
        setWishlist(res.data.products.map((item) => item._id));
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };
    fetchWishlist();
  }, [user]);

  // ✅ Toggle Wishlist
  const toggleWishlist = async (productId, e) => {
    e.preventDefault();
    try {
      if (wishlist.includes(productId)) {
        await axiosInstance.delete(`/wishlist/${user._id}/${productId}`);
        setWishlist((prev) => prev.filter((id) => id !== productId));
      } else {
        await axiosInstance.post(`/wishlist/${user._id}/${productId}`);
        setWishlist((prev) => [...prev, productId]);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  // ✅ Apply filters
  const filteredProducts = products.filter((product) => {
    const { selectedPrice, selectedSizes, selectedColors } = filters;

    if (selectedPrice) {
      const { min, max } = selectedPrice;
      if (product.basePrice < min || product.basePrice > max) return false;
    }

    if (selectedSizes?.length) {
      const hasSize = product.variants?.some((v) =>
        v.sizes?.some((s) => selectedSizes.includes(s.size))
      );
      if (!hasSize) return false;
    }

    if (selectedColors?.length) {
      const hasColor = product.variants?.some((v) =>
        selectedColors.includes(v.colorCode?.toLowerCase())
      );
      if (!hasColor) return false;
    }

    return true;
  });

  // ✅ Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "lowToHigh") return a.basePrice - b.basePrice;
    if (sortBy === "highToLow") return b.basePrice - a.basePrice;
    if (sortBy === "newest")
      return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  // ✅ Loading Skeleton
  if (loading)
    return (
      <div className="max-w-7xl mx-auto mt-20 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20 sm:pb-6">
      {/* 🧭 Header + Sort + Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary capitalize">
          {query
            ? `Search results for “${query}”`
            : slug
            ? slug.replace(/-/g, " ")
            : isFeatured
            ? "Featured Products"
            : "Our Products"}
        </h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-light rounded-lg sm:hidden"
          >
            <Filter size={18} />
            Filters
          </button>

          <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ✅ Sidebar (Desktop Only) */}
        <div className="hidden lg:block w-64">
          <FilterSidebar
            products={products}
            onFilterChange={setFilters}
            instantApply={true} // live update
          />
        </div>

        {/* ✅ Product Grid */}
        <div className="flex-1">
          {sortedProducts.length === 0 ? (
            <p className="text-center text-gray-600 mt-8">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📱 Mobile Filter Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end lg:hidden">
          <div className="bg-white w-80 max-w-[85%] h-full shadow-xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Filters</h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="text-gray-600 hover:text-primary text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <FilterSidebar
              products={products}
              onFilterChange={setFilters}
              instantApply={false} // 🔹 use Apply button mode
              onClose={() => setFilterOpen(false)} // 🔹 close after Apply
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
