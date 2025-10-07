"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import dumpslogo from "../../assets/logo/premantras_logo.png";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

const navlinks = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "IT Dumps", path: "/ItDumps", dropdownKey: "ItDumps" },
  { label: "Blogs", path: "/blogsPages/blog-categories", dropdownKey: "blogs" },
  { label: "Contact Us", path: "/contact" },
];

function getCacheItem(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

function setCacheItem(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

async function fetchWithCache(key, url, normalize = (d) => d) {
  const cached = getCacheItem(key);
  if (cached) return normalize(cached);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  const normalized = normalize(data);
  setCacheItem(key, normalized);
  return normalized;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [dropdownData, setDropdownData] = useState({ ItDumps: [], blogs: [] });
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(true); // ✅ New state

  // ✅ Cart count logic
  useEffect(() => {
    const calculateTotalQuantity = (items) =>
      items.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartItemCount(calculateTotalQuantity(useCartStore.getState().cartItems));
    const unsubscribe = useCartStore.subscribe((state) =>
      setCartItemCount(calculateTotalQuantity(state.cartItems))
    );
    return () => unsubscribe();
  }, []);

  // ✅ Load dropdowns and userData
  useEffect(() => {
    async function loadData() {
      try {
        const [blogCategories, productCategories] = await Promise.all([
          fetchWithCache("blog_categories", "/api/blogs/blog-categories", (d) =>
            Array.isArray(d) ? d.map((c) => c.category) : []
          ),
          fetchWithCache("product_categories", "/api/product-categories", (d) =>
            Array.isArray(d) ? d.map((p) => p.name) : []
          ),
        ]);

        setDropdownData({ blogs: blogCategories, ItDumps: productCategories });

        if (status === "authenticated" && session?.user?.email) {
          const res = await fetch("/api/user/me", { cache: "no-store" });
          const data = await res.json();
          setUserData(data);
          useCartStore.getState().setLoginStatus(true);
        } else {
          useCartStore.getState().setLoginStatus(false);
        }
      } catch (err) {
        console.error("Error loading navbar data:", err);
      } finally {
        setLoading(false); // ✅ stop loading
      }
    }

    loadData();
  }, [status, session]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getDashboardPath = () => {
    if (!userData) return "/dashboard/guest";
    const { role, subscription } = userData;
    if (role === "admin") return "/dashboard/admin";
    if (role === "student" && subscription === "yes")
      return "/dashboard/student";
    return "/dashboard/guest";
  };

  /* ----------------------------------------
     🧱 Skeleton Loading UI
  ---------------------------------------- */
  if (loading) {
    return (
      <nav className="bg-white fixed w-full shadow z-50 flex justify-between items-center py-2 lg:px-28 px-4">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <ul className="hidden lg:flex gap-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded" />
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </nav>
    );
  }

  /* ----------------------------------------
     ✅ Actual Navbar
  ---------------------------------------- */
  return (
    <nav className="bg-white fixed w-full shadow z-50 flex justify-between items-center py-2 lg:px-28 px-4">
      <Link href="/">
        <Image src={dumpslogo} alt="dumpsxpert logo" width={150} height={150} />
      </Link>

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
                        href={`/${
                          item.dropdownKey === "ItDumps"
                            ? "ItDumps"
                            : "blogsPages"
                        }/${sub.toLowerCase().replace(/\s+/g, "-")}`}
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

      <div className="flex items-center gap-4">
        <Link href="/search">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="w-5 h-5" />
          </Button>
        </Link>

        <Link href="/cart" className="relative">
          <ShoppingCart className="hover:text-gray-500" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Link>

        {status === "authenticated" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto">
                <Avatar>
                  <AvatarImage
                    src={userData?.profileImage || "https://via.placeholder.com/40"}
                  />
                  <AvatarFallback>
                    {userData?.name?.[0] || "U"}
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
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleLogout}
              >
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
  );
}
