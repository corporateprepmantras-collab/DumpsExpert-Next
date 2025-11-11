// app/page.jsx
import HomePage from "@/components/HomePage";

// ✅ Server-side SEO fetch
async function fetchSEO() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_BASE_URL
        : window.location.origin) ||
      "";

    const res = await fetch(`${baseUrl}/api/seo/home`, {
      next: { revalidate: 120 }, // cache for 2 minutes
    });

    if (!res.ok) throw new Error(`SEO fetch failed: ${res.status}`);
    const data = await res.json();

    // Handle both {data: {...}} and {...} formats
    return data?.data || data || {};
  } catch (error) {
    console.error("❌ SEO fetch failed:", error);
    return {};
  }
}

// ✅ Dynamic Metadata Generation
export async function generateMetadata() {
  const seo = await fetchSEO();

  const {
    title,
    description,
    canonicalurl,
    keywords,
    ogtitle,
    ogdescription,
    ogimage,
    ogurl,
    twittertitle,
    twitterdescription,
    twitterimage,
    schema,
  } = seo;

  return {
    title: title || "Prepmantras – #1 IT Exam Prep Provider",
    description:
      description ||
      "Pass your IT certifications in first attempt with trusted exam Prep, practice tests & PDF guides by Prepmantras.",

    keywords:
      keywords || "IT certification, exam dumps, prepmantras, practice tests",

    alternates: {
      canonical: canonicalurl || "https://prepmantras.com/",
    },

    openGraph: {
      title: ogtitle || title || "Prepmantras – #1 IT Exam Prep Provider",
      description:
        ogdescription ||
        description ||
        "Pass your IT certifications in first attempt with trusted exam Prep, practice tests & PDF guides by Prepmantras.",
      url: ogurl || "https://prepmantras.com/",
      images: [
        {
          url: ogimage || "/default-og.jpg",
          width: 1200,
          height: 630,
          alt: title || "Prepmantras Exam Prep",
        },
      ],
      siteName: "Prepmantras",
      locale: "en_US",
      type: "website",
    },

    twitter: {
      card: "summary_large_image",
      title: twittertitle || title,
      description: twitterdescription || description,
      images: [twitterimage || ogimage || "/default-og.jpg"],
      creator: "@prepmantras",
    },

    // ✅ JSON-LD Schema (optional rich data)
    other: schema
      ? {
          "application/ld+json": JSON.stringify(JSON.parse(schema)),
        }
      : {},
  };
}

export default async function Page() {
  const seo = await fetchSEO();
  return <HomePage seo={seo} />;
}
