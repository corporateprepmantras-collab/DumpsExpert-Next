"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaCheckCircle, FaChevronRight, FaStar, FaUser } from "react-icons/fa";
import useCartStore from "@/store/useCartStore";
import { Toaster, toast } from "sonner";
import Breadcrumbs from "@/components/public/Breadcrumbs";

// Helper function to fetch product data
async function fetchProduct(slug) {
  try {
    const response = await fetch(`/api/products/get-by-slug/${slug}`);
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Helper function to fetch exams by product slug
async function fetchExamsByProductSlug(slug) {
  try {
    console.log("📊 Fetching exams for slug:", slug);

    const endpoints = [
      `/api/exams/byslug/${encodeURIComponent(slug)}`,
      `/api/exams?slug=${encodeURIComponent(slug)}`,
      `/api/exams/${encodeURIComponent(slug)}`,
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`🔄 Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint);

        if (!response.ok) {
          console.warn(
            `⚠️ Endpoint ${endpoint} returned status ${response.status}`
          );
          continue;
        }

        const data = await response.json();
        console.log(`✅ Response from ${endpoint}:`, data);

        let exams = [];

        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          exams = data.data;
        } else if (Array.isArray(data) && data.length > 0) {
          exams = data;
        } else if (
          data.exams &&
          Array.isArray(data.exams) &&
          data.exams.length > 0
        ) {
          exams = data.exams;
        }

        if (exams.length > 0) {
          console.log("✅ Exams found:", exams.length, "exams");
          console.log(
            "📋 Exam details:",
            exams.map((e) => ({
              name: e.name,
              code: e.code,
              priceINR: e.priceINR || e.priceInr,
              priceUSD: e.priceUSD || e.priceUsd,
              duration: e.duration,
            }))
          );
          return exams;
        }
      } catch (endpointError) {
        console.warn(`⚠️ Error trying endpoint ${endpoint}:`, endpointError);
        continue;
      }
    }

    console.warn("⚠️ No exams found from any endpoint");
    return [];
  } catch (error) {
    console.error("❌ Error fetching exams:", error);
    return [];
  }
}

// Helper function to fetch all products for related products
async function fetchAllProducts() {
  try {
    const response = await fetch(`/api/products`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [exams, setExams] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    comment: "",
    rating: 0,
  });
  const [avgRating, setAvgRating] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoadingExams, setIsLoadingExams] = useState(true);

  const handleAddToCart = (type = "regular") => {
    if (!product) return;

    console.log("═".repeat(80));
    console.log("🔍 ADDING TO CART - DEBUG INFO");
    console.log("═".repeat(80));
    console.log("Product:", product);
    console.log("Exams array:", exams);
    console.log("Type:", type);

    // Helper to safely convert to number
    const toNum = (val) => {
      if (val === null || val === undefined || val === "") return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    // Initialize exam prices
    let examPriceInr = 0;
    let examPriceUsd = 0;
    let examMrpInr = 0;
    let examMrpUsd = 0;

    // PRIORITY 1: Extract from exams array (most reliable source)
    if (Array.isArray(exams) && exams.length > 0) {
      const examData = exams[0];
      console.log("━".repeat(80));
      console.log("📊 EXAM DATA EXTRACTION:");
      console.log("Raw exam object:", examData);

      // Try all possible price field variations
      examPriceInr = toNum(
        examData.priceINR ||
          examData.priceInr ||
          examData.price_inr ||
          examData.price ||
          examData.examPrice ||
          examData.onlineExamPrice ||
          examData.onlineExamPriceInr
      );

      examPriceUsd = toNum(
        examData.priceUSD ||
          examData.priceUsd ||
          examData.price_usd ||
          examData.examPriceUsd ||
          examData.onlineExamPriceUsd
      );

      // If USD not found, convert from INR
      if (examPriceInr > 0 && examPriceUsd === 0) {
        examPriceUsd = parseFloat((examPriceInr / 83).toFixed(2));
      }

      examMrpInr = toNum(
        examData.mrpINR ||
          examData.mrpInr ||
          examData.mrp_inr ||
          examData.mrp ||
          examData.examMrp
      );

      examMrpUsd = toNum(
        examData.mrpUSD ||
          examData.mrpUsd ||
          examData.mrp_usd ||
          examData.examMrpUsd
      );

      // If USD MRP not found, convert from INR
      if (examMrpInr > 0 && examMrpUsd === 0) {
        examMrpUsd = parseFloat((examMrpInr / 83).toFixed(2));
      }

      console.log("✅ Extracted from exam data:", {
        examPriceInr,
        examPriceUsd,
        examMrpInr,
        examMrpUsd,
      });
    }

    // PRIORITY 2: Fallback to product fields if exam prices still 0
    if (examPriceInr === 0 && examPriceUsd === 0) {
      console.log("⚠️ FALLBACK: Using product exam fields...");

      examPriceInr = toNum(
        product.examPriceInr ||
          product.onlineExamPriceInr ||
          product.examPrice ||
          product.onlineExamPrice
      );

      examPriceUsd = toNum(
        product.examPriceUsd ||
          product.onlineExamPriceUsd ||
          product.examPriceUSD ||
          product.onlineExamPriceUSD
      );

      // Convert if needed
      if (examPriceInr > 0 && examPriceUsd === 0) {
        examPriceUsd = parseFloat((examPriceInr / 83).toFixed(2));
      }

      examMrpInr = toNum(
        product.examMrpInr || product.onlineExamMrpInr || product.examMrp
      );

      examMrpUsd = toNum(
        product.examMrpUsd || product.onlineExamMrpUsd || product.examMrpUSD
      );

      // Convert if needed
      if (examMrpInr > 0 && examMrpUsd === 0) {
        examMrpUsd = parseFloat((examMrpInr / 83).toFixed(2));
      }

      console.log("✅ Got from product fields:", {
        examPriceInr,
        examPriceUsd,
        examMrpInr,
        examMrpUsd,
      });
    }

    console.log("━".repeat(80));
    console.log("💰 FINAL EXAM PRICES:");
    console.log("  INR:", examPriceInr);
    console.log("  USD:", examPriceUsd);
    console.log("  MRP INR:", examMrpInr);
    console.log("  MRP USD:", examMrpUsd);
    console.log("═".repeat(80));

    // VALIDATION - Only check for online type
    if (type === "online" && examPriceInr === 0 && examPriceUsd === 0) {
      toast.error("⚠️ Online exam pricing not available for this product");
      console.error("❌ VALIDATION FAILED: No exam prices found!");
      return;
    }

    if (
      type === "combo" &&
      product.comboPriceInr === 0 &&
      product.comboPriceUsd === 0
    ) {
      toast.error("⚠️ Combo package is not available for this product");
      console.error("❌ VALIDATION FAILED: No combo prices found!");
      return;
    }

    // Get exam details from first exam if available
    const examDetails = exams.length > 0 ? exams[0] : {};

    // Build complete item object with ALL price fields
    let item = {
      _id: product._id,
      productId: product._id,
      type: type,
      title: product.title,
      name: product.title,

      // Dumps pricing (ensure numbers)
      dumpsPriceInr: toNum(product.dumpsPriceInr),
      dumpsPriceUsd: toNum(product.dumpsPriceUsd),
      dumpsMrpInr: toNum(product.dumpsMrpInr),
      dumpsMrpUsd: toNum(product.dumpsMrpUsd),

      // Combo pricing (ensure numbers)
      comboPriceInr: toNum(product.comboPriceInr),
      comboPriceUsd: toNum(product.comboPriceUsd),
      comboMrpInr: toNum(product.comboMrpInr),
      comboMrpUsd: toNum(product.comboMrpUsd),

      // CRITICAL: Exam prices (already validated as numbers)
      examPriceInr: examPriceInr,
      examPriceUsd: examPriceUsd,
      examMrpInr: examMrpInr,
      examMrpUsd: examMrpUsd,

      // Product details
      samplePdfUrl: product.samplePdfUrl || "",
      mainPdfUrl: product.mainPdfUrl || "",
      imageUrl: product.imageUrl || "",
      slug: product.slug,
      category: product.category,
      sapExamCode: product.sapExamCode,
      code: product.code || product.sapExamCode,
      sku: product.sku,
      duration: product.duration || examDetails.duration || "",
      eachQuestionMark:
        product.eachQuestionMark || examDetails.eachQuestionMark || "",
      numberOfQuestions:
        product.numberOfQuestions || examDetails.numberOfQuestions || 0,
      passingScore: product.passingScore || examDetails.passingScore || "",
      mainInstructions: product.mainInstructions || "",
      sampleInstructions: product.sampleInstructions || "",
      Description: product.Description || "",
      longDescription: product.longDescription || "",
      status: product.status,
      action: product.action,
      metaTitle: product.metaTitle,
      metaKeywords: product.metaKeywords,
      metaDescription: product.metaDescription,
      schema: product.schema,
      quantity: 1,
    };

    // Set active price based on type
    switch (type) {
      case "regular":
        item.title = `${product.title} [PDF]`;
        item.name = `${product.title} [PDF]`;
        item.price = item.dumpsPriceInr;
        item.priceINR = item.dumpsPriceInr;
        item.priceUSD = item.dumpsPriceUsd;
        break;

      case "online":
        item.title = `${product.title} [Online Exam]`;
        item.name = `${product.title} [Online Exam]`;
        item.price = item.examPriceInr;
        item.priceINR = item.examPriceInr;
        item.priceUSD = item.examPriceUsd;
        console.log("🎯 Setting online exam prices:", {
          priceINR: item.priceINR,
          priceUSD: item.priceUSD,
        });
        break;

      case "combo":
        item.title = `${product.title} [Combo]`;
        item.name = `${product.title} [Combo]`;
        item.price = item.comboPriceInr;
        item.priceINR = item.comboPriceInr;
        item.priceUSD = item.comboPriceUsd;
        break;

      default:
        item.price = item.dumpsPriceInr;
        item.priceINR = item.dumpsPriceInr;
        item.priceUSD = item.dumpsPriceUsd;
    }

    console.log("✅ Final item to add to cart:", item);
    console.log("💰 Final pricing verification:", {
      type: item.type,
      priceINR: item.priceINR,
      priceUSD: item.priceUSD,
      examPriceInr: item.examPriceInr,
      examPriceUsd: item.examPriceUsd,
    });

    // Final validation before adding
    if (type === "online" && (item.priceINR === 0 || item.examPriceInr === 0)) {
      console.error("❌ CRITICAL: Online exam price is 0 after all checks!");
      toast.error("Failed to add online exam - pricing error");
      return;
    }

    useCartStore.getState().addToCart(item);
    toast.success(`✅ Added ${item.title} to cart!`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingExams(true);

        // Fetch product
        const productData = await fetchProduct(slug);
        setProduct(productData);

        console.log("═".repeat(80));
        console.log("📦 PRODUCT DATA LOADED:");
        console.log("═".repeat(80));
        console.log("Full product object:", productData);
        console.log("\n🏷️ PRODUCT PRICING:");
        console.log("Dumps (Regular PDF):", {
          inr: productData?.dumpsPriceInr,
          usd: productData?.dumpsPriceUsd,
        });
        console.log("Exam (Online Exam):", {
          inr: productData?.examPriceInr,
          usd: productData?.examPriceUsd,
          onlineInr: productData?.onlineExamPriceInr,
          onlineUsd: productData?.onlineExamPriceUsd,
        });
        console.log("Combo (PDF + Exam):", {
          inr: productData?.comboPriceInr,
          usd: productData?.comboPriceUsd,
        });
        console.log("═".repeat(80));

        // Fetch exams by slug
        const examsData = await fetchExamsByProductSlug(slug);
        setExams(examsData);
        setIsLoadingExams(false);

        console.log("\n═".repeat(80));
        console.log("📚 EXAM DATA LOADED:");
        console.log("═".repeat(80));
        console.log("Number of exams:", examsData.length);
        if (examsData.length > 0) {
          console.log("\n📝 First Exam - ALL FIELDS:");
          console.log(JSON.stringify(examsData[0], null, 2));
          console.log("\n💰 First Exam - PRICE FIELDS:");
          console.log({
            priceINR: examsData[0].priceINR,
            priceInr: examsData[0].priceInr,
            price: examsData[0].price,
            priceUSD: examsData[0].priceUSD,
            priceUsd: examsData[0].priceUsd,
            mrpINR: examsData[0].mrpINR,
            mrpInr: examsData[0].mrpInr,
            mrp: examsData[0].mrp,
            mrpUSD: examsData[0].mrpUSD,
            mrpUsd: examsData[0].mrpUsd,
          });
        } else {
          console.log("⚠️ No exams found for this product");
        }
        console.log("═".repeat(80));

        // Set reviews
        setReviews(productData?.reviews || []);

        if (productData?.reviews?.length) {
          const total = productData.reviews.reduce(
            (sum, r) => sum + r.rating,
            0
          );
          setAvgRating((total / productData.reviews.length).toFixed(1));
        }

        // Fetch related products
        const allProducts = await fetchAllProducts();
        setRelatedProducts(allProducts.filter((p) => p.slug !== slug));

        // Set mock reviews if none exist
        if (!productData?.reviews?.length) {
          const mockReviews = [
            {
              name: "Amit",
              comment: "Very helpful dumps! Cleared my exam in one go.",
              rating: 5,
              createdAt: new Date().toISOString(),
            },
            {
              name: "Priya",
              comment: "Good content but could be more detailed.",
              rating: 4,
              createdAt: new Date().toISOString(),
            },
            {
              name: "John",
              comment: "Excellent support and real questions.",
              rating: 5,
              createdAt: new Date().toISOString(),
            },
          ];
          setReviews(mockReviews);

          if (mockReviews.length > 0) {
            const total = mockReviews.reduce((sum, r) => sum + r.rating, 0);
            setAvgRating((total / mockReviews.length).toFixed(1));
          }
        }
      } catch (err) {
        console.error("❌ Error loading data:", err);
        setIsLoadingExams(false);
      }
    }

    if (slug) loadData();
  }, [slug]);

  const calculateDiscount = (mrp, price) => {
    if (!mrp || !price || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    toast.success("Review submitted successfully 🎉");
    setReviewForm({ name: "", comment: "", rating: "" });
  };

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  if (!product) return <div className="text-center py-20">Loading...</div>;

  // Check if online exam should be shown
  const hasOnlineExam =
    exams.length > 0 || product.examPriceInr || product.examPriceUsd;

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-2 pb-3">
        <Breadcrumbs />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Column */}
          <div className="md:w-[40%]">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full rounded-xl object-contain shadow-md max-h-[400px]"
            />

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-4 mt-6 text-gray-900 text-sm font-medium">
              {[
                "Instant Download After Purchase",
                "100% Real & Updated Dumps",
                "100% Money Back Guarantee",
                "90 Days Free Updates",
                "24/7 Customer Support",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 min-w-[180px]">
                  <FaCheckCircle className="text-blue-600 text-lg flex-shrink-0" />
                  <span className="text-xs md:text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-[60%] space-y-3 overflow-x-hidden">
            <h1 className="text-2xl md:text-3xl font-bold break-words">
              {product.title}
            </h1>
            <p className="text-xs md:text-sm">
              Exam Code: <strong>{product.sapExamCode}</strong>
            </p>
            <p className="text-xs md:text-sm">
              Category: <strong>{product.category}</strong>
            </p>

            {/* Exam Details if available */}
            {!isLoadingExams && exams.length > 0 && (
              <div className="pt-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="font-semibold text-sm md:text-base mb-2">
                  📚 Online Exams Available: {exams.length}
                </p>
                {exams.map((exam) => (
                  <div key={exam._id} className="text-xs md:text-sm">
                    <p>
                      <strong>Name:</strong> {exam.name || "Online Exam"}
                    </p>
                    <p>
                      <strong>Duration:</strong> {exam.duration || 0} mins
                    </p>
                    <p>
                      <strong>Passing Score:</strong>{" "}
                      {exam.passingScore || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Ratings */}
            {avgRating && (
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((v) => (
                  <FaStar
                    key={v}
                    className={`text-lg md:text-xl ${
                      v <= Math.round(avgRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-xs md:text-sm text-gray-600">
                  ({avgRating}/5)
                </span>
              </div>
            )}

            {/* Pricing Sections */}
            <div className="mt-4 space-y-6">
              {/* Regular PDF */}
              {(product.dumpsPriceInr || product.dumpsPriceUsd) && (
                <div className="flex flex-col md:flex-row md:justify-between gap-4 p-3 border rounded-lg bg-white shadow-sm">
                  <div className="w-full">
                    <p className="font-semibold text-base md:text-lg">
                      Downloadable File
                    </p>
                    <p className="text-blue-600 font-bold text-sm md:text-base">
                      ₹{product.dumpsPriceInr ?? "N/A"}
                      <span className="text-red-500 ml-2 line-through text-xs md:text-sm">
                        ₹{product.dumpsMrpInr ?? "N/A"}
                      </span>
                      <span className="text-gray-600 text-xs md:text-sm ml-1">
                        (
                        {calculateDiscount(
                          product.dumpsMrpInr,
                          product.dumpsPriceInr
                        )}
                        % off)
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-row flex-wrap gap-3 items-center justify-end w-full md:w-auto">
                    {product.samplePdfUrl && (
                      <button
                        onClick={() =>
                          handleDownload(
                            product.samplePdfUrl,
                            `${product.title}-Sample.pdf`
                          )
                        }
                        className="bg-gray-800 text-white px-4 py-2 rounded text-sm"
                      >
                        Download Sample
                      </button>
                    )}
                    <button
                      onClick={() => handleAddToCart("regular")}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-4 py-2 rounded text-sm"
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              )}

              {/* Online Exam - Only show if prices exist */}
              {hasOnlineExam && !isLoadingExams && exams.length > 0 && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-white shadow-sm gap-4">
                  <div className="w-full">
                    <p className="font-semibold text-base mb-2">
                      📝 Online Exam
                    </p>
                    {exams[0] && (
                      <>
                        <p className="text-xs text-gray-600 mb-1">
                          {exams[0].name || "Online Exam"}
                        </p>
                        <p className="text-blue-600 font-bold text-sm md:text-base">
                          ₹
                          {exams[0].priceINR ||
                            exams[0].priceInr ||
                            exams[0].price ||
                            "N/A"}
                          {(exams[0].mrpINR ||
                            exams[0].mrpInr ||
                            exams[0].mrp) && (
                            <>
                              <span className="text-red-600 line-through ml-2 text-xs md:text-sm">
                                ₹
                                {exams[0].mrpINR ||
                                  exams[0].mrpInr ||
                                  exams[0].mrp}
                              </span>
                              <span className="text-gray-600 text-xs md:text-sm ml-1">
                                (
                                {calculateDiscount(
                                  exams[0].mrpINR ||
                                    exams[0].mrpInr ||
                                    exams[0].mrp,
                                  exams[0].priceINR ||
                                    exams[0].priceInr ||
                                    exams[0].price
                                )}
                                % off)
                              </span>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Duration: {exams[0].duration || 0} mins | Questions:{" "}
                          {exams[0].numberOfQuestions || 0}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-row flex-wrap gap-3 items-center justify-end w-full md:w-auto">
                    <button
                      onClick={() =>
                        router.push(`/exam/sample-instruction/${slug}`)
                      }
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm"
                    >
                      Try Online Exam
                    </button>

                    <button
                      onClick={() => handleAddToCart("online")}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-4 py-2 rounded text-sm"
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              )}

              {/* Combo - Only show if online exam exists */}
              {hasOnlineExam &&
                (product.comboPriceInr || product.comboPriceUsd) && (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-white shadow-sm gap-4">
                    <div className="w-full">
                      <p className="font-semibold text-sm md:text-base">
                        🎁 Get Combo (PDF + Online Exam)
                      </p>
                      <p className="text-blue-600 font-bold text-sm md:text-base">
                        ₹{product.comboPriceInr ?? "N/A"}
                        <span className="text-red-600 line-through ml-2 text-xs md:text-sm">
                          ₹{product.comboMrpInr ?? "N/A"}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-row flex-wrap gap-3 items-center justify-end w-full md:w-auto">
                      <button
                        onClick={() => handleAddToCart("combo")}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-4 py-2 rounded text-sm"
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="text-lg md:text-xl font-semibold mb-2">
                Description:
              </h2>
              <div
                className="prose max-w-none text-xs md:text-sm"
                dangerouslySetInnerHTML={{
                  __html: product.Description || "No description available",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Long Description */}
      <div className="container mx-auto px-4 my-10 overflow-x-hidden">
        <h2 className="text-lg font-semibold mb-2">Detailed Overview:</h2>
        <div
          className="prose max-w-none text-sm overflow-x-auto"
          dangerouslySetInnerHTML={{
            __html: product.longDescription || "No detailed overview available",
          }}
        />
      </div>

      {/* Reviews */}
      <div className="container mx-auto px-4 overflow-x-hidden">
        <ReviewsSection
          reviews={reviews}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          handleAddReview={handleAddReview}
        />
      </div>

      {/* FAQs */}
      <div className="container mx-auto px-4 overflow-x-hidden">
        {product.faqs && product.faqs.length > 0 && (
          <FAQSection
            faqs={product.faqs}
            activeIndex={activeIndex}
            toggleAccordion={toggleAccordion}
          />
        )}
      </div>

      {/* Related Products */}
      <div className="container mx-auto px-4 overflow-x-hidden">
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-10">
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {relatedProducts.map((p) => (
                <div
                  key={p._id}
                  className="min-w-[200px] bg-white border rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md"
                  onClick={() => router.push(`/product/${p.slug}`)}
                >
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-32 object-contain w-full mb-2"
                  />
                  <h3 className="text-sm font-semibold truncate">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    ₹ {p.dumpsPriceInr}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Toaster />
    </div>
  );
}

/* --- Subcomponents --- */
function ReviewsSection({
  reviews,
  reviewForm,
  setReviewForm,
  handleAddReview,
}) {
  return (
    <div className="mt-10 grid md:grid-cols-2 gap-10">
      <div>
        <h3 className="text-lg font-semibold mb-4">User Reviews</h3>
        <div className="max-h-72 overflow-y-auto p-2">
          {reviews.length === 0 ? (
            <p className="text-gray-600 text-sm">No reviews yet.</p>
          ) : (
            reviews.map((r, i) => (
              <div key={i} className="border rounded p-4 shadow-sm mb-3">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, idx) => (
                    <FaStar
                      key={idx}
                      className={`text-sm ${
                        idx < r.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="font-medium">{r.name}</p>
                <p className="text-gray-600 text-sm">{r.comment}</p>
                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
        <form className="grid gap-3" onSubmit={handleAddReview}>
          <input
            value={reviewForm.name}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, name: e.target.value })
            }
            placeholder="Your name"
            className="border p-3 rounded w-full"
          />
          <textarea
            value={reviewForm.comment}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, comment: e.target.value })
            }
            placeholder="Your comment"
            rows="4"
            className="border p-3 rounded w-full"
          />
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <FaStar
                key={value}
                onClick={() => setReviewForm({ ...reviewForm, rating: value })}
                className={`cursor-pointer text-2xl ${
                  value <= reviewForm.rating
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-gray-600">
              {reviewForm.rating ? `${reviewForm.rating} Star(s)` : "Rate us"}
            </span>
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}

function FAQSection({ faqs, activeIndex, toggleAccordion }) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <FaUser className="text-blue-600" /> Frequently Asked Questions (FAQs)
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = activeIndex === idx;
          return (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl shadow-sm bg-white"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full flex justify-between items-center px-6 py-4 text-left group hover:bg-gray-50"
              >
                <span className="font-medium text-gray-800">
                  {faq.question}
                </span>
                <FaChevronRight
                  className={`text-gray-600 transform transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 py-2 text-gray-600 text-sm">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
