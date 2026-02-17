// Dynamic sitemap generation
export default async function sitemap() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.prepmantras.com";

  // Fetch products for dynamic URLs
  let products = [];
  try {
    const res = await fetch(`${baseUrl}/api/products?limit=1000`, {
      next: { revalidate: 86400 }, // Revalidate daily
    });
    if (res.ok) {
      const data = await res.json();
      products = data?.data || [];
    }
  } catch (error) {
    console.error("Sitemap: Failed to fetch products", error);
  }

  // Fetch blogs
  let blogs = [];
  try {
    const res = await fetch(`${baseUrl}/api/blogs?limit=1000`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      blogs = Array.isArray(data) ? data : data?.data || data?.blogs || [];
    }
  } catch (error) {
    console.error("Sitemap: Failed to fetch blogs", error);
  }

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/itcertifications`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic product URLs
  const productRoutes = products
    .filter((p) => p.slug && p.status === "active")
    .map((product) => ({
      url: `${baseUrl}/itcertifications/sap/${product.slug}`,
      lastModified: product.updatedAt
        ? new Date(product.updatedAt)
        : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  // Dynamic blog URLs
  const blogRoutes = blogs
    .filter((b) => b.slug)
    .map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt ? new Date(blog.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
