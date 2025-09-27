import Image from "next/image";
import banner from "../../assets/aboutAssests/AboutBanner.png";
import ExamDumpsSlider from "@/landingpage/ExamDumpsSlider";
import AboutContentSection from "./AboutContentSection";

// ✅ Fetch SEO dynamically
export async function generateMetadata() {
  try {
    const res = await fetch("/api/seo/about", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch About SEO");

    const seo = await res.json();

    return {
      title: seo.title || "About Us | Prepmantras",
      description:
        seo.description ||
        "Learn more about Prepmantras and why we’re trusted for SAP and IT exam dumps.",
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
            alt: seo.ogtitle || "About Us",
          },
        ],
      },
      alternates: {
        canonical: seo.canonicalurl || "",
      },
    };
  } catch (error) {
    console.error("About SEO Fetch Error:", error);
    return {
      title: "About Us | Prepmantras",
      description:
        "Learn more about Prepmantras and why we’re trusted for SAP and IT exam dumps.",
    };
  }
}

// ✅ Page Component
export default function AboutUs() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 px-6 py-12 rounded-lg max-w-6xl w-full">
          {/* Left Content */}
          <div className="lg:w-1/2">
            <Image
              src={banner}
              alt="Professional"
              className="rounded-xl mx-auto"
              width={500}
              height={400}
              priority
            />
          </div>

          {/* Right Content */}
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">About Us</h2>
            <p className="text-gray-600">
              Welcome to Prepmantras.com – your ultimate destination for reliable,
              accurate, and verified IT certification exam resources.
            </p>
            <p className="text-gray-600">
              We specialize in providing top-quality SAP exam Prep and an
              extensive collection of IT exam Prep to help professionals achieve
              their career goals with confidence.
            </p>

            <h3 className="text-2xl font-semibold text-gray-800 mt-6">
              Why Choose Prepmantras?
            </h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>
                SAP Examdumps – Our Specialty! When it comes to SAP exam Prep,
                Prepmantras leads the way.
              </li>
              <li>
                We provide expertly crafted and regularly updated SAP
                certification exam files that cover a wide range of
                certifications.
              </li>
              <li>
                Each SAP exam dump is meticulously compiled by certified
                professionals based on trends, topics, and past exams.
              </li>
              <li>Our mission: help you pass your SAP exam on the first attempt.</li>
            </ul>
          </div>
        </div>
      </div>

      <ExamDumpsSlider />
      <AboutContentSection />
    </>
  );
}
