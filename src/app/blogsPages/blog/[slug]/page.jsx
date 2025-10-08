import BlogDetail from "./BlogDetail";

// ✅ Dynamic SEO setup
export async function generateMetadata({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/slug/${params.slug}`,
      { next: { revalidate: 60 } }
    );

    const blog = await res.json();

    return {
      title: blog?.data?.metaTitle || blog?.data?.title || "PrepMantras Blog",
      description:
        blog?.data?.metaDescription || "Read detailed blog on PrepMantras",
      keywords: blog?.data?.metaKeywords || "",
      openGraph: {
        title: blog?.data?.metaTitle || blog?.data?.title,
        description: blog?.data?.metaDescription || "",
        images: [{ url: blog?.data?.imageUrl }],
        type: "article",
      },
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    return {
      title: "PrepMantras Blog",
      description: "Read detailed blogs on PrepMantras",
    };
  }
}

// ✅ Pass slug prop to BlogDetail
export default function BlogPage({ params }) {
  return <BlogDetail slug={params.slug} />;
}
