import BlogPage from "@/components/BlogPage";

// ✅ Fetch SEO dynamically for blogs page
export async function generateMetadata() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/seo/blog`,
      {
        next: { revalidate: 60 }, // Cache + revalidate every 60s
      }
    );

    if (!res.ok) throw new Error("Failed to fetch SEO");

    const data = await res.json();

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
    console.error("SEO fetch failed:", error);
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
