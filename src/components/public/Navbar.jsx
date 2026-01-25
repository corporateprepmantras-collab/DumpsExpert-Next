"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import dumpslogo from "../../assets/logo/premantras_logo.png";
import NavbarSearch from "./NavbarSearch";
import {
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import useCartStore from "@/store/useCartStore";

const navlinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "IT Dumps", path: "/ItDumps", dropdownKey: "ItDumps" },
  { label: "Blogs", path: "/blogs", dropdownKey: "blogs" },
  { label: "Contact Us", path: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownData, setDropdownData] = useState({ ItDumps: [], blogs: [] });
  const [cartItemCount, setCartItemCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Subscribe to cart changes
  useEffect(() => {
    setCartItemCount(useCartStore.getState().cartItems.length);
    const unsubscribe = useCartStore.subscribe((state) =>
      setCartItemCount(state.cartItems.length)
    );
    return () => unsubscribe();
  }, []);

  // Fetch categories with sessionStorage caching
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cached = sessionStorage.getItem("navbar_categories_cache");
        if (cached) {
          console.log("📦 Categories from cache");
          setDropdownData(JSON.parse(cached));
          return;
        }

        const [blogRes, productRes] = await Promise.all([
          fetch("/api/blogs/blog-categories"),
          fetch("/api/product-categories"),
        ]);

        const blogData = blogRes.ok ? await blogRes.json() : [];
        const productData = productRes.ok ? await productRes.json() : [];

        const categories = {
          blogs: blogData.map((c) => c.category),
          ItDumps: productData.map((p) => p.name),
        };

        setDropdownData(categories);
        sessionStorage.setItem(
          "navbar_categories_cache",
          JSON.stringify(categories)
        );
        console.log("🌐 Categories fetched and cached");
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch user data with sessionStorage caching
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const fetchUserData = async () => {
        try {
          // Check cache first
          const cached = sessionStorage.getItem("user_profile_cache");

          if (cached) {
            const parsedCache = JSON.parse(cached);
            if (parsedCache.email === session.user.email) {
              console.log("👤 User profile from cache");
              setUserData(parsedCache);
              return;
            }
          }

          // Fetch from API if not cached or cache is for different user
          const res = await fetch("/api/user/me");
          if (!res.ok) throw new Error("Failed to fetch user profile.");

          const data = await res.json();
          setUserData(data);

          // Cache the user data
          sessionStorage.setItem("user_profile_cache", JSON.stringify(data));
          console.log("🌐 User profile fetched and cached");
        } catch (err) {
          console.error("Error fetching user data:", err);
          setUserData(null);
        }
      };

      fetchUserData();
    } else {
      // Clear cache and userData when logged out
      sessionStorage.removeItem("user_profile_cache");
      setUserData(null);
    }
  }, [status, session?.user?.email]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      // Clear all cached data
      sessionStorage.removeItem("user_profile_cache");
      sessionStorage.removeItem("navbar_categories_cache");
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Dashboard redirect logic
  const getDashboardPath = () => {
    if (!userData) return "/dashboard/guest";
    const { role, subscription } = userData;
    if (role === "admin") return "/dashboard/admin";
    if (role === "student" && subscription === "yes")
      return "/dashboard/student";
    return "/dashboard/guest";
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
    };
    if (userMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`fixed w-full z-50 top-0 left-0 right-0 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-white shadow-md"
        }`}
      >
        <div className="flex justify-between items-center py-2 px-4 lg:px-28">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src={dumpslogo}
              alt="dumpsxpert logo"
              width={150}
              height={150}
              className="hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex gap-10 font-semibold items-center relative">
            {navlinks.map((item, index) => {
              const hasDropdown =
                item.dropdownKey && dropdownData[item.dropdownKey]?.length > 0;
              return (
                <li
                  key={index}
                  className="relative group"
                  onMouseEnter={() =>
                    hasDropdown && setActiveDropdown(item.dropdownKey)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.path}
                    className="text-gray-700 hover:text-[#113d48] transition-colors duration-200 flex items-center gap-1"
                  >
                    {item.label}
                    {hasDropdown && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.dropdownKey
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasDropdown && activeDropdown === item.dropdownKey && (
                    <ul className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {dropdownData[item.dropdownKey].map((sub, i) => (
                        <li key={i}>
                          <Link
                            href={`/${
                              item.dropdownKey === "ItDumps"
                                ? "ItDumps"
                                : "blogsPages"
                            }/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-[#113d48] hover:to-indigo-600 hover:text-white transition-all duration-200 border-b last:border-b-0 border-gray-100"
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop Right Section */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden lg:block">
              <NavbarSearch hideOnLarge={false} />
            </div>

            {/* Cart with Counter */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-[#113d48] transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {/* Authenticated User */}
            {status === "authenticated" ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {userData?.profileImage ? (
                      <img
                        src={userData.profileImage}
                        alt={userData?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-[9999]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b">
                      <div className="font-semibold">
                        {userData?.name || session?.user?.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {userData?.email}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href={getDashboardPath()}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden lg:inline-block bg-[#113d48] text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Login / Register
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={30} /> : <Menu size={30} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-200 lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-[#113d48] to-indigo-600">
          <span className="text-white font-bold text-lg">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* User Section - Mobile */}
        {status === "authenticated" && userData && (
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#113d48] to-indigo-600 flex items-center justify-center border-2 border-white shadow-md flex-shrink-0">
                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={userData?.name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                    }}
                  />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {userData?.name || session?.user?.name || "User"}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {userData?.email || session?.user?.email}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Nav Links */}
        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-2 px-6 py-4 font-semibold">
            {navlinks.map((item, index) => {
              const hasDropdown =
                item.dropdownKey && dropdownData[item.dropdownKey]?.length > 0;
              const isActive = activeDropdown === item.dropdownKey;

              return (
                <li key={index} className="relative">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.path}
                      className="flex-1 py-2 px-2 text-gray-700 hover:text-[#113d48] transition-colors"
                      onClick={() => !hasDropdown && setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {hasDropdown && (
                      <button
                        className="p-2 hover:bg-gray-50 rounded transition-colors"
                        onClick={() =>
                          setActiveDropdown(isActive ? null : item.dropdownKey)
                        }
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isActive ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {hasDropdown && isActive && (
                    <ul className="bg-gray-50 border rounded-lg shadow-lg w-full mt-1 overflow-hidden">
                      {dropdownData[item.dropdownKey].map((sub, i) => (
                        <li key={i}>
                          <Link
                            href={`/${
                              item.dropdownKey === "ItDumps"
                                ? "ItDumps"
                                : "blogsPages"
                            }/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-white hover:text-[#113d48] transition-colors border-b last:border-b-0"
                            onClick={() => setIsOpen(false)}
                          >
                            {sub}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Mobile Bottom Items */}
          <div className="flex flex-col gap-3 px-6 pb-4 border-t pt-4">
            <NavbarSearch hideOnLarge={true} />

            <Link
              href="/cart"
              className="flex items-center gap-2 py-2 text-gray-700 hover:text-[#113d48] transition-colors font-semibold"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {status === "authenticated" ? (
              <>
                <Link
                  href={getDashboardPath()}
                  className="flex items-center justify-center gap-2 w-full bg-[#113d48] text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-md font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all shadow-md font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-[#113d48] text-white px-4 py-3 rounded-lg hover:bg-indigo-700 text-center transition-all shadow-md font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
