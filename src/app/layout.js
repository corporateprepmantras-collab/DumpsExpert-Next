// app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import Providers from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata() {
  try {
    const res = await fetch("http://localhost:3000/api/seo/home", {
      cache: "no-store", // always fresh from DB
    });

    if (!res.ok) {
      throw new Error("Failed to fetch SEO");
    }

    const seo = await res.json();

    return {
      title: seo.title || "Default Title",
      description: seo.description || "Default description",
      keywords: seo.keywords || [],
      openGraph: {
        title: seo.ogtitle || seo.title,
        description: seo.ogdescription || seo.description,
        url: seo.ogurl || "",
        images: [
          {
            url: seo.ogimage || "",
            width: 1200,
            height: 630,
            alt: seo.ogtitle || "OpenGraph Image",
          },
        ],
      },
      alternates: {
        canonical: seo.canonicalurl || "",
      },
    };
  } catch (error) {
    console.error("SEO Fetch Error:", error);
    return {
      title: "Fallback Title",
      description: "Fallback description",
    };
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Navbar />
          <div className="min-h-screen flex flex-col">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
