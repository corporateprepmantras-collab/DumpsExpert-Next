'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    sectionName: '',
    category: '',
    metaTitle: '',
    metaKeywords: '',
    metaDescription: '',
    schema: '{}',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        sectionName: category.sectionName || '',
        category: category.category || '',
        metaTitle: category.metaTitle || '',
        metaKeywords: category.metaKeywords || '',
        metaDescription: category.metaDescription || '',
        schema: category.schema || '{}',
        image: null
      });
    } else {
      setFormData({
        sectionName: '',
        category: '',
        metaTitle: '',
        metaKeywords: '',
        metaDescription: '',
        schema: '{}',
        image: null
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      await onSave(data, category?._id);
      onClose();
      toast.success(category ? 'Category updated successfully' : 'Category created successfully');
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {category ? 'Edit Category' : 'Add New Category'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Section Name *</label>
            <input
              type="text"
              name="sectionName"
              value={formData.sectionName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image {!category && '*'}</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="w-full p-2 border rounded"
              accept="image/*"
              required={!category}
            />
            {category?.imageUrl && (
              <div className="mt-2">
                <img src={category.imageUrl} alt="Current" className="w-20 h-20 object-cover" />
                <p className="text-sm text-gray-500">Current image</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meta Title *</label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meta Keywords *</label>
            <input
              type="text"
              name="metaKeywords"
              value={formData.metaKeywords}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meta Description *</label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Schema (JSON)</label>
            <textarea
              name="schema"
              value={formData.schema}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border rounded font-mono"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;