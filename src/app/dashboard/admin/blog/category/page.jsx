'use client';

import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategoryList from '../blogComps/CategoryList';
import CategoryModal from '../blogComps/CategoryModal';
import { useRouter } from 'next/navigation';

const CategoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleSaveCategory = async (formData, id) => {
    try {
      const url = id ? `/api/blog-categories/${id}` : '/api/blog-categories';
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Refresh the category list
        window.location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleCategorySelect = (category) => {
    // Navigate to blog page with category filter
    const router = useRouter();
    router.push(`/dashboard/admin/blog/${category.id}`);
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New Category
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <CategoryList 
        searchTerm={searchTerm}
        onEdit={handleEdit}
        onCategorySelect={handleCategorySelect}
      />

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default CategoryPage;