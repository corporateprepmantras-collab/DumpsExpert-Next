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

          {/* Mobile View: Show ellipsis + last item */}
          {shouldCollapse && (
            <>
              <BreadcrumbSeparator className="block sm:hidden">
                <ChevronRight className="w-3.5 h-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="block sm:hidden">
                <BreadcrumbEllipsis className="size-6" />
              </BreadcrumbItem>
              <BreadcrumbSeparator className="block sm:hidden">
                <ChevronRight className="w-3.5 h-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="block sm:hidden">
                <BreadcrumbLink asChild>
                  <Link
                    href={buildHref(segments.length - 1)}
                    className="text-gray-900 font-medium capitalize text-xs truncate max-w-[150px]"
                  >
                    {decodeURIComponent(
                      segments[segments.length - 1].replace(/-/g, " ")
                    )}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          {/* Desktop View: Show all items */}
          {segments.map((segment, index) => (
            <div
              key={index}
              className={`items-center ${
                shouldCollapse ? "hidden sm:flex" : "flex"
              }`}
            >
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={buildHref(index)}
                    className={`capitalize transition-colors text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px] md:max-w-none ${
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
          ))}

          {/* Mobile: Show first two items if only 2 items exist */}
          {!shouldCollapse &&
            segments.length > 0 &&
            segments.map((segment, index) => (
              <div key={index} className="flex items-center sm:hidden">
                <BreadcrumbSeparator>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={buildHref(index)}
                      className={`capitalize transition-colors text-xs truncate max-w-[150px] ${
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
            ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
