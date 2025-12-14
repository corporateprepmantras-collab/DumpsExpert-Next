"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import dumpslogo from "../../assets/logo/premantras_logo.png";
import NavbarSearch from "./NavbarSearch";
import { ShoppingCart, Menu, X, ChevronDown, User } from "lucide-react";
import useCartStore from "@/store/useCartStore";

const navlinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "SAP", path: "/ItDumps/sap" },
  { label: "IT Dumps", path: "/ItDumps", dropdownKey: "ItDumps" },
  { label: "Blogs", path: "/blogsPages/blog-categories", dropdownKey: "blogs" },
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

  // Fetch user data
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const fetchUserData = async () => {
        try {
          const res = await fetch("/api/user/me");
          if (!res.ok) throw new Error("Failed to fetch user profile.");
          const data = await res.json();
          setUserData(data);
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      };
      fetchUserData();
    }
  }, [status, session]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
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
      <nav className="bg-white fixed w-full shadow z-50 flex justify-between items-center py-2 lg:px-28 px-4">
        {/* Logo */}
        <Link href="/">
          <Image
            src={dumpslogo}
            alt="dumpsxpert logo"
            width={150}
            height={150}
          />
        </Link>

        {/* Desktop Nav Links */}
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
                  className="hover:text-gray-500 flex items-center gap-1"
                >
                  {item.label}
                  {hasDropdown && (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Link>
                {hasDropdown && activeDropdown === item.dropdownKey && (
                  <ul className="absolute top-full left-0 bg-white border rounded-lg shadow-lg w-48 z-50 mt-2">
                    {dropdownData[item.dropdownKey].map((sub, i) => (
                      <li key={i}>
                        <Link
                          href={`/${
                            item.dropdownKey === "ItDumps"
                              ? "ItDumps"
                              : "blogsPages"
                          }/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
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

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden lg:block">
            <NavbarSearch hideOnLarge={false} />
          </div>

          {/* Cart with Counter */}
          <Link href="/cart" className="relative">
            <ShoppingCart className="hover:text-gray-500 cursor-pointer" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <div
        className={`fixed top-0 left-0 h-full w-full bg-black/70 z-40 transition-opacity duration-200 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } lg:hidden`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Mobile Nav Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } lg:hidden flex flex-col pt-8`}
      >
        <div className="flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <X size={30} />
          </button>
        </div>
        <ul className="flex flex-col gap-2 px-6 py-2 font-semibold">
          {navlinks.map((item, index) => {
            const hasDropdown =
              item.dropdownKey && dropdownData[item.dropdownKey]?.length > 0;
            return (
              <li key={index} className="relative">
                <div className="flex items-center justify-between">
                  <Link
                    href={item.path}
                    className="flex-1 py-2 px-2 hover:text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {hasDropdown && (
                    <button
                      className="p-2"
                      onClick={() =>
                        setActiveDropdown(
                          activeDropdown === item.dropdownKey
                            ? null
                            : item.dropdownKey
                        )
                      }
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          activeDropdown === item.dropdownKey
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
                {hasDropdown && activeDropdown === item.dropdownKey && (
                  <ul className="bg-gray-50 border rounded-lg shadow-lg w-full mt-1">
                    {dropdownData[item.dropdownKey].map((sub, i) => (
                      <li key={i}>
                        <Link
                          href={`/${
                            item.dropdownKey === "ItDumps"
                              ? "ItDumps"
                              : "blogsPages"
                          }/${sub.toLowerCase().replace(/\s+/g, "-")}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
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
        <div className="flex flex-col gap-3 px-6 mt-4">
          <NavbarSearch hideOnLarge={true} />
          <Link
            href="/cart"
            className="flex items-center gap-2 py-2 hover:text-gray-500"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingCart />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          {status === "authenticated" ? (
            <Link
              href={getDashboardPath()}
              className="py-2 hover:text-gray-500"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="bg-[#113d48] text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-center transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Login / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}