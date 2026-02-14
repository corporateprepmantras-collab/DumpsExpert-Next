"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Icon Components
const ChevronDownIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const DashboardIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const ToolsIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const PackageIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const TagIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
);

const GiftIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
    />
  </svg>
);

const ShoppingCartIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const GraduationCapIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path d="M12 14l9-5-9-5-9 5 9 5z" />
    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
    />
  </svg>
);

const NewspaperIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
    />
  </svg>
);

const MailIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const FileTextIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const QuestionIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const MenuIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const iconMap = {
  Dashboard: DashboardIcon,
  "Web Customization": ToolsIcon,
  Products: PackageIcon,
  Coupons: GiftIcon,
  Orders: ShoppingCartIcon,
  Exam: GraduationCapIcon,
  Blog: NewspaperIcon,
  Contact: MailIcon,
  "Manage General FAQs": QuestionIcon,
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

          { label: "SEO Meta Info", to: "/dashboard/admin/adminPages/SEOMeta" },
          {
            label: "SEO Site Map",
            to: "/dashboard/admin/adminPages/SEOSiteMap",
          },
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
          { label: "Product List", to: "/dashboard/admin/product/list" },
          { label: "Product Reviews", to: "/dashboard/admin/product/reviews" },
        ],
      },
      {
        label: "Coupons",
        to: "#",
        children: [{ label: "Coupon List", to: "/dashboard/admin/coupons" }],
      },
      {
        label: "Orders",
        to: "#",
        children: [
          { label: "All Orders", to: "/dashboard/admin/orders/all" },
          { label: "Pending Orders", to: "/dashboard/admin/orders/pending" },
          {
            label: "Completed Orders",
            to: "/dashboard/admin/orders/completed",
          },
          { label: "Rejected Orders", to: "/dashboard/admin/orders/rejected" },
        ],
      },
      {
        label: "Exam",
        to: "#",
        children: [{ label: "Online Exam", to: "/dashboard/admin/exam" }],
      },
      {
        label: "Blog",
        to: "#",
        children: [
          {
            label: "All Categories",
            to: "/dashboard/admin/blog/allCategories",
          },
          {
            label: "Posts",
            to: "/dashboard/admin/blog",
          },
        ],
      },
      {
        label: "Landing Content",
        to: "#",
        children: [
          { label: "Manage General FAQs", to: "/dashboard/admin/generalFaq" },
          {
            label: "Landing Content Section 1",
            to: "/dashboard/admin/adminPages/ContentSection1",
          },
          {
            label: "Landing Content Section 2",
            to: "/dashboard/admin/adminPages/ContentSection2",
          },
          {
            label: "Guarantee Page",
            to: "/dashboard/admin/adminPages/Guarantee",
          },
          {
            label: "Terms and Condition",
            to: "/dashboard/admin/adminPages/terms",
          },
          {
            label: "Privacy Policy",
            to: "/dashboard/admin/adminPages/privacy-policy",
          },
          {
            label: "Refund Policy",
            to: "/dashboard/admin/adminPages/refund-policy",
          },
          {
            label: "Popular Dumps Section",
            to: "/dashboard/admin/adminPages/Trending",
          },
          {
            label: "Trending Categories (Images) 🔥",
            to: "/dashboard/admin/adminPages/TrendingSection",
          },
        ],
      },
      {
        label: "Contact",
        to: "#",
        children: [
          { label: "Contact Message", to: "/dashboard/admin/contact" },
          {
            label: "Contact content 1",
            to: "/dashboard/admin/contact/ContactDataFirst",
          },
          {
            label: "Contact content 2",
            to: "/dashboard/admin/contact/ContactDataSecond",
          },
        ],
      },
      {
        label: "Redirects URL",
        to: "#",
        children: [
          {
            label: "Redirect ",
            to: "/dashboard/admin/redirects",
          },
        ],
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (label) => {
    setOpenItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isPathActive = (path) =>
    pathname === path || pathname.startsWith(`${path}/`);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
      else setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderMenuItem = (item, idx) => {
    const hasChildren =
      Array.isArray(item.children) && item.children.length > 0;
    const isExpanded = openItems[item.label];
    const Icon = iconMap[item.label] || FileTextIcon;

    if (hasChildren) {
      return (
        <div key={idx} className="mb-1">
          <button
            onClick={() => toggleItem(item.label)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isExpanded
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </div>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-indigo-200 pl-4">
              {item.children?.map((subItem, subIdx) => (
                <a
                  key={subIdx}
                  href={subItem.to}
                  className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isPathActive(subItem.to)
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 font-medium"
                  }`}
                  onClick={() =>
                    window.innerWidth < 1024 && setSidebarOpen(false)
                  }
                >
                  {subItem.label}
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <a
        key={idx}
        href={item.to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 ${
          isPathActive(item.to)
            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 font-medium"
        }`}
        onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm">{item.label}</span>
      </a>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed  left-4 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <CloseIcon className="w-5 h-5" />
        ) : (
          <MenuIcon className="w-5 h-5" />
        )}
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-20 left-0 h-[calc(100vh-5rem)] w-72 bg-white shadow-2xl z-50 lg:hidden flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-500 mt-1">Manage your platform</p>
          </div>
          {sidebarItems.map((section, index) => (
            <div key={index} className="mb-6">
              <div className="space-y-1">
                {section.links.map(renderMenuItem)}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Desktop Sidebar - positioned below navbar */}
      <aside className="hidden lg:block fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-white/90 backdrop-blur-md shadow-lg border-r border-gray-100 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent z-30">
        <div className="px-4 pt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-500 mt-1">Manage your platform</p>
          </div>
          {sidebarItems.map((section, index) => (
            <div key={index} className="mb-6">
              <div className="space-y-1">
                {section.links.map(renderMenuItem)}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
