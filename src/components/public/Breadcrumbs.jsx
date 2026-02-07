// components/ui/Breadcrumbs.jsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Skip array - jo words sirf dikhane se skip karne hai
  const skipSegments = ["by-slug"];

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !skipSegments.includes(segment));

  const buildHref = (index) => {
    // Reconstruct path with original segments for correct routing
    const allSegments = pathname.split("/").filter(Boolean);
    return (
      "/" +
      allSegments.slice(0, allSegments.indexOf(segments[index]) + 1).join("/")
    );
  };

  // Mobile: Show only Home + Last item if more than 2 items
  const shouldCollapse = segments.length > 2;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <Breadcrumb className="py-2 px-1 sm:px-0">
        <BreadcrumbList className="flex-nowrap">
          {/* Home Link */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">
                  Home
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Segments - Conditional rendering based on screen size */}
          {segments.map((segment, index) => {
            // Mobile: Only show last item if collapsed (more than 2 items)
            const showOnMobile =
              !shouldCollapse || index === segments.length - 1;
            // Desktop: Always show all items
            const showOnDesktop = true;

            return (
              <div key={index} className="flex items-center">
                <BreadcrumbSeparator
                  className={`${
                    shouldCollapse && index < segments.length - 1
                      ? "hidden sm:block"
                      : ""
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                </BreadcrumbSeparator>

                {/* Show ellipsis on mobile before last item if collapsed */}
                {shouldCollapse && index === segments.length - 1 && (
                  <>
                    <BreadcrumbItem className="block sm:hidden">
                      <BreadcrumbEllipsis className="w-4 h-4" />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="block sm:hidden">
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </BreadcrumbSeparator>
                  </>
                )}

                <BreadcrumbItem
                  className={`${
                    shouldCollapse && index < segments.length - 1
                      ? "hidden sm:block"
                      : ""
                  }`}
                >
                  <BreadcrumbLink asChild>
                    <Link
                      href={buildHref(index)}
                      className={`capitalize transition-colors text-xs sm:text-sm max-w-[200px] sm:max-w-[300px] md:max-w-none overflow-hidden whitespace-nowrap text-ellipsis inline-block ${
                        index === segments.length - 1
                          ? "text-gray-900 font-medium"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {decodeURIComponent(segment.replace(/-/g, " "))}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
