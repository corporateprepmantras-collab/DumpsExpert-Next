import Contact from "@/components/Contact";

// ✅ Fetch SEO dynamically from your API
export async function generateMetadata() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/seo/contact`,
      {
        next: { revalidate: 60 }, // revalidate every 60 seconds
      }
    );

    if (!res.ok) throw new Error("Failed to fetch SEO data");

    const data = await res.json();

    return {
      title: data.title || "Contact Us - DumpsXpert",
      description:
        data.description ||
        "Get in touch with DumpsXpert for queries or support.",
      keywords: data.keywords || "contact, dumpsxpert, support, help",
      alternates: {
        canonical: data.canonicalurl || "https://dumpsxpert.com/contact",
      },

      openGraph: {
        title: data.ogtitle || data.title,
        description: data.ogdescription || data.description,
        url: data.ogurl || "https://dumpsxpert.com/contact",
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
      title: "Contact Us - DumpsXpert",
      description:
        "Reach out to DumpsXpert for queries, support, or partnerships.",
    };
  }
}

// ✅ Page Component
export default function ContactPage() {
  return <Contact />;
}
