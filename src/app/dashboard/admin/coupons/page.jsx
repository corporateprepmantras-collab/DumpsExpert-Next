// app/dashboard/coupons/page.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";

const CouponManagement = () => {
  // State management
  const [coupons, setCoupons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    discount: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch coupons from API
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/coupons");
      setCoupons(response.data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      alert("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Reset form and close modal
  const resetForm = () => {
    setFormData({
      name: "",
      discount: "",
      startDate: "",
      endDate: "",
    });
    setErrors({});
    setEditingCoupon(null);
    setIsModalOpen(false);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.discount || formData.discount < 0 || formData.discount > 100) 
      newErrors.discount = "Discount must be between 0 and 100";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) newErrors.endDate = "End date must be after start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      if (editingCoupon) {
        // Update existing coupon
        await axios.put(`/api/coupons/${editingCoupon._id}`, formData);
      } else {
        // Create new coupon
        await axios.post("/api/coupons", formData);
      }

      resetForm();
      fetchCoupons(); // Refresh the list
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert(error.response?.data?.error || "Failed to save coupon");
    }
  };

  // Open modal for editing
  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      name: coupon.name,
      discount: coupon.discount,
      startDate: coupon.startDate.slice(0, 10),
      endDate: coupon.endDate.slice(0, 10),
    });
    setIsModalOpen(true);
  };

  // Handle coupon deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    try {
      await axios.delete(`/api/coupons/${id}`);
      fetchCoupons(); // Refresh the list
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("Failed to delete coupon");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if coupon is active
  const isCouponActive = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    return now >= startDate && now <= endDate;
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Coupon Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
        >
          + Add Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-600 text-sm font-medium">
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Coupon Name</th>
              <th className="px-6 py-4 text-left">Coupon Code</th>
              <th className="px-6 py-4 text-left">Discount (%)</th>
              <th className="px-6 py-4 text-left">Start Date</th>
              <th className="px-6 py-4 text-left">End Date</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading coupons...</span>
                  </div>
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p className="text-lg">No coupons available</p>
                    <p className="mt-2">Click the "Add Coupon" button to create your first coupon</p>
                  </div>
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr
                  key={coupon._id}
                  className="hover:bg-gray-50 transition border-b"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        isCouponActive(coupon)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isCouponActive(coupon) ? "Active" : "Expired"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{coupon.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">{coupon.discount}%</td>
                  <td className="px-6 py-4">{formatDate(coupon.startDate)}</td>
                  <td className="px-6 py-4">{formatDate(coupon.endDate)}</td>
                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon._id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0  flex items-center justify-center p-4 z-50">
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter coupon name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%) *
                  </label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.discount ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter discount percentage"
                  />
                  {errors.discount && (
                    <p className="text-red-500 text-xs mt-1">{errors.discount}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.endDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                  )}
                </div>
                
                {editingCoupon && (
                  <div className="bg-gray-100 p-3 rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code
                    </label>
                    <p className="text-gray-600 font-mono">{editingCoupon.code}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coupon code is automatically generated and cannot be changed.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingCoupon ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;