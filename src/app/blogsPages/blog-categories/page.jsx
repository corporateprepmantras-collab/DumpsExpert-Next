export const dynamic = "force-dynamic";

import BlogPage from "@/components/BlogPage";

// ✅ NO getBaseUrl needed
export async function generateMetadata() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/seo/blog`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("SEO fetch failed");

    const data = await res.json();

    return {
      title: data.title || "Blogs - DumpsXpert",
      description:
        data.description ||
        "Explore the latest blogs, updates, and guides from DumpsXpert.",
    };
  } catch {
    return {
      title: "Blogs - DumpsXpert",
      description:
        "Explore the latest tech and certification blogs from DumpsXpert.",
    };
  }
}

export default function Blogs() {
  return <BlogPage />;
}
