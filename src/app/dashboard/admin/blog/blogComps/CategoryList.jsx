'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CategoryList = ({ searchTerm, onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        searchTerm ? { search: searchTerm } : {}
      );

      const response = await fetch(`/api/blog-categories?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCategories(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/blog-categories/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return <div className="p-4">Loading categories...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border">Image</th>
            <th className="px-4 py-2 border">Section Name</th>
            <th className="px-4 py-2 border">Category</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td className="px-4 py-2 border">
                <img
                  src={category.imageUrl}
                  alt={category.sectionName}
                  className="w-12 h-12 object-cover"
                />
              </td>
              <td className="px-4 py-2 border">{category.sectionName}</td>
              <td className="px-4 py-2 border">{category.category}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => onEdit(category)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                >
                  Delete
                </button>
                <button
                  onClick={() => onCategorySelect(category)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  View Blogs
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;