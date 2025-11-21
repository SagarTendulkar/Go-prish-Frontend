import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get("/products");
        setProducts(response.data);
        console.log("fetching products:", response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      alert("✅ Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("❌ Failed to delete product!");
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-dark/70 font-medium">
        Loading products...
      </p>
    );
  }

  return (
    <div className="bg-light p-8 font-sans text-dark">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-semibold text-primary">
          Products
        </h2>
        <Link
          to="/admin/products/add"
          className="bg-primary text-light px-5 py-2 rounded-xl shadow-soft hover:bg-accent hover:text-dark transition"
        >
          + Add Product
        </Link>
      </div>

      {/* Product Table */}
      {products.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/40 border-b">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <React.Fragment key={product._id}>
                  {/* 🟢 Product Row */}
                  <tr className="border-b hover:bg-accent/10 transition">
                    <td className="py-3 px-4">
                      <img
                        src={product.thumbnailImage}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </td>

                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center justify-between">
                        <span>{product.name}</span>
                        {product.variants?.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === product._id ? null : product._id
                              )
                            }
                            className="text-sm text-primary hover:text-dark ml-4"
                          >
                            {expandedId === product._id
                              ? "Hide Variants ▲"
                              : "Show Variants ▼"}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-dark/70">
                      {product.category
                        ? product.category.parentCategory
                          ? ` ${product.category.name}`
                          : product.category.name
                        : "—"}
                    </td>

                    <td className="py-3 px-4 text-center space-x-2">
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="px-3 py-1 bg-accent text-dark rounded-lg hover:bg-primary hover:text-light transition"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {/* 🔽 Expanded Variant Section */}
                  {expandedId === product._id && (
                    <tr className="bg-gray-50 border-b">
                      <td colSpan="4" className="p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Variants
                        </h4>
                        {product.variants?.length > 0 ? (
                          <div className="space-y-3">
                            {product.variants.map((v, i) => (
                              <div
                                key={i}
                                className="border-l-4 border-primary bg-white p-3 rounded-lg"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <span
                                    className="w-6 h-6 rounded-full border"
                                    style={{ backgroundColor: v.colorCode }}
                                  ></span>
                                  <span className="font-medium text-gray-700">
                                    {v.color || "Unnamed Color"}
                                  </span>
                                  <span className="text-gray-500 text-sm ml-2">
                                    {v.colorCode}
                                  </span>
                                </div>

                                <div className="ml-8 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {v.sizes.map((s, j) => (
                                    <div
                                      key={j}
                                      className="text-sm text-gray-700 border-b border-gray-200 pb-1"
                                    >
                                      {s.size} — ₹{s.price} ({s.countInStock}{" "}
                                      left)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">
                            No variants added yet.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
