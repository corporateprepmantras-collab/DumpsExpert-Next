import BlogDetail from "./BlogDetail";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Helper to get the correct base URL
function getBaseUrl() {
  // For server-side rendering
  if (typeof window === "undefined") {
    // Check if we're in production
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    // Default to localhost in development
    return "http://localhost:3000";
  }
  // For client-side
  return "";
}

// Helper function to fetch blog data
async function fetchBlogForMetadata(slug) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/blogs/slug/${slug}?status=publish`;

  console.log("🔍 Attempting to fetch blog from:", url);
  console.log("🔍 Base URL:", baseUrl);
  console.log("🔍 Slug:", slug);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    }).catch((fetchError) => {
      console.error("❌ Fetch request failed:", fetchError.message);
      throw fetchError;
    });

    console.log("✅ Fetch completed with status:", res.status);

    if (!res.ok) {
      console.error(`❌ Failed to fetch blog - Status: ${res.status}`);
      console.error(`❌ Status Text: ${res.statusText}`);
      console.error(`❌ URL: ${url}`);

      try {
        const errorText = await res.text();
        console.error(`❌ Response body:`, errorText.substring(0, 500));
      } catch (e) {
        console.error("❌ Could not read error response body");
      }
      return null;
    }

    const contentType = res.headers.get("content-type");
    console.log("✅ Content-Type:", contentType);

    if (!contentType?.includes("application/json")) {
      console.error("❌ Non-JSON response received");
      const text = await res.text();
      console.error("❌ Response:", text.substring(0, 500));
      return null;
    }

    const data = await res.json();
    console.log("✅ Blog data received");
    console.log("✅ Blog title:", data?.data?.title || "No title found");

    return data?.data || null;
  } catch (error) {
    console.error("❌ Error fetching blog for metadata");
    console.error("❌ Error type:", error.constructor.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Full error:", error);

    if (
      error.message.includes("fetch") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.error("❌ NETWORK ERROR: Cannot connect to API");
      console.error("❌ Make sure your API route exists at:", url);
      console.error("❌ Check that your Next.js server is running");
    }
    return null;
  }
}

// Helper function to strip HTML tags for clean metadata
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

// ✅ Dynamic SEO setup with proper error handling
export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const blog = await fetchBlogForMetadata(slug);

    if (!blog || !blog.title) {
      console.log("⚠️ Blog not found, returning default metadata");
      return {
        title: "Blog Not Found - PrepMantras",
        description: "The requested blog post could not be found.",
      };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = `${siteUrl}/blogs/${slug}`;
    const imageUrl = blog.imageUrl || `${siteUrl}/default-blog.webp`;

    // Clean description from HTML
    const cleanDescription = stripHtml(blog.content || blog.Description);
    const metaDescription =
      blog.metaDescription ||
      (cleanDescription
        ? cleanDescription.slice(0, 160)
        : "Read this detailed blog post on PrepMantras");

    // Structured data for blog article
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: metaDescription,
      image: imageUrl,
      datePublished: blog.createdAt || new Date().toISOString(),
      dateModified:
        blog.updatedAt || blog.createdAt || new Date().toISOString(),
      author: {
        "@type": "Person",
        name: blog.author || "PrepMantras Team",
      },
      publisher: {
        "@type": "Organization",
        name: "PrepMantras",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
    };

    return {
      title: blog.metaTitle || `${blog.title} - PrepMantras Blog`,
      description: metaDescription,
      keywords:
        blog.metaKeywords ||
        "blog, PrepMantras, education, certification, exam preparation",
      metadataBase: new URL(siteUrl),
      openGraph: {
        title: blog.metaTitle || blog.title,
        description: metaDescription,
        url,
        type: "article",
        siteName: "PrepMantras",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: blog.title || "Blog image",
            type: "image/webp",
          },
        ],
        locale: "en_US",
        publishedTime: blog.createdAt,
        modifiedTime: blog.updatedAt || blog.createdAt,
        authors: [blog.author || "PrepMantras Team"],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.metaTitle || blog.title,
        description: metaDescription,
        images: [imageUrl],
        creator: "@prepmantras",
      },
      alternates: {
        canonical: url,
      },
      robots: {
        index: blog.status === "active" || blog.published !== false,
        follow: blog.status === "active" || blog.published !== false,
        googleBot: {
          index: blog.status === "active" || blog.published !== false,
          follow: blog.status === "active" || blog.published !== false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      other: {
        "article:published_time": blog.createdAt,
        "article:modified_time": blog.updatedAt || blog.createdAt,
        "article:author": blog.author || "PrepMantras Team",
        "article:section": blog.category || "Blog",
      },
      // Inject structured data
      script: [
        {
          type: "application/ld+json",
          children: JSON.stringify(structuredData),
        },
      ],
    };
  } catch (error) {
    console.error("❌ Error generating metadata:", error.message);
    console.error("❌ Full error:", error);
    return {
      title: "PrepMantras Blog",
      description: "Read detailed blogs on PrepMantras",
    };
  }
}

// Generate static params for static generation
export async function generateStaticParams() {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/blogs`;

    console.log("🔍 Fetching blogs for static generation:", url);

    const res = await fetch(url, {
      next: { revalidate: 3600 },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("❌ Failed to fetch blogs for static generation");
      return [];
    }

    const data = await res.json();
    const blogs = data?.data || [];

    const params = blogs
      .filter(
        (blog) =>
          blog.slug && (blog.status === "active" || blog.published !== false)
      )
      .map((blog) => ({
        slug: blog.slug,
      }))
      .slice(0, 100); // Limit to first 100 blogs

    console.log(`✅ Generated ${params.length} static params`);
    return params;
  } catch (error) {
    console.error("❌ Error generating static params:", error.message);
    return [];
  }
}

// ✅ Page Component with proper error handling
export default async function BlogPage({ params }) {
  const { slug } = await params;

  // Verify blog exists before rendering
  const blog = await fetchBlogForMetadata(slug);

  if (!blog || !blog.title) {
    console.log("⚠️ Blog not found, showing 404");
    notFound();
  }

  return (
    <Suspense fallback={<BlogPageLoading />}>
      <BlogDetail slug={slug} />
    </Suspense>
  );
}

// Loading component
function BlogPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading blog post...</p>
      </div>
    </div>
  );
}

// Configure page behavior
export const dynamic = "force-dynamic"; // or "auto" for ISR
export const revalidate = 3600; // Revalidate every hour if using ISR
