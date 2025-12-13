"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@/hooks/useUser";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Toaster, toast } from "@/components/ui/sonner";

export default function Profile() {
  const { user, loading, error, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    profileImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      try {
        const imageUrl = await uploadToCloudinary(file);
        setFormData({ ...formData, profileImage: imageUrl });
      } catch (error) {
        toast.error("Failed to upload image");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading)
    return (
      <div>
        <div className="flex items-center justify-center h-screen">
          <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24">
              <Image
                src={imagePreview || user.profileImage || "/default-avatar.png"}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24">
              <Image
                src={user.profileImage || "/default-avatar.png"}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {user.name || "No name set"}
              </h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Role</p>
            <p className="capitalize">{user.role}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Phone</p>
            <p>{user.phone || "No phone number set"}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Address</p>
            <p>{user.address || "No address set"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
