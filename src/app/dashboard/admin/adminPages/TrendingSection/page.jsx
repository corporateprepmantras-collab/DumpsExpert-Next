"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ImageUploader from "@/components/dashboard/ImageUploader";

export default function ManageTrendingSection() {
  // Categories State
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    title: "",
    redirectLink: "",
    description: "",
    order: 0,
  });

  // Products State
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newProduct, setNewProduct] = useState({
    title: "",
    redirectLink: "",
    description: "",
    order: 0,
  });

  // UI State
  const [activeTab, setActiveTab] = useState("categories"); // "categories" or "products"
  const [categoryImages, setCategoryImages] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categoryResetKey, setCategoryResetKey] = useState(0);
  const [productResetKey, setProductResetKey] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // ========== Fetch Data ==========
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/trending-categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/trending-products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // ========== Image Upload Functions ==========
  const handleCategoryImagesSelect = (files) => {
    setCategoryImages(files);
  };

  const handleProductImagesSelect = (files) => {
    setProductImages(files);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post("/api/upload-trending-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.imageUrl;
  };

  // ========== Category Functions ==========
  const addCategory = async () => {
    if (!newCategory.title.trim()) {
      alert("Category title is required");
      return;
    }
    if (!newCategory.redirectLink.trim()) {
      alert("Redirect link is required");
      return;
    }

    try {
      setUploading(true);
      let imageUrl = "";

      // Upload image if file is selected
      if (categoryImages.length > 0) {
        imageUrl = await uploadImage(categoryImages[0]);
      }

      await axios.post("/api/trending-categories", {
        ...newCategory,
        image: imageUrl,
      });

      setNewCategory({
        title: "",
        redirectLink: "",
        description: "",
        order: 0,
      });
      setCategoryImages([]);
      setCategoryResetKey((prev) => prev + 1);
      fetchCategories();
      alert("Category added successfully!");
    } catch (error) {
      console.error("❌ Error adding category:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Delete this category and all its products?")) return;
    try {
      await axios.delete(`/api/trending-categories?id=${id}`);
      fetchCategories();
      fetchProducts(); // Refresh products as they might be deleted
      alert("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  // ========== Product Functions ==========
  const addProduct = async () => {
    if (!selectedCategoryId) {
      alert("Please select a category");
      return;
    }
    if (!newProduct.title.trim()) {
      alert("Product title is required");
      return;
    }
    if (!newProduct.redirectLink.trim()) {
      alert("Redirect link is required");
      return;
    }

    const category = categories.find((cat) => cat._id === selectedCategoryId);
    if (!category) {
      alert("Category not found");
      return;
    }

    try {
      setUploading(true);
      let imageUrl = "";

      // Upload image if file is selected
      if (productImages.length > 0) {
        imageUrl = await uploadImage(productImages[0]);
      }

      await axios.post("/api/trending-products", {
        trendingCategoryId: selectedCategoryId,
        categoryName: category.title,
        ...newProduct,
        image: imageUrl,
      });

      setNewProduct({
        title: "",
        redirectLink: "",
        description: "",
        order: 0,
      });
      setProductImages([]);
      setProductResetKey((prev) => prev + 1);
      fetchProducts();
      alert("Product added successfully!");
    } catch (error) {
      console.error("❌ Error adding product:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/trending-products?id=${id}`);
      fetchProducts();
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  // Get products for selected category
  const getProductsByCategory = (categoryId) => {
    return products.filter((p) => p.trendingCategoryId === categoryId);
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Manage Trending Categories & Products
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "categories"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Trending Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "products"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Trending Products ({products.length})
          </button>
        </div>

        {/* ========== CATEGORIES TAB ========== */}
        {activeTab === "categories" && (
          <div>
            {/* Add Category Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Add New Category
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newCategory.title}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, title: e.target.value })
                  }
                  placeholder="Category Title (required)"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newCategory.redirectLink}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      redirectLink: e.target.value,
                    })
                  }
                  placeholder="Redirect Link (required) e.g., itcertifications/aws"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description (optional)"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Category Image (Optional)
                  </label>
                  <ImageUploader
                    onImagesSelect={handleCategoryImagesSelect}
                    resetKey={categoryResetKey}
                  />
                </div>

                <input
                  type="number"
                  value={newCategory.order}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Display Order (0 = first)"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addCategory}
                  disabled={uploading}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Add Category"}
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Existing Categories
              </h2>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
                  No trending categories yet. Add one to get started.
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4 flex-1">
                        {cat.image && (
                          <img
                            src={cat.image}
                            alt={cat.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-800">
                            {cat.title}
                          </h3>
                          {cat.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {cat.description}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mt-2">
                            Link:{" "}
                            <span className="text-blue-600 break-all">
                              {cat.redirectLink}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Order: {cat.order} | Products:{" "}
                            {getProductsByCategory(cat._id).length}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCategory(cat._id)}
                        className="text-red-600 hover:text-red-800 font-semibold px-4 py-2 bg-red-100 rounded hover:bg-red-200 transition whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========== PRODUCTS TAB ========== */}
        {activeTab === "products" && (
          <div>
            {/* Add Product Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Add New Product
              </h2>
              <div className="space-y-3">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a Category (required)</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, title: e.target.value })
                  }
                  placeholder="Product Title (required)"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newProduct.redirectLink}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      redirectLink: e.target.value,
                    })
                  }
                  placeholder="Redirect Link (required) e.g., exam/aws-certified-solutions-architect"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description (optional)"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Product Image (Optional)
                  </label>
                  <ImageUploader
                    onImagesSelect={handleProductImagesSelect}
                    resetKey={productResetKey}
                  />
                </div>

                <input
                  type="number"
                  value={newProduct.order}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Display Order (0 = first)"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addProduct}
                  disabled={uploading}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Add Product"}
                </button>
              </div>
            </div>

            {/* Products List - Grouped by Category */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Existing Products
              </h2>
              {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
                  No trending products yet. Add one to get started.
                </div>
              ) : (
                categories.map((cat) => {
                  const categoryProducts = getProductsByCategory(cat._id);
                  if (categoryProducts.length === 0) return null;

                  return (
                    <div
                      key={cat._id}
                      className="bg-white rounded-lg shadow p-6"
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
                        {cat.title} ({categoryProducts.length})
                      </h3>
                      <div className="space-y-3">
                        {categoryProducts.map((product) => (
                          <div
                            key={product._id}
                            className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex gap-4 flex-1">
                                {product.image && (
                                  <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800">
                                    {product.title}
                                  </h4>
                                  {product.description && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {product.description}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-600 mt-1">
                                    Link:{" "}
                                    <span className="text-blue-600 break-all">
                                      {product.redirectLink}
                                    </span>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Order: {product.order}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteProduct(product._id)}
                                className="text-red-600 hover:text-red-800 font-semibold px-4 py-2 bg-red-100 rounded hover:bg-red-200 transition whitespace-nowrap"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
