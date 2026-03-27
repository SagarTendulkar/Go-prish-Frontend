import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Plus, Trash2, FolderTree, Image, Tag } from "lucide-react";
import toast from "react-hot-toast";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [image, setImage] = useState("");

  const fetchCategories = () => {
    axiosInstance
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post("/categories", {
        name,
        parentCategory: parent || null,
        image: image || null,
      });
      setName("");
      setParent("");
      setImage("");
      fetchCategories();
      toast.success("Category added!");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(error.response?.data?.message || "Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    setDeleting(id);
    try {
      await axiosInstance.delete(`/categories/${id}`);
      fetchCategories();
      toast.success("Category deleted");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const parentCategories = categories.filter((c) => !c.parentCategory);
  const childCategories = categories.filter((c) => c.parentCategory);

  if (loading)
    return (
      <div className="p-6 sm:p-8 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-card rounded-xl border border-warm/15 p-4 animate-pulse h-14"
          />
        ))}
      </div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Header ────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-brand mb-1">
          Management
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl text-ink">Categories</h1>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* ── Add category form ──────────────────────────── */}
        <div className="bg-surface-card rounded-2xl border border-warm/15 p-5 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <Plus size={15} className="text-brand" />
            <p className="text-[13px] font-medium text-ink">Add New Category</p>
          </div>

          <form onSubmit={handleAdd} className="space-y-3">
            {/* Name */}
            <div>
              <label className="text-[11px] font-medium tracking-[1px] uppercase text-ink-muted block mb-1.5">
                Name *
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-warm/25 bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
                <Tag size={13} className="text-ink-faint shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Men, Women, T-Shirts"
                  className="flex-1 bg-transparent text-[13px] text-ink placeholder-ink-faint outline-none"
                  required
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="text-[11px] font-medium tracking-[1px] uppercase text-ink-muted block mb-1.5">
                Image URL{" "}
                <span className="normal-case font-normal text-ink-faint">
                  (optional)
                </span>
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-warm/25 bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
                <Image size={13} className="text-ink-faint shrink-0" />
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Paste image URL here"
                  className="flex-1 bg-transparent text-[13px] text-ink placeholder-ink-faint outline-none"
                />
              </div>
              {/* Image preview */}
              {image && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-xl border border-warm/20"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  <p className="text-[11px] text-ink-faint">Preview</p>
                </div>
              )}
            </div>

            {/* Parent category */}
            <div>
              <label className="text-[11px] font-medium tracking-[1px] uppercase text-ink-muted block mb-1.5">
                Parent Category{" "}
                <span className="normal-case font-normal text-ink-faint">
                  (optional)
                </span>
              </label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-warm/25 bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
                <FolderTree size={13} className="text-ink-faint shrink-0" />
                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-ink outline-none cursor-pointer appearance-none"
                >
                  <option value="">None (top-level)</option>
                  {parentCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-dark text-white rounded-xl text-[13px] font-medium transition-all duration-200 hover:bg-brand hover:shadow-[0_4px_16px_rgba(201,122,74,0.3)] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              <Plus size={14} />
              {submitting ? "Adding…" : "Add Category"}
            </button>
          </form>
        </div>

        {/* ── Categories list ────────────────────────────── */}
        <div className="space-y-4">
          {/* Parent categories */}
          {parentCategories.length > 0 && (
            <div className="bg-surface-card rounded-2xl border border-warm/15 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-warm/10">
                <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-brand">
                  Top-level Categories ({parentCategories.length})
                </p>
              </div>
              <div className="divide-y divide-warm/8">
                {parentCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-raised transition-colors"
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-10 h-10 rounded-xl object-cover border border-warm/15 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                        <Tag size={15} className="text-brand" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink">
                        {cat.name}
                      </p>
                      <p className="text-[11px] text-ink-faint">
                        {
                          childCategories.filter(
                            (c) => c.parentCategory?._id === cat._id,
                          ).length
                        }{" "}
                        subcategories
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      disabled={deleting === cat._id}
                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-warm/20 text-ink-muted hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <Trash2
                        size={13}
                        className={deleting === cat._id ? "animate-pulse" : ""}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub categories */}
          {childCategories.length > 0 && (
            <div className="bg-surface-card rounded-2xl border border-warm/15 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-warm/10">
                <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-brand">
                  Sub Categories ({childCategories.length})
                </p>
              </div>
              <div className="divide-y divide-warm/8">
                {childCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-raised transition-colors"
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-10 h-10 rounded-xl object-cover border border-warm/15 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-surface-raised flex items-center justify-center shrink-0 border border-warm/15">
                        <Tag size={14} className="text-ink-faint" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink">
                        {cat.name}
                      </p>
                      <p className="text-[11px] text-ink-faint">
                        Under{" "}
                        <span className="text-brand">
                          {cat.parentCategory?.name}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      disabled={deleting === cat._id}
                      className="w-8 h-8 flex items-center justify-center rounded-xl border border-warm/20 text-ink-muted hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                      <Trash2
                        size={13}
                        className={deleting === cat._id ? "animate-pulse" : ""}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {categories.length === 0 && (
            <div className="bg-surface-card rounded-2xl border border-warm/15 py-16 text-center">
              <FolderTree size={32} className="text-ink-faint mx-auto mb-3" />
              <p className="text-ink-muted text-sm">No categories yet</p>
              <p className="text-ink-faint text-[12px] mt-1">
                Add your first category using the form
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
