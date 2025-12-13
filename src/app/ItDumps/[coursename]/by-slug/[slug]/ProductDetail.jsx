"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaCheckCircle,
  FaChevronRight,
  FaStar,
  FaUser,
  FaExclamationTriangle,
} from "react-icons/fa";
import useCartStore from "@/store/useCartStore";
import { Toaster, toast } from "sonner";
import Breadcrumbs from "@/components/public/Breadcrumbs";

// Helper function to safely convert to number
const toNum = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

// Helper function to check if product is available
const isProductAvailable = (product) => {
  return product?.mainPdfUrl && product.mainPdfUrl.trim() !== "";
};

// Helper function to extract exam prices
const extractExamPrices = (examData) => {
  if (!examData) return { priceInr: 0, priceUsd: 0, mrpInr: 0, mrpUsd: 0 };

  const priceInr = toNum(
    examData.priceINR ||
      examData.priceInr ||
      examData.price_inr ||
      examData.price ||
      examData.examPrice ||
      examData.onlineExamPrice ||
      examData.onlineExamPriceInr ||
      examData.examPriceInr ||
      examData.examPriceINR
  );

  const priceUsd = toNum(
    examData.priceUSD ||
      examData.priceUsd ||
      examData.price_usd ||
      examData.examPriceUsd ||
      examData.onlineExamPriceUsd ||
      examData.examPriceUSD ||
      examData.onlineExamPriceUSD
  );

  const mrpInr = toNum(
    examData.mrpINR ||
      examData.mrpInr ||
      examData.mrp_inr ||
      examData.mrp ||
      examData.examMrp ||
      examData.examMrpInr ||
      examData.examMrpINR
  );

  const mrpUsd = toNum(
    examData.mrpUSD ||
      examData.mrpUsd ||
      examData.mrp_usd ||
      examData.examMrpUsd ||
      examData.examMrpUSD
  );

  return {
    priceInr: priceInr || (priceUsd > 0 ? priceUsd * 83 : 0),
    priceUsd:
      priceUsd || (priceInr > 0 ? parseFloat((priceInr / 83).toFixed(2)) : 0),
    mrpInr: mrpInr || (mrpUsd > 0 ? mrpUsd * 83 : 0),
    mrpUsd: mrpUsd || (mrpInr > 0 ? parseFloat((mrpInr / 83).toFixed(2)) : 0),
  };
};

// Helper functions
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

async function fetchExamsByProductSlug(slug) {
  try {
    const endpoints = [`/api/exams/byslug/${encodeURIComponent(slug)}`];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) continue;

        const data = await response.json();
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

        if (exams.length > 0) return exams;
      } catch (err) {
        continue;
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching exams:", error);
    return [];
  }
}

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

async function fetchReviews(productId) {
  try {
    const response = await fetch(`/api/reviews?productId=${productId}`);
    const data = await response.json();
    const all = data.data || [];
    // Client-side: only show published reviews on product page
    return all.filter((r) => r.status === "Publish");
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

async function submitReview(reviewData) {
  try {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [exams, setExams] = useState([]);
  const [examPrices, setExamPrices] = useState({
    priceInr: 0,
    priceUsd: 0,
    mrpInr: 0,
    mrpUsd: 0,
  });
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

  // Check if product is available
  const productAvailable = isProductAvailable(product);
  useEffect(() => {
    if (product) {
      console.log("=== PRODUCT AVAILABILITY CHECK ===");
      console.log("Product Title:", product.title);
      console.log("mainPdfUrl value:", product.mainPdfUrl);
      console.log("mainPdfUrl type:", typeof product.mainPdfUrl);
      console.log("Is Available:", productAvailable);
      console.log("================================");
    }
  }, [product]);
  const handleAddToCart = (type = "regular") => {
    if (!product) return;

    // Check if mainPdfUrl exists for PDF and Combo types
    if ((type === "regular" || type === "combo") && !productAvailable) {
      toast.error("⚠️ This product is currently unavailable (PDF not found)");
      return;
    }

    // Validate pricing
    if (
      type === "online" &&
      examPrices.priceInr === 0 &&
      examPrices.priceUsd === 0
    ) {
      toast.error("⚠️ Online exam pricing not available for this product");
      return;
    }

    if (
      type === "combo" &&
      toNum(product.comboPriceInr) === 0 &&
      toNum(product.comboPriceUsd) === 0
    ) {
      toast.error("⚠️ Combo package is not available for this product");
      return;
    }

    const examDetails = exams.length > 0 ? exams[0] : {};

    // Build complete item with ALL required fields
    let item = {
      _id: product._id,
      productId: product._id,
      courseId: product._id,
      type: type,
      title: product.title,
      name: product.title,

      // PDF URLs - CRITICAL for orders
      mainPdfUrl: product.mainPdfUrl || "",
      samplePdfUrl: product.samplePdfUrl || "",

      // Pricing
      dumpsPriceInr: toNum(product.dumpsPriceInr),
      dumpsPriceUsd: toNum(product.dumpsPriceUsd),
      dumpsMrpInr: toNum(product.dumpsMrpInr),
      dumpsMrpUsd: toNum(product.dumpsMrpUsd),
      comboPriceInr: toNum(product.comboPriceInr),
      comboPriceUsd: toNum(product.comboPriceUsd),
      comboMrpInr: toNum(product.comboMrpInr),
      comboMrpUsd: toNum(product.comboMrpUsd),
      examPriceInr: examPrices.priceInr,
      examPriceUsd: examPrices.priceUsd,
      examMrpInr: examPrices.mrpInr,
      examMrpUsd: examPrices.mrpUsd,

      // Product details
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
      status: product.status || "active",
      action: product.action || "",
      metaTitle: product.metaTitle || "",
      metaKeywords: product.metaKeywords || "",
      metaDescription: product.metaDescription || "",
      schema: product.schema || "",
      quantity: 1,
    };

    // Set type-specific pricing and names
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

    useCartStore.getState().addToCart(item);
    toast.success(`✅ Added ${item.title} to cart!`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingExams(true);

        const productData = await fetchProduct(slug);
        setProduct(productData);

        const examsData = await fetchExamsByProductSlug(slug);
        setExams(examsData);

        if (examsData.length > 0) {
          const prices = extractExamPrices(examsData[0]);
          setExamPrices(prices);
        } else {
          const prices = {
            priceInr: toNum(
              productData?.examPriceInr || productData?.onlineExamPriceInr
            ),
            priceUsd: toNum(
              productData?.examPriceUsd || productData?.onlineExamPriceUsd
            ),
            mrpInr: toNum(
              productData?.examMrpInr || productData?.onlineExamMrpInr
            ),
            mrpUsd: toNum(
              productData?.examMrpUsd || productData?.onlineExamMrpUsd
            ),
          };
          setExamPrices(prices);
        }

        setIsLoadingExams(false);

        // Load reviews from backend for this product (no mocks)
        const fetchedReviews = productData?._id
          ? await fetchReviews(productData._id)
          : [];

        setReviews(fetchedReviews || []);

        if (fetchedReviews && fetchedReviews.length > 0) {
          const total = fetchedReviews.reduce((sum, r) => sum + r.rating, 0);
          setAvgRating((total / fetchedReviews.length).toFixed(1));
        } else {
          setAvgRating(null);
        }

        const allProducts = await fetchAllProducts();
        setRelatedProducts(allProducts.filter((p) => p.slug !== slug));
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
    if (!url) {
      toast.error("Download link not available");
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.click();
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    // Validation
    if (!reviewForm.name || !reviewForm.comment || !reviewForm.rating) {
      toast.error("Please fill all fields and provide a rating");
      return;
    }

    // Submit review
    const reviewData = {
      productId: product._id,
      name: reviewForm.name,
      comment: reviewForm.comment,
      rating: reviewForm.rating,
    };

    const result = await submitReview(reviewData);

    if (result.success) {
      toast.success("Review submitted successfully 🎉");
      setReviewForm({ name: "", comment: "", rating: 0 });

      // Refresh reviews
      const updatedReviews = await fetchReviews(product._id);
      setReviews(updatedReviews);

      // Recalculate average rating
      if (updatedReviews.length > 0) {
        const total = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        setAvgRating((total / updatedReviews.length).toFixed(1));
      }
    } else {
      toast.error(result.error || "Failed to submit review");
    }
  };

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  if (!product)
    return (
      <div className="text-center py-20">
        <div className="flex items-center justify-center h-screen">
          <div className="h-6 w-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      </div>
    );

  const hasOnlineExam = examPrices.priceInr > 0 || examPrices.priceUsd > 0;

  return (
    <div className="min-h-screen pt-20 bg-white text-gray-800">
      <div className="container mx-auto px-4 pt-2 pb-3">
        <Breadcrumbs />
      </div>

      {/* Product Unavailability Alert */}
      {!productAvailable && product && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 text-base">
                  Product Currently Unavailable
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  The PDF file for this product is not available at the moment.
                  Please contact support or check back later.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-10">
        {/* Left Column - Sticky */}
        <div className="md:w-[40%]">
          <div className="md:sticky md:top-24">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full rounded-xl object-contain shadow-md max-h-[400px]"
            />

            <div className="flex flex-wrap justify-center gap-6 bg-white border border-gray-200 shadow-sm rounded-xl px-6 py-4 mt-6 text-gray-900 text-sm font-medium">
              {[
                "Instant Download After Purchase",
                "100% Real & Updated Dumps",
                "100% Money Back Guarantee",
                "90 Days Free Updates",
                "24/7 Customer Support",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 min-w-[200px]">
                  <FaCheckCircle className="text-blue-600 text-xl" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:w-[60%] space-y-3">
          <h1 className="text-2xl md:text-3xl font-bold break-words">
            {product.title}
          </h1>
          <p className="text-xs md:text-sm">
            Exam Code: <strong>{product.sapExamCode}</strong>
          </p>
          <p className="text-xs md:text-sm">
            Category: <strong>{product.category}</strong>
          </p>

          {!isLoadingExams && hasOnlineExam && exams.length > 0 && (
            <div className="pt-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-semibold text-sm md:text-base mb-2">
                📚 Online Exam Available
              </p>
              <div className="text-xs md:text-sm">
                <p>
                  <strong> Exam Name:</strong> {exams[0].name || "Online Exam"}
                </p>
                <p>
                  <strong> Total No. of Questions:</strong>{" "}
                  {exams[0].numberOfQuestions || "Online Exam"}
                </p>
                <p>
                  <strong>Passing Score:</strong>{" "}
                  {exams[0].passingScore || "N/A"}
                </p>
                <p>
                  <strong>Duration:</strong> {exams[0].duration || 0} mins
                </p>
              </div>
            </div>
          )}

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
            {/* PDF Download */}
            {(product.dumpsPriceInr || product.dumpsPriceUsd) && (
              <div
                className={`flex flex-col md:flex-row md:justify-between gap-4 p-3 border rounded-lg shadow-sm ${
                  !productAvailable ? "bg-gray-100 opacity-70" : "bg-white"
                }`}
              >
                <div className="w-full">
                  <p className="font-semibold text-base md:text-lg">
                    📄 Downloadable PDF File
                    {!productAvailable && (
                      <span className="ml-2 text-xs text-red-600 font-normal">
                        (Currently Unavailable)
                      </span>
                    )}
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
                      className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                    >
                      Download Sample
                    </button>
                  )}
                  <button
                    onClick={() => handleAddToCart("regular")}
                    disabled={!productAvailable}
                    className={`font-semibold px-4 py-2 rounded text-sm transition-all ${
                      productAvailable
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title={
                      !productAvailable
                        ? "Product unavailable - PDF not found"
                        : "Add to cart"
                    }
                  >
                    {productAvailable ? "🛒 Add to Cart" : "🚫 Unavailable"}
                  </button>
                </div>
              </div>
            )}

            {/* Online Exam */}
            {hasOnlineExam && !isLoadingExams && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-white shadow-sm gap-4">
                <div className="w-full">
                  <p className="font-semibold text-base mb-2">📝 Online Exam</p>
                  {exams[0] && (
                    <p className="text-xs text-gray-600 mb-1">
                      {exams[0].name || "Online Exam"}
                    </p>
                  )}
                  <p className="text-blue-600 font-bold text-sm md:text-base">
                    ₹{examPrices.priceInr || "N/A"}
                    {examPrices.mrpInr > 0 && (
                      <>
                        <span className="text-red-600 line-through ml-2 text-xs md:text-sm">
                          ₹{examPrices.mrpInr}
                        </span>
                        <span className="text-gray-600 text-xs md:text-sm ml-1">
                          (
                          {calculateDiscount(
                            examPrices.mrpInr,
                            examPrices.priceInr
                          )}
                          % off)
                        </span>
                      </>
                    )}
                  </p>
                  {exams[0] && (
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {exams[0].duration || 0} mins | Questions:{" "}
                      {exams[0].numberOfQuestions || 0}
                    </p>
                  )}
                </div>

                <div className="flex flex-row flex-wrap gap-3 items-center justify-end w-full md:w-auto">
                  <button
                    onClick={() =>
                      router.push(`/exam/sample-instruction/${slug}`)
                    }
                    className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Try Online Exam
                  </button>

                  <button
                    onClick={() => handleAddToCart("online")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-4 py-2 rounded text-sm hover:shadow-lg"
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            )}

            {/* Combo */}
            {hasOnlineExam &&
              (product.comboPriceInr || product.comboPriceUsd) && (
                <div
                  className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg shadow-sm gap-4 ${
                    !productAvailable ? "bg-gray-100 opacity-70" : "bg-white"
                  }`}
                >
                  <div className="w-full">
                    <p className="font-semibold text-sm md:text-base">
                      🎁 Get Combo (PDF + Online Exam)
                      {!productAvailable && (
                        <span className="ml-2 text-xs text-red-600 font-normal">
                          (Currently Unavailable)
                        </span>
                      )}
                    </p>
                    <p className="text-blue-600 font-bold text-sm md:text-base">
                      ₹{product.comboPriceInr ?? "N/A"}
                      <span className="text-red-600 line-through ml-2 text-xs md:text-sm">
                        ₹{product.comboMrpInr ?? "N/A"}
                      </span>
                      <span className="text-gray-600 text-xs md:text-sm ml-1">
                        (
                        {calculateDiscount(
                          product.comboMrpInr,
                          product.comboPriceInr
                        )}
                        % off)
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-row flex-wrap gap-3 items-center justify-end w-full md:w-auto">
                    <button
                      onClick={() => handleAddToCart("combo")}
                      disabled={!productAvailable}
                      className={`font-semibold px-4 py-2 rounded text-sm transition-all ${
                        productAvailable
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg cursor-pointer"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      title={
                        !productAvailable
                          ? "Product unavailable - PDF not found"
                          : "Add to cart"
                      }
                    >
                      {productAvailable ? "🛒 Add to Cart" : "🚫 Unavailable"}
                    </button>
                  </div>
                </div>
              )}
          </div>

          <div className="mt-6 overflow-x-hidden">
            <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">
              Description:
            </h2>

            <div
              className="
      prose prose-sm max-w-full
      prose-p:text-gray-800
      prose-li:text-gray-800
      prose-strong:text-gray-900
      prose-a:text-blue-600
      prose-a:break-all
      break-words
      overflow-x-hidden
      [&_*]:max-w-full
      [&_img]:max-w-full
      [&_img]:h-auto
      [&_table]:block
      [&_table]:max-w-full
      [&_table]:overflow-x-auto
      [&_pre]:overflow-x-auto
    "
              dangerouslySetInnerHTML={{
                __html: product.Description || "No description available",
              }}
            />
          </div>
        </div>
      </div>

      {/* Full Width Sections Below - Normal Scroll */}
      <div className="container mx-auto px-4 my-10">
        <h2 className="text-lg font-semibold mb-2">Detailed Overview:</h2>
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{
            __html: product.longDescription || "No detailed overview available",
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <ReviewsSection
          reviews={reviews}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          handleAddReview={handleAddReview}
        />
      </div>

      <div className="container mx-auto px-4">
        {product.faqs && product.faqs.length > 0 && (
          <FAQSection
            faqs={product.faqs}
            activeIndex={activeIndex}
            toggleAccordion={toggleAccordion}
          />
        )}
      </div>

      <div className="container mx-auto px-4">
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="flex gap-4 overflow-x-auto">
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

/* Subcomponents */
function ReviewsSection({
  reviews = [],
  reviewForm,
  setReviewForm,
  handleAddReview,
  isLoading = false,
}) {
  // Filter only published reviews for display
  const publishedReviews = reviews.filter((r) => r.status === "Publish");

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <div>
        <h3 className="text-lg font-semibold mb-4">User Reviews</h3>
        <div className="max-h-72 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-600 text-sm ml-3">Loading reviews...</p>
            </div>
          ) : publishedReviews.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {publishedReviews.map((r, i) => (
                <div
                  key={r._id || i}
                  className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, idx) => (
                      <FaStar
                        key={idx}
                        className={`text-sm ${
                          idx < r.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      ({r.rating}/5)
                    </span>
                  </div>

                  {/* Customer Name */}
                  <p className="font-semibold text-gray-800 mb-1">
                    {r.customer || r.name || "Anonymous"}
                  </p>

                  {/* Comment */}
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">
                    {r.comment}
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-400">
                    {new Date(r.createdAt || r.date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show total count */}
        {!isLoading && publishedReviews.length > 0 && (
          <p className="text-sm text-gray-500 mt-3 text-center">
            Showing {publishedReviews.length} review
            {publishedReviews.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Review Form */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
        <div className="grid gap-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              value={reviewForm.name}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, name: e.target.value })
              }
              placeholder="Enter your name"
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <FaStar
                  key={value}
                  onClick={() =>
                    setReviewForm({ ...reviewForm, rating: value })
                  }
                  className={`cursor-pointer text-2xl transition-colors ${
                    value <= reviewForm.rating
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-200"
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {reviewForm.rating
                  ? `${reviewForm.rating} Star(s)`
                  : "Click to rate"}
              </span>
            </div>
          </div>

          {/* Comment Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Review *
            </label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              placeholder="Share your experience with this product..."
              rows="5"
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAddReview}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
          >
            Submit Review
          </button>

          {/* Info Message */}
          <p className="text-xs text-gray-500 text-center">
            Your review will be published after admin approval
          </p>
        </div>
      </div>
    </div>
  );
}

function FAQSection({ faqs, activeIndex, toggleAccordion }) {
  return (
    <div>
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
