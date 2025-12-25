"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  /* ================= VALIDATION ================= */
  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword)
      newErrors.currentPassword = "Current password is required";

    if (!formData.newPassword)
      newErrors.newPassword = "New password is required";
    else if (formData.newPassword.length < 6)
      newErrors.newPassword =
        "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword =
        "Please confirm your new password";
    else if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      await axios.put("/api/user/change-password", formData);

      toast.success("Password changed successfully");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error;

      // Backend error mapping
      if (status === 401) {
        setErrors({ currentPassword: message });
      } else if (status === 400) {
        toast.error(message || "Invalid input");
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CURRENT PASSWORD */}
        <div>
          <label className="text-sm font-medium">
            Current Password
          </label>
          <div className="relative">
            <input
              type={show.current ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded pr-10"
            />
            <button
              type="button"
              onClick={() =>
                setShow((p) => ({ ...p, current: !p.current }))
              }
              className="absolute right-2 top-2 text-sm text-gray-500"
            >
              {show.current ? "Hide" : "Show"}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentPassword}
            </p>
          )}
        </div>

        {/* NEW PASSWORD */}
        <div>
          <label className="text-sm font-medium">New Password</label>
          <div className="relative">
            <input
              type={show.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded pr-10"
            />
            <button
              type="button"
              onClick={() =>
                setShow((p) => ({ ...p, new: !p.new }))
              }
              className="absolute right-2 top-2 text-sm text-gray-500"
            >
              {show.new ? "Hide" : "Show"}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.newPassword}
            </p>
          )}

          {/* Password Rules */}
          <p className="text-xs text-gray-500 mt-1">
            • Minimum 6 characters
          </p>
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <label className="text-sm font-medium">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={show.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded pr-10"
            />
            <button
              type="button"
              onClick={() =>
                setShow((p) => ({
                  ...p,
                  confirm: !p.confirm,
                }))
              }
              className="absolute right-2 top-2 text-sm text-gray-500"
            >
              {show.confirm ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
