// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// // import { toast } from "react-toastify";
// import axios from "axios";
// import dynamic from "next/dynamic";
// // import useBlogStore from "@/store/blogStore";
// // import "react-toastify/dist/ReactToastify.css";

// const CKEditor = dynamic(() => import("@ckeditor/ckeditor5-react").then(mod => mod.CKEditor), { ssr: false });
// const ClassicEditor = dynamic(() => import("@ckeditor/ckeditor5-build-classic"), { ssr: false });

// const BlogPosts = () => {
//   const searchParams = useSearchParams();
//   const categoryId = searchParams.get("categoryId") || "";
//   const router = useRouter();

//   // const { blogCategories, fetchBlogCategories, addBlog } = useBlogStore();
//   // const categories = Array.isArray(blogCategories) ? blogCategories : [];

//   const [formData, setFormData] = useState({
//     title: "",
//     content: "",
//     slug: "",
//     category: categoryId,
//     image: null,
//     status: "draft",
//     metaTitle: "",
//     metaKeywords: "",
//     metaDescription: "",
//     schemaData: "{}",
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (categories.length === 0) fetchBlogCategories();
//   }, [categories.length]);

//   useEffect(() => {
//     return () => {
//       if (previewUrl) URL.revokeObjectURL(previewUrl);
//     };
//   }, [previewUrl]);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.title) newErrors.title = "Title is required";
//     if (!formData.content) newErrors.content = "Content is required";
//     if (!formData.category) newErrors.category = "Category is required";
//     if (!formData.image) newErrors.image = "Image is required";
//     if (!formData.metaTitle) newErrors.metaTitle = "Meta Title is required";
//     if (!formData.metaKeywords) newErrors.metaKeywords = "Meta Keywords are required";
//     if (!formData.metaDescription) newErrors.metaDescription = "Meta Description is required";
//     if (formData.schemaData) {
//       try {
//         JSON.parse(formData.schemaData);
//       } catch {
//         newErrors.schemaData = "Invalid JSON format in schema";
//       }
//     }
//     return newErrors;
//   };

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     const updatedValue = name === "image" ? files[0] : value;

//     if (name === "title" && value) {
//       const newSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
//       setFormData((prev) => ({ ...prev, slug: newSlug }));
//     }

//     setFormData((prev) => ({ ...prev, [name]: updatedValue }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));

//     if (name === "image" && files[0]) setPreviewUrl(URL.createObjectURL(files[0]));

//     if (name === "schemaData") {
//       try {
//         JSON.parse(value);
//         setErrors((prev) => ({ ...prev, schemaData: "" }));
//       } catch {
//         setErrors((prev) => ({ ...prev, schemaData: "Invalid JSON format" }));
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     const validationErrors = validateForm();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       setSubmitting(false);
//       return;
//     }

//     try {
//       const blogData = {
//         title: formData.title,
//         content: formData.content,
//         category: formData.category || "",
//         status: formData.status === "draft" ? "unpublish" : "publish",
//         metaTitle: formData.metaTitle,
//         metaKeywords: formData.metaKeywords,
//         metaDescription: formData.metaDescription,
//         schema: formData.schemaData,
//       };

//       const blogFormData = new FormData();
//       Object.entries(blogData).forEach(([key, value]) => {
//         blogFormData.append(key, value);
//       });
//       if (formData.image) blogFormData.append("image", formData.image);

//       const res = await axios.post("http://${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/create", blogFormData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         withCredentials: true,
//       });

//       if (res.data.success) {
//         addBlog(res.data.data);
//         toast.success("Blog post added successfully");
//         router.push(`/admin/blog/category/${encodeURIComponent(formData.category)}`);
//       } else {
//         toast.error("Error adding blog post");
//       }
//     } catch (err) {
//       console.error("Blog creation failed:", err);
//       toast.error("Error creating blog post");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">Add Blog Post</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border rounded" />
//         {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}

//         <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="Slug" className="w-full p-2 border rounded" />

//         {CKEditor && (
//           <CKEditor
//             editor={ClassicEditor}
//             data={formData.content}
//             onChange={(e, editor) => setFormData((prev) => ({ ...prev, content: editor.getData() }))}
//           />
//         )}
//         {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}

//         <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Category" className="w-full p-2 border rounded" />
//         {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}

//         {categories.length > 0 && (
//           <div className="flex gap-2 flex-wrap">
//             {categories.map((cat) => (
//               <button
//                 key={cat._id}
//                 type="button"
//                 onClick={() => setFormData((prev) => ({ ...prev, category: cat.category }))}
//                 className={`px-3 py-1 rounded text-sm ${formData.category === cat.category ? "bg-blue-500 text-white" : "bg-gray-200"}`}
//               >
//                 {cat.category}
//               </button>
//             ))}
//           </div>
//         )}

//         <input type="file" name="image" onChange={handleChange} accept="image/*" className="w-full p-2 border rounded" />
//         {previewUrl && <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover" />}
//         {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}

//         <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} placeholder="Meta Title" className="w-full p-2 border rounded" />
//         {errors.metaTitle && <p className="text-red-500 text-sm">{errors.metaTitle}</p>}

//         <input type="text" name="metaKeywords" value={formData.metaKeywords} onChange={handleChange} placeholder="Meta Keywords" className="w-full p-2 border rounded" />
//         {errors.metaKeywords && <p className="text-red-500 text-sm">{errors.metaKeywords}</p>}

//         <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows="3" placeholder="Meta Description" className="w-full p-2 border rounded" />
//         {errors.metaDescription && <p className="text-red-500 text-sm">{errors.metaDescription}</p>}

//         <textarea name="schemaData" value={formData.schemaData} onChange={handleChange} rows="6" placeholder="Schema JSON" className="w-full p-2 border rounded font-mono" />
//         {errors.schemaData && <p className="text-red-500 text-sm">{errors.schemaData}</p>}

//         <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded">
//           <option value="draft">Draft</option>
//           <option value="publish">Publish</option>
//         </select>

//         <div className="flex justify-end gap-2">
//           <button type="button" onClick={() => router.push("/admin/blog")} className="border px-4 py-2 rounded">Cancel</button>
//           <button type="submit" disabled={submitting} className="bg-blue-500 text-white px-4 py-2 rounded">
//             {submitting ? "Adding..." : "Add Blog Post"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default BlogPosts;

import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page