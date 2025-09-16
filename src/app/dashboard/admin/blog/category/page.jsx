"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import axios from "axios";

const CategoryPage = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAdd, setIsAdd] = useState(false);
  const [preview, setPreview] =
    useState (categories?.imageUrl || null);
  const [imageFile, setImageFile] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    sectionName: "",
    category: "",
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
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
      console.error(error.message);
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
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  const handleEdit = (category) => {
    setIsAdd(false);
    setSelectedCategory(category);
    setFormData({
      sectionName: category.sectionName,
      category: category.category,
      metaTitle: category.metaTitle,
      metaKeywords: category.metaKeywords,
      metaDescription: category.metaDescription,
    });
    setPreview(categories?.imageUrl)
    setImageFile(null);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setIsAdd(true);
    setSelectedCategory(null);
    setFormData({
      sectionName: "",
      category: "",
      metaTitle: "",
      metaKeywords: "",
      metaDescription: "",
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
      if (imageFile) {
        data.append("image", imageFile); // backend pe multer ya cloudinary handle karega
      }

      let res;
      if (isAdd) {
        res = await axios.post("/api/blog-categories", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Category added");
        setCategories([...categories, res.data.data]);
      } else {
        res = await axios.put(
          `/api/blog-categories/${selectedCategory._id}`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Category updated");
        setCategories(
          categories.map((c) =>
            c._id === selectedCategory._id ? res.data.data : c
          )
        );
      }
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    }
  };

  const filtered = categories.filter((p) =>
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container flex flex-col items-center mx-auto p-4">
      <ToastContainer />
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
              <th className="border p-2">ID</th>
              <th className="border p-2">Image</th>
              <th className="border p-2">Section Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Meta Title</th>
              <th className="border p-2">Meta Keywords</th>
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
                    alt={category.category}
                    className="h-12 w-12 object-cover mx-auto"
                  />
                </td>
                <td className="border p-2">{category.sectionName}</td>
                <td className="border p-2">{category.category}</td>
                <td className="border p-2">{category.metaTitle}</td>
                <td className="border p-2">{category.metaKeywords}</td>
                <td className="border p-2 flex gap-2 justify-center">
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
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() =>
                      router.push(`/dashboard/admin/blog/${category._id}`)
                    }
                  >
                    View Blogs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {openModal && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              {isAdd ? "Add Category" : "Edit Category"}
            </h2>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Section Name"
                value={formData.sectionName}
                onChange={(e) =>
                  setFormData({ ...formData, sectionName: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="border p-2 rounded"
              />

              {/* 👇 File input for image */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="border p-2 rounded"
              />
              {preview && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Preview:</p>
                  <img
                    src={preview}
                    alt="Selected"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}

              <input
                type="text"
                placeholder="Meta Title"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Meta Keywords"
                value={formData.metaKeywords}
                onChange={(e) =>
                  setFormData({ ...formData, metaKeywords: e.target.value })
                }
                className="border p-2 rounded"
              />
              <textarea
                placeholder="Meta Description"
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                className="border p-2 rounded"
              />
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
