import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Enter category name");

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
      alert("✅ Category added!");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("❌ Failed to add category");
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axiosInstance.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("❌ Delete failed");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-semibold text-primary mb-6">
        Manage Categories
      </h2>

      {/* Add Category */}
      <form onSubmit={handleAddCategory} className="mb-6 space-y-3">
        <div>
          <label className="block font-medium mb-1">Category Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Men, Women, Half Sleeve"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Category Image (Optional)
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Paste image URL or leave empty"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent"
          />
          {image && (
            <img
              src={image}
              alt="Preview"
              className="mt-2 w-20 h-20 object-cover rounded-md border border-gray-200"
            />
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">
            Parent Category (Optional)
          </label>
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-accent"
          >
            <option value="">None</option>
            {categories
              .filter((cat) => !cat.parentCategory)
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-primary text-light px-4 py-2 rounded-lg hover:bg-accent hover:text-dark transition"
        >
          Add Category
        </button>
      </form>

      {/* Category List */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 text-lg">Existing Categories</h3>
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories yet.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat._id}
                className="flex justify-between items-center border-b pb-1"
              >
                <div>
                  <span className="font-medium">{cat.name}</span>
                  {cat.parentCategory && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Sub of {cat.parentCategory.name})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
