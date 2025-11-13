import BlogPage from "@/components/BlogPage";

// Helper to get the correct base URL
function getBaseUrl() {
  if (typeof window === "undefined") {
    // Server-side
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      return process.env.NEXT_PUBLIC_BASE_URL;
    }
    return "http://localhost:3000";
  }
  // Client-side
  return "";
}

// ✅ Fetch SEO dynamically for blogs page
export async function generateMetadata() {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/seo/blog`;

    console.log("🔍 Fetching SEO from:", url);

    const res = await fetch(url, {
      next: { revalidate: 60 },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`❌ SEO fetch failed - Status: ${res.status}`);
      const errorText = await res.text();
      console.error(`❌ Response:`, errorText.substring(0, 500));
      throw new Error(`Failed to fetch SEO: ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("❌ Non-JSON response received");
      const text = await res.text();
      console.error("❌ Response:", text.substring(0, 500));
      throw new Error("Non-JSON response");
    }

    const data = await res.json();
    console.log("✅ SEO data loaded successfully");

    return {
      title: data.title || "Blogs - DumpsXpert",
      description:
        data.description ||
        "Explore the latest blogs, updates, and guides from DumpsXpert.",
      keywords: data.keywords || "blogs, dumpsxpert, exam dumps, guides",
      alternates: {
        canonical: data.canonicalurl || "https://dumpsxpert.com/blogs",
      },

      openGraph: {
        title: data.ogtitle || data.title,
        description: data.ogdescription || data.description,
        url: data.ogurl || "https://dumpsxpert.com/blogs",
        images: [{ url: data.ogimage || "/default-og.png" }],
      },

      twitter: {
        card: data.twittercard || "summary_large_image",
        title: data.twittertitle || data.title,
        description: data.twitterdescription || data.description,
        images: [data.twitterimage || "/default-og.png"],
      },

      other: {
        "application/ld+json": data.schema,
      },
    };
  } catch (error) {
    console.error("❌ SEO fetch error:", error.message);
    return {
      title: "Blogs - DumpsXpert",
      description:
        "Explore the latest tech and certification blogs from DumpsXpert.",
    };
  }
}

// ✅ Render the BlogPage component
export default function Blogs() {
  return <BlogPage />;
}
