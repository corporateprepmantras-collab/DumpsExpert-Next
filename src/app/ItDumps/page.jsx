import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import guarantee from "../../assets/userAssets/guaranteed.png";

// Fetch from backend API
async function getDumpsData() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://prepmantras.com"; // ✅ use absolute URL
    const res = await fetch(`/api/product-categories`, {
      next: { revalidate: 60 },
    });

    if (!res.ok)
      throw new Error(`Failed to fetch categories: ${res.statusText}`);

    const json = await res.json();
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.data)) return json.data;

    console.error("Unexpected API response format:", json);
    return [];
  } catch (error) {
    console.error("Error fetching dumps data:", error);
    return [];
  }
}

// Create SEO-friendly slug
function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-"); // spaces → dashes
}

export default async function ITDumpsPage() {
  const dumpsData = await getDumpsData();

  return (
    <div
      className="relative min-h-screen w-full pt-24 pb-10 px-4 md:px-8"
      style={{
        backgroundImage: `url(${guarantee.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-10">
          Unlock Your Potential with IT Certification Dumps
        </h1>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center max-w-2xl mx-auto mb-12 text-gray-900 text-sm sm:text-base font-medium">
          <div className="space-y-3">
            {[
              "Instant Download After Purchase",
              "100% Real & Updated Dumps",
              "100% Money Back Guarantee",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2">
                <FaCheckCircle className="text-blue-600 text-lg" />
                {text}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {["90 Days Free Updates", "24/7 Customer Support"].map(
              (text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-600 text-lg" />
                  {text}
                </div>
              )
            )}
          </div>
        </div>

        {/* Category Cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {dumpsData.length > 0 ? (
            dumpsData.map((item) => (
              <Link
                key={item._id}
                href={`/ItDumps/${createSlug(item.name)}`}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200 flex flex-col items-center text-center overflow-hidden w-[160px] sm:w-[180px] md:w-[200px]"
              >
                <div className="h-28 md:h-32 w-full relative">
                  <Image
                    src={item.image || "https://via.placeholder.com/150"}
                    alt={item.name}
                    fill
                    className="object-contain p-3"
                  />
                </div>
                <div className="px-3 pb-4">
                  <h3 className="text-sm sm:text-base font-medium capitalize text-gray-800 truncate">
                    {item.name}
                  </h3>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-600 text-center">
              No categories available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
