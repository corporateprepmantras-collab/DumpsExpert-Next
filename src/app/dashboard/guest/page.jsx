"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  User,
  Lock,
  LogOut,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
const GuestDashboard = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    bio: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  const [stats, setStats] = useState({
    examsViewed: 0,
    practiceTests: 0,
    studyHours: 0,
  });

  // Sidebar navigation items
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: Home },
    { id: "profile", name: "Edit Profile", icon: User },
    { id: "password", name: "Change Password", icon: Lock },
    { id: "logout", name: "Logout", icon: LogOut },
  ];

  // Feature cards for guest users
  const features = [
    {
      title: "Browse Exams",
      description: "Explore our collection of IT certification exams",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      action: "Browse Now",
      href: "/itcertifications",
    },
    {
      title: "Practice Tests",
      description: "Try sample questions to test your knowledge",
      icon: Award,
      color: "bg-purple-50 text-purple-600",
      action: "Start Practice",
      href: "/itcertifications",
    },
    {
      title: "Study Materials",
      description: "Access free study guides and resources",
      icon: BookOpen,
      color: "bg-green-50 text-green-600",
      action: "View Resources",
      href: "/itcertifications",
    },
  ];

  /* ================= FETCH PROFILE DATA ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await fetch("/api/user/me");
        const data = await res.json();

        if (res.ok) {
          setProfileData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            gender: data.gender || "",
            bio: data.bio || "",
            address: data.address || "",
          });

          if (data.stats) {
            setStats(data.stats);
          }
        } else {
          console.error("Failed to load profile");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================= HANDLE PROFILE INPUT CHANGE ================= */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= UPDATE PROFILE ================= */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          gender: profileData.gender,
          bio: profileData.bio,
          address: profileData.address,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE PASSWORD CHANGE ================= */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  /* ================= VALIDATE PASSWORD FORM ================= */
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ================= UPDATE PASSWORD ================= */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate form
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE LOGOUT ================= */
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (res.ok) {
        window.location.href = "/auth/signin";
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profileData.name || "Guest"}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Ready to take your IT certification journey to the next level?
        </p>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-orange-600" size={24} />
              <h3 className="text-xl font-bold text-gray-800">
                Unlock Full Access
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Subscribe now to access unlimited practice tests, study materials,
              and expert support!
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle size={18} className="text-green-600" />
                <span>100% Verified & Up-to-Date Materials</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle size={18} className="text-green-600" />
                <span>24/7 Expert Support</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <CheckCircle size={18} className="text-green-600" />
                <span>Free Updates for 3 Months</span>
              </li>
            </ul>
            <Link href="/itcertifications">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                Buy Your First Exam Now
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {stats.examsViewed}
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Exams Viewed</h3>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Award className="text-purple-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {stats.practiceTests}
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Practice Tests</h3>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="text-green-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              {stats.studyHours}h
            </span>
          </div>
          <h3 className="text-gray-600 font-medium">Study Hours</h3>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          What You Can Do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link key={index} href="/itcertifications" className="block">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <div
                  className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                >
                  <feature.icon size={24} />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {feature.title}
                </h3>

                <p className="text-gray-600 mb-4">{feature.description}</p>

                <span className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  {feature.action} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {profileData.name ? profileData.name.charAt(0).toUpperCase() : "G"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {profileData.name || "Guest User"}
            </h3>
            <p className="text-gray-600">{profileData.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address (readonly)
            </label>
            <input
              type="email"
              value={profileData.email}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              placeholder="+91 XXXXX XXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={profileData.gender}
              onChange={handleProfileChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={profileData.address}
              onChange={handleProfileChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleProfileSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPassword = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                passwordErrors.currentPassword
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Enter your current password"
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordErrors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password *
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                passwordErrors.newPassword
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Enter your new password (min 6 characters)"
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordErrors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                passwordErrors.confirmPassword
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Re-enter your new password"
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle
              className="text-blue-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Minimum 6 characters</li>
                <li>
                  Include a mix of letters and numbers for better security
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={handlePasswordSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (fetching) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      );
    }

    switch (currentView) {
      case "profile":
        return renderProfile();
      case "password":
        return renderPassword();
      case "logout":
        handleLogout();
        return null;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex min-h-screen pt-10 bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200 fixed h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">PrepMantras</h2>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User info at bottom */}
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {profileData.name
                ? profileData.name.charAt(0).toUpperCase()
                : "G"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">
                {profileData.name || "Guest User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profileData.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">{renderContent()}</main>
    </div>
  );
};

export default GuestDashboard;
