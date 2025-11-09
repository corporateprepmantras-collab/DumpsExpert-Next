"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

const CategoryPage = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAdd, setIsAdd] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    sectionName: "",
    slug: "",
    language: "",
    category: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
    schema: "",
    openGraphTitle: "",
    openGraphDescription: "",
    openGraphImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/blog-categories");
      setCategories(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure to delete this category?")) return;
    try {
      await axios.delete(`/api/blog-categories/${id}`);
      toast.success("Category deleted");
      setCategories(categories.filter((c) => c._id !== id));
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const handleEdit = (category) => {
    setIsAdd(false);
    setSelectedCategory(category);
    setFormData({
      sectionName: category.sectionName,
      slug: category.slug,
      language: category.language,
      category: category.category,
      metaTitle: category.metaTitle,
      metaKeywords: category.metaKeywords,
      metaDescription: category.metaDescription,
      schema: category.schema || "",
      openGraphTitle: category.openGraphTitle || "",
      openGraphDescription: category.openGraphDescription || "",
      openGraphImage: category.openGraphImage || "",
      twitterTitle: category.twitterTitle || "",
      twitterDescription: category.twitterDescription || "",
      twitterImage: category.twitterImage || "",
    });
    setPreview(category.imageUrl);
    setImageFile(null);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setIsAdd(true);
    setSelectedCategory(null);
    setFormData({
      sectionName: "",
      slug: "",
      language: "",
      category: "",
      metaTitle: "",
      metaKeywords: "",
      metaDescription: "",
      schema: "",
      openGraphTitle: "",
      openGraphDescription: "",
      openGraphImage: "",
      twitterTitle: "",
      twitterDescription: "",
      twitterImage: "",
    });
    setImageFile(null);
    setOpenModal(true);
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (imageFile) data.append("image", imageFile);

      let res;
      if (isAdd) {
        res = await axios.post("/api/blog-categories", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setCategories([...categories, res.data.data]);
        toast.success("Category added");
      } else {
        res = await axios.put(
          `/api/blog-categories/${selectedCategory._id}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setCategories(
          categories.map((c) =>
            c._id === selectedCategory._id ? res.data.data : c
          )
        );
        toast.success("Category updated");
      }
      setOpenModal(false);
    } catch {
      toast.error("Failed to save category");
    }
  };

  const filtered = categories.filter((p) =>
    p.category.toLowerCase().includes(search.toLowerCase())
  );

return (
    <div className="container pt-20 flex flex-col items-center mx-auto p-4">
      <Toaster position="top-right" />
      <h1 className="text-xl font-bold mb-4">Category Management</h1>

      <div className="flex justify-between w-full mb-4">
        <input
          type="text"
          className="border p-2 rounded w-1/2"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleAdd}
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="border w-full">
          <thead>
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Image</th>
              <th className="border p-2">Section</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Language</th>
              <th className="border p-2">Meta Title</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((category, i) => (
              <tr key={category._id} className="text-center">
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">
                  <img
                    src={category.imageUrl}
                    className="h-12 w-12 object-cover mx-auto"
                    alt={category.category}
                  />
                </td>
                <td className="border p-2">{category.sectionName}</td>
                <td className="border p-2">{category.category}</td>
                <td className="border p-2">{category.language}</td>
                <td className="border p-2">{category.metaTitle}</td>
                <td className="border p-2 flex justify-center gap-2">
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(category._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-[450px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {isAdd ? "Add Category" : "Edit Category"}
            </h2>

            <div className="flex flex-col gap-2">
              {[
                "sectionName",
                "category",
                "slug",
                "metaTitle",
                "metaKeywords",
                "metaDescription",
                "openGraphTitle",
                "openGraphDescription",
                "openGraphImage",
                "twitterTitle",
                "twitterDescription",
                "twitterImage",
              ].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field}
                  value={formData[field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                  className="border p-2 rounded"
                />
              ))}

              <textarea
                placeholder="JSON Schema"
                value={formData.schema}
                onChange={(e) =>
                  setFormData({ ...formData, schema: e.target.value })
                }
                className="border p-2 rounded h-20"
              />

              <select
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option value="">Select Language</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="border p-2 rounded"
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover mx-auto rounded"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setOpenModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                {isAdd ? "Add" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
