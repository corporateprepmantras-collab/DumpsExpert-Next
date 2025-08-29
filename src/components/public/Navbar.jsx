"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import dumpslogo from "../../assets/landingassets/dumplogo.webp";
import NavbarSearch from "./NavbarSearch";
import { ShoppingCart, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useCartStore from "@/store/useCartStore";

const navlinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
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

  // Subscribe to cart changes
   // Subscribe to cart changes
  useEffect(() => {
    // Initial cart count
    setCartItemCount(useCartStore.getState().cartItems.length);
    
    // Subscribe to cart changes
    const unsubscribe = useCartStore.subscribe(
      (state) => setCartItemCount(state.cartItems.length)
    );
    
    return () => unsubscribe();
  }, []);

  // Fetch categories dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Blogs categories
        const blogRes = await fetch("/api/blogs/blog-categories");
        const blogData = blogRes.ok ? await blogRes.json() : [];

        // Product categories
        const productRes = await fetch("/api/product-categories");
        const productData = productRes.ok ? await productRes.json() : [];

        setDropdownData({
          blogs: blogData.map((c) => c.category), // your API returns { category: "xyz" }
          ItDumps: productData.map((p) => p.name), // your API returns { name: "AWS" }
        });
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Dashboard redirect
  const getDashboardPath = () => {
    if (!userData) return "/dashboard/guest";
    const { role, subscription } = userData;
    if (role === "admin") return "/dashboard/admin";
    if (role === "student" && subscription === "yes")
      return "/dashboard/student";
    return "/dashboard/guest";
  };

  return (
    <>
      <nav className="bg-white fixed w-full shadow z-50 flex justify-between items-center py-2 lg:px-28 px-4">
        {/* Logo */}
        <Link href="/">
          <Image src={dumpslogo} alt="dumpsxpert logo" width={150} height={150} />
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
                  {hasDropdown && <span className="text-sm">&#9662;</span>}
                </Link>
                {hasDropdown && activeDropdown === item.dropdownKey && (
                  <ul className="absolute top-full left-0 bg-white border rounded-lg shadow-lg w-48 z-50">
                    {dropdownData[item.dropdownKey].map((sub, i) => (
                      <li key={i}>
                        <Link
                          href={`/${item.dropdownKey === "ItDumps" ? "ItDumps" : "blogsPages"}/${sub
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
            <ShoppingCart className="hover:text-gray-500" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Authenticated User */}
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto">
                  <Avatar>
                    <AvatarImage
                      src={
                        userData?.profileImage || "https://via.placeholder.com/40"
                      }
                    />
                    <AvatarFallback>
                      {userData?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {userData?.name || session?.user?.email}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {userData?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardPath()}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/signin"
              className="hidden lg:inline-block bg-[#113d48] text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Login / Register
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={30} /> : <Menu size={30} />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav Overlay */}
      <div
        className={`fixed top-0 left-0 h-full w-full bg-black bg-opacity-40 z-40 transition-opacity duration-200 ${
          isOpen ? 'block opacity-100' : 'hidden opacity-0'
        } lg:hidden`}
        onClick={() => setIsOpen(false)}
      ></div>
      {/* Mobile Nav Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:hidden flex flex-col pt-8`}
      >
        <div className="flex justify-end px-4">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X size={30} />
          </Button>
        </div>
        <ul className="flex flex-col gap-2 px-6 py-2 font-semibold">
          {navlinks.map((item, index) => {
            const hasDropdown = item.dropdownKey && dropdownData[item.dropdownKey]?.length > 0;
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
                      className="p-1"
                      onClick={() => setActiveDropdown(activeDropdown === item.dropdownKey ? null : item.dropdownKey)}
                    >
                      <span className="text-sm">&#9662;</span>
                    </button>
                  )}
                </div>
                {hasDropdown && activeDropdown === item.dropdownKey && (
                  <ul className="bg-gray-50 border rounded-lg shadow-lg w-full mt-1">
                    {dropdownData[item.dropdownKey].map((sub, i) => (
                      <li key={i}>
                        <Link
                          href={`/${item.dropdownKey === "ItDumps" ? "ItDumps" : "blogsPages"}/${sub
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
          <Link href="/cart" className="flex items-center gap-2 py-2" onClick={() => setIsOpen(false)}>
            <ShoppingCart />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          {status === "authenticated" ? (
            <Link href={getDashboardPath()} className="py-2" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/signin" className="bg-[#113d48] text-white px-4 py-2 rounded-lg hover:bg-indigo-700" onClick={() => setIsOpen(false)}>
              Login / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
