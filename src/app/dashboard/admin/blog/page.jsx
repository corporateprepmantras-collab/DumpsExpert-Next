'use client';

import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BlogList from './blogComps/BlogList';
import BlogModal from './blogComps/BlogModal';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog-categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const handleSaveBlog = async (formData, id) => {
    try {
      const url = id ? `/api/blogs/${id}` : '/api/blogs';
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh the blog list
        window.location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New Blog
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        
        <select
          value={currentCategory}
          onChange={(e) => setCurrentCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </select>
      </div>

      <BlogList 
        searchTerm={searchTerm} 
        currentCategory={currentCategory}
        onEdit={handleEdit}
      />

      <BlogModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        blog={editingBlog}
        onSave={handleSaveBlog}
      />
    </div>
  );
};

export default BlogPage;