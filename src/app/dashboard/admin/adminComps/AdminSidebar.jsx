"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChevronDown,
  FaPlusCircle,
  FaCogs,
  FaList,
  FaTachometerAlt,
  FaUser,
  FaBook,
  FaIdBadge,
  FaTags,
  FaClipboardList,
  FaShoppingCart,
  FaCreditCard,
  FaBoxOpen,
  FaGift,
  FaPeopleArrows,
  FaPhotoVideo,
  FaBlog,
  FaEnvelope,
  FaDownload,
  FaTools,
} from "react-icons/fa";
import { FiToggleRight, FiToggleLeft } from "react-icons/fi";
import "./adminSidebar.css";

const iconMap = {
  Dashboard: <FaTachometerAlt size={20} />,
  "Web Customization": <FaTools size={20} />,
  "Basic Information": <FaIdBadge size={20} />,
  "Menu Builder": <FaList size={20} />,
  "Social Links": <FaPeopleArrows size={20} />,
  "SEO Meta Info": <FaTags size={20} />,
  "SEO Site Map": <FaTags size={20} />,
  Permalink: <FaList size={20} />,
  "Maintenance Mode": <FaTools size={20} />,
  Announcement: <FaBlog size={20} />,
  Scripts: <FaTools size={20} />,
  "Mail From Admin": <FaEnvelope size={20} />,
  "Mail To Admin": <FaEnvelope size={20} />,
  Currencies: <FaCreditCard size={20} />,
  "Payment Gateway": <FaCreditCard size={20} />,
  "Shipping Method": <FaBoxOpen size={20} />,
  Products: <FaBoxOpen size={20} />,
  "Product Categories": <FaTags size={20} />,
  "Product List": <FaBoxOpen size={20} />,
  "Product Reviews": <FaClipboardList size={20} />,
  Coupons: <FaGift size={20} />,
  "Coupon List": <FaGift size={20} />,
  Orders: <FaShoppingCart size={20} />,
  "All Orders": <FaShoppingCart size={20} />,
  "Pending Orders": <FaShoppingCart size={20} />,
  "Completed Orders": <FaShoppingCart size={20} />,
  "Rejected Orders": <FaShoppingCart size={20} />,
  "Order Reports": <FaClipboardList size={20} />,
  "Product Sale Report": <FaClipboardList size={20} />,
  Customers: <FaUser size={20} />,
  Exam: <FaBook size={20} />,
  "Online Exam": <FaIdBadge size={20} />,
  Media: <FaPhotoVideo size={20} />,
  "Media List": <FaPhotoVideo size={20} />,
  Blog: <FaBlog size={20} />,
  Category: <FaTags size={20} />,
  Archive: <FaBoxOpen size={20} />,
  Posts: <FaBlog size={20} />,
  Subscribers: <FaPeopleArrows size={20} />,
  "Subscribers List": <FaPeopleArrows size={20} />,
  "Mail to Subscribers": <FaEnvelope size={20} />,
  Downloads: <FaDownload size={20} />,
  "Downloaded Samples": <FaDownload size={20} />,
  Settings: <FaCogs size={20} />,
};

const sidebarItems = [
  {
    sectionTitle: "Admin Panel",
    links: [
      { label: "Dashboard", to: "/dashboard/admin" },
      {
        label: "Web Customization",
        to: "#",
        children: [
          {
            label: "Basic Information",
            to: "/dashboard/admin/adminPages/BasicInformation",
          },
          {
            label: "Menu Builder",
            to: "/dashboard/admin/adminPages/MenuBuilder",
          },
          {
            label: "Social Links",
            to: "/dashboard/admin/adminPages/SocialLinks",
          },

          { label: "SEO Meta Info", to: "/dashboard/admin/adminPages/SEOMeta" },
          { label: "SEO Site Map", to: "/dashboard/admin/adminPages/SEOSiteMap" },

          { label: "Permalink", to: "/dashboard/admin/adminPages/Permalink" },
          {
            label: "Maintenance Mode",
            to: "/dashboard/admin/adminPages/MaintenanceMode",
          },
          {
            label: "Announcement",
            to: "/dashboard/admin/adminPages/Announcement",
          },
        ],
      },
      {
        label: "Products",
        to: "#",
        children: [
          {
            label: "Product Categories",
            to: "/dashboard/admin/product/categories",
          },
          {
            label: "Product List",
            to: "/dashboard/admin/product/list",
          },
          {
            label: "Product Reviews",
            to: "/dashboard/admin/product/reviews",
          },
        ],
      },
      {
        label: "Coupons",
        to: "#",
        children: [
          {
            label: "Coupon List",
            to: "/dashboard/admin/coupons/list",
          },
      
        ],
      },
      {
        label: "Orders",
        to: "#",
        children: [
          { label: "All Orders",
             to: "/dashboard/admin/orders/all" },
          {
            label: "Pending Orders",
            to: "/dashboard/admin/orders/pending",
          },
          {
            label: "Completed Orders",
            to: "/dashboard/admin/orders/completed",
          },
          {
            label: "Rejected Orders",
            to: "/dashboard/admin/orders/rejected",
          },
        ],
      },
      {
        label: "Exam",
        to: "#",
        children: [
          { label: "Online Exam", to: "/dashboard/admin/exam" },
        ],
      },
      {
        label: "Blog",
        to: "#",
        children: [
          {
            label: "Category",
            to: "/dashboard/admin/blog/category",
          },
        ],
      },
      {
        label: "Manage General FAQs",
        to: "/dashboard/admin/generalFaq",
      },
      {
        label: "Content Section 1",
        to: "/dashboard/admin/adminPages/ContentSection1",
      },
      {
        label: "Content Section 2",
        to: "/dashboard/admin/adminPages/ContentSection2",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (label) => {
    setOpenItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isPathActive = (path) =>
    pathname === path || pathname.startsWith(`${path}/`);

  // Handle sidebar toggle for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Toggle button for mobile/tablet */}
      <div className="lg:hidden flex items-center p-2 fixed top-4 left-4 z-50">
        <button
          className="bg-blue-600 text-white p-2 rounded-lg shadow-lg focus:outline-none"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? "Close" : "Menu"}
        </button>
      </div>
      {/* Overlay for mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-200 ${sidebarOpen ? "block opacity-100" : "hidden opacity-0"} lg:hidden`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      {/* Sidebar Drawer (mobile/tablet) */}
      <aside
        className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:hidden flex flex-col pt-16`}
      >
        <div className="h-full overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Admin</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto text-gray-600 hover:text-blue-600"
            >
              Close
            </button>
          </div>
          {sidebarItems.map((section, index) => (
            <div key={index} className="mb-16">
              <div className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-2">
                {iconMap[section.sectionTitle] || null}
                {section.sectionTitle}
              </div>
              <div className="space-y-1">
                {section.links.map((item, idx) => {
                  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                  const isExpanded = openItems[item.label];
                  return hasChildren ? (
                    <div key={idx} className="border rounded-md">
                      <button
                        onClick={() => toggleItem(item.label)}
                        className={`flex items-center justify-between w-full px-2 py-1 rounded hover:bg-blue-50 transition ${isExpanded ? "bg-blue-100" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          {iconMap[item.label] || <FaPlusCircle size={16} />}
                          {item.label}
                        </div>
                        <FaChevronDown
                          className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.children?.map((subItem, subIdx) => (
                            <Link
                              key={subIdx}
                              href={subItem.to}
                              className={`block px-2 py-1 rounded hover:bg-blue-50 ${isPathActive(subItem.to) ? "bg-blue-600 text-white font-semibold" : ""}`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={idx}
                      href={item.to}
                      className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 ${isPathActive(item.to) ? "bg-blue-600 text-white font-semibold" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {iconMap[item.label] || <FaPlusCircle size={16} />}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Sidebar for desktop */}
      <aside
        className={`hidden lg:block h-screen transition-all overflow-scroll duration-300 shadow-md pb-40 overflow-y-auto mt-28 bg-white text-gray-800 w-64 p-4`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Admin</h2>
        </div>
        {sidebarItems.map((section, index) => (
          <div key={index} className="mb-16">
            <div className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-2">
              {iconMap[section.sectionTitle] || null}
              {section.sectionTitle}
            </div>
            <div className="space-y-1">
              {section.links.map((item, idx) => {
                const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                const isExpanded = openItems[item.label];
                return hasChildren ? (
                  <div key={idx} className="border rounded-md">
                    <button
                      onClick={() => toggleItem(item.label)}
                      className={`flex items-center justify-between w-full px-2 py-1 rounded hover:bg-blue-50 transition ${isExpanded ? "bg-blue-100" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {iconMap[item.label] || <FaPlusCircle size={16} />}
                        {item.label}
                      </div>
                      <FaChevronDown
                        className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item.children?.map((subItem, subIdx) => (
                          <Link
                            key={subIdx}
                            href={subItem.to}
                            className={`block px-2 py-1 rounded hover:bg-blue-50 ${isPathActive(subItem.to) ? "bg-blue-600 text-white font-semibold" : ""}`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={idx}
                    href={item.to}
                    className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50 ${isPathActive(item.to) ? "bg-blue-600 text-white font-semibold" : ""}`}
                  >
                    {iconMap[item.label] || <FaPlusCircle size={16} />}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </aside>
    </>
  );
}
