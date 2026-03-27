import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FiltersSidebar";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";
import SortDropdown from "../components/SortDropdown";
import { useLocation, useParams } from "react-router-dom";
import { SkeletonCard } from "@/components/Skeletons";
import { Filter, X, SlidersHorizontal } from "lucide-react";

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

  // ── Fetch products ────────────────────────────────────────
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

  // ── Fetch wishlist ────────────────────────────────────────
  useEffect(() => {
    if (!user?._id) return;
    axiosInstance
      .get(`/wishlist/${user._id}`)
      .then((res) => setWishlist(res.data.products.map((item) => item._id)))
      .catch((err) => console.error("Error fetching wishlist:", err));
  }, [user]);

  // ── Toggle wishlist ───────────────────────────────────────
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

  // ── Apply filters ─────────────────────────────────────────
  const filteredProducts = products.filter((product) => {
    const { selectedPrice, selectedSizes, selectedColors } = filters;
    if (selectedPrice) {
      const { min, max } = selectedPrice;
      if (product.basePrice < min || product.basePrice > max) return false;
    }
    if (selectedSizes?.length) {
      const hasSize = product.variants?.some((v) =>
        v.sizes?.some((s) => selectedSizes.includes(s.size)),
      );
      if (!hasSize) return false;
    }
    if (selectedColors?.length) {
      const hasColor = product.variants?.some((v) =>
        selectedColors.includes(v.colorCode?.toLowerCase()),
      );
      if (!hasColor) return false;
    }
    return true;
  });

  // ── Apply sorting ─────────────────────────────────────────
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "lowToHigh") return a.basePrice - b.basePrice;
    if (sortBy === "highToLow") return b.basePrice - a.basePrice;
    if (sortBy === "newest")
      return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  // ── Page title ────────────────────────────────────────────
  const pageTitle = query
    ? `Results for "${query}"`
    : slug
      ? slug.replace(/-/g, " ")
      : isFeatured
        ? "Featured Products"
        : "All Products";

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bg-surface-raised border-b border-warm/20 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-1">
            Go Prish
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl text-brand-dark capitalize">
              {pageTitle}
            </h1>
            <p className="text-[13px] text-ink-muted">
              {loading ? "Loading..." : `${sortedProducts.length} products`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-8">
        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 gap-3">
          {/* Mobile filter button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium text-ink-secondary bg-white border border-warm/30 transition-all duration-200 hover:border-brand hover:text-brand lg:hidden"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>

          <div className="ml-auto">
            <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        </div>

        <div className="flex gap-6">
          {/* ── Desktop Sidebar ──────────────────────────────── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <FilterSidebar
              products={products}
              onFilterChange={setFilters}
              instantApply={true}
            />
          </aside>

          {/* ── Product Grid ─────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-serif text-xl text-brand-dark mb-2">
                  No products found
                </p>
                <p className="text-sm text-ink-muted">
                  Try adjusting your filters or search
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                {sortedProducts.map((product, i) => (
                  <div
                    key={product._id}
                    data-aos="fade-up"
                    data-aos-delay={i * 50}
                  >
                    <ProductCard
                      product={product}
                      wishlist={wishlist}
                      toggleWishlist={toggleWishlist}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────── */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm/20">
              <h3 className="font-serif text-lg text-brand-dark">Filters</h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand/10 text-ink-muted hover:text-brand transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterSidebar
                products={products}
                onFilterChange={setFilters}
                instantApply={false}
                onClose={() => setFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
