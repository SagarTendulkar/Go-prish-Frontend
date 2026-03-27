import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Package,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setDeleting(id);
    try {
      await axiosInstance.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Loading skeleton ──────────────────────────────────────
  if (loading)
    return (
      <div className="p-6 sm:p-8 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-card rounded-xl border border-warm/15 p-4 animate-pulse flex gap-4 items-center"
          >
            <div className="w-12 h-12 rounded-xl bg-surface-raised shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-surface-raised rounded-full w-40" />
              <div className="h-2.5 bg-surface-raised rounded-full w-24" />
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-1">
            Management
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">Products</h1>
        </div>
        <Link
          to="/admin/products/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-dark text-white rounded-xl text-[13px] font-medium transition-all duration-200 hover:bg-brand hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(201,122,74,0.35)] w-fit"
        >
          <Plus size={15} />
          Add Product
        </Link>
      </div>

      {/* ── Search ────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-4 py-2.5 text-[13px] text-ink bg-surface-card border border-warm/20 rounded-xl outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all placeholder-ink-faint"
        />
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-surface-card rounded-2xl border border-warm/15 py-16 text-center">
          <Package size={32} className="text-ink-faint mx-auto mb-3" />
          <p className="text-ink-muted text-sm">No products found</p>
        </div>
      ) : (
        <div className="bg-surface-card rounded-2xl border border-warm/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full text-left">
              <thead>
                <tr className="border-b border-warm/10">
                  {[
                    "",
                    "Product",
                    "Category",
                    "Price",
                    "Variants",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-[11px] font-medium tracking-[1px] uppercase text-ink-muted whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <React.Fragment key={product._id}>
                    <tr className="border-b border-warm/8 hover:bg-surface-raised transition-colors">
                      {/* Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-surface-raised shrink-0">
                          <img
                            src={product.thumbnailImage}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <p className="text-[13px] font-medium text-ink line-clamp-1 max-w-[200px]">
                          {product.name}
                        </p>
                        {product.isFeatured && (
                          <span className="text-[10px] font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                            Featured
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-[12px] text-ink-muted whitespace-nowrap">
                        {product.category?.name || "—"}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 text-[13px] font-semibold text-brand whitespace-nowrap">
                        ₹{product.basePrice}
                      </td>

                      {/* Variants toggle */}
                      <td className="py-3 px-4">
                        {product.variants?.length > 0 ? (
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === product._id ? null : product._id,
                              )
                            }
                            className="flex items-center gap-1 text-[11px] font-medium text-ink-muted hover:text-brand transition-colors"
                          >
                            {product.variants.length} variants
                            <ChevronDown
                              size={12}
                              className={`transition-transform duration-200 ${expandedId === product._id ? "rotate-180" : ""}`}
                            />
                          </button>
                        ) : (
                          <span className="text-[11px] text-ink-faint">
                            None
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-xl border border-warm/20 text-ink-muted hover:border-brand hover:text-brand hover:bg-brand/5 transition-all"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deleting === product._id}
                            className="w-8 h-8 flex items-center justify-center rounded-xl border border-warm/20 text-ink-muted hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2
                              size={13}
                              className={
                                deleting === product._id ? "animate-pulse" : ""
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── Expanded variants row ──────────────── */}
                    {expandedId === product._id && (
                      <tr className="border-b border-warm/8 bg-surface-raised">
                        <td colSpan={6} className="px-4 py-4">
                          <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-brand mb-3">
                            Variants
                          </p>
                          <div className="space-y-3">
                            {product.variants.map((v, i) => (
                              <div
                                key={i}
                                className="bg-surface-card rounded-xl border border-warm/15 p-3"
                              >
                                <div className="flex items-center gap-2.5 mb-2.5">
                                  <span
                                    className="w-5 h-5 rounded-full border-2 border-warm/30 shrink-0"
                                    style={{ backgroundColor: v.colorCode }}
                                  />
                                  <span className="text-[13px] font-medium text-ink">
                                    {v.color || "Unnamed"}
                                  </span>
                                  <span className="text-[11px] text-ink-faint">
                                    {v.colorCode}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 ml-7">
                                  {v.sizes.map((s, j) => (
                                    <div
                                      key={j}
                                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px]
                                        ${
                                          s.countInStock === 0
                                            ? "border-red-200 bg-red-50 text-red-500"
                                            : s.countInStock < 5
                                              ? "border-amber-200 bg-amber-50 text-amber-600"
                                              : "border-warm/20 bg-surface-raised text-ink-secondary"
                                        }`}
                                    >
                                      <span className="font-medium">
                                        {s.size}
                                      </span>
                                      <span className="text-ink-faint">·</span>
                                      <span>₹{s.price}</span>
                                      <span className="text-ink-faint">·</span>
                                      <span>{s.countInStock} left</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer count */}
      <p className="text-[12px] text-ink-faint text-right">
        Showing {filtered.length} of {products.length} products
      </p>
    </div>
  );
};

export default AdminProducts;
