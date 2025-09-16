// components/ui/Breadcrumbs.jsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Skip array - jo words skip karne hai unhe yahan likho
  const skipSegments = ["by-slug"];

  // Segments filter karte waqt skip ko hata do
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !skipSegments.includes(segment));

  const buildHref = (index) =>
    "/" + segments.slice(0, index + 1).join("/");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="text-black">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center text-black">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={buildHref(index)} className="capitalize">
                  {decodeURIComponent(segment.replace(/-/g, " "))}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
