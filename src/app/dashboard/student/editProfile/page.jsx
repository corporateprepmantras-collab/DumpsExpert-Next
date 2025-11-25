"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

const EditProfile = () => {
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState(null); // Get from auth/session
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
    // Address fields
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    // Academic fields (optional)
    course: "",
    branch: "",
    semester: "",
    cgpa: "",
  });

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // TODO: Get actual student ID from your auth/session
        const currentStudentId = "REPLACE_WITH_ACTUAL_ID"; // Get from useSession() or context
        setStudentId(currentStudentId);

        const response = await axios.get(
          `/api/student/profile?id=${currentStudentId}`
        );
        const data = response.data;

        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          gender: data.gender || "",
          bio: data.bio || "",
          street: data.address?.street || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          pincode: data.address?.pincode || "",
          country: data.address?.country || "India",
          course: data.course || "",
          branch: data.branch || "",
          semester: data.semester || "",
          cgpa: data.cgpa || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format data for API
      const payload = {
        id: studentId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        bio: formData.bio,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        course: formData.course,
        branch: formData.branch,
        semester: formData.semester ? parseInt(formData.semester) : null,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
      };

      const response = await axios.put("/api/student/profile", payload);

      toast.success(response.data.message || "Profile updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg = err.response?.data?.error || "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg text-black mt-10">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Email (readonly)
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                pattern="[0-9]{10}"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Tell something about yourself..."
            />
            <span className="text-xs text-gray-500">
              {formData.bio.length}/500
            </span>
          </div>
        </div>

        {/* Address Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Street</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Maharashtra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  pattern="[0-9]{6}"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="400001"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="pb-4">
          <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="B.Tech"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Semester</label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                min="1"
                max="12"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CGPA</label>
              <input
                type="number"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.01"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="8.5"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
