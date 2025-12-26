"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaQuoteLeft } from "react-icons/fa";

import {
  FaCheckCircle,
  FaChevronRight,
  FaStar,
  FaUser,
  FaExclamationTriangle,
  FaClipboardList,
  FaShoppingCart,
  FaClock,
  FaTrophy,
  FaFileAlt,
  FaCalendarAlt,
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

  const productAvailable = isProductAvailable(product);

  const handleAddToCart = (type = "regular") => {
    if (!product) return;

    if ((type === "regular" || type === "combo") && !productAvailable) {
      toast.error("⚠️ This product is currently unavailable (PDF not found)");
      return;
    }

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

    let item = {
      _id: product._id,
      productId: product._id,
      courseId: product._id,
      type: type,
      title: product.title,
      name: product.title,
      mainPdfUrl: product.mainPdfUrl || "",
      samplePdfUrl: product.samplePdfUrl || "",
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

    if (!reviewForm.name || !reviewForm.comment || !reviewForm.rating) {
      toast.error("Please fill all fields and provide a rating");
      return;
    }

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

      const updatedReviews = await fetchReviews(product._id);
      setReviews(updatedReviews);

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

          {/* NEW: Exam Information Card */}
          {(product.examCode ||
            product.examName ||
            product.totalQuestions ||
            product.passingScore ||
            product.duration ||
            product.examLastUpdated) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-base mb-3 text-blue-900 flex items-center gap-2">
                <FaFileAlt className="text-blue-600" />
                Exam Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.examCode && (
                  <div className="flex items-start gap-2">
                    <FaClipboardList className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Exam Code</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {product.examCode}
                      </p>
                    </div>
                  </div>
                )}

                {product.examName && (
                  <div className="flex items-start gap-2">
                    <FaFileAlt className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Exam Name</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {product.examName}
                      </p>
                    </div>
                  </div>
                )}

                {product.totalQuestions && (
                  <div className="flex items-start gap-2">
                    <FaClipboardList className="text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Total Questions</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {product.totalQuestions}
                      </p>
                    </div>
                  </div>
                )}

                {product.passingScore && (
                  <div className="flex items-start gap-2">
                    <FaTrophy className="text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Passing Score</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {product.passingScore}
                      </p>
                    </div>
                  </div>
                )}

                {product.duration && (
                  <div className="flex items-start gap-2">
                    <FaClock className="text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {product.duration}
                      </p>
                    </div>
                  </div>
                )}

                {product.examLastUpdated && (
                  <div className="flex items-start gap-2">
                    <FaCalendarAlt className="text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Last Updated</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(product.examLastUpdated).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* {!isLoadingExams && hasOnlineExam && exams.length > 0 && (
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
          )} */}

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
                  <p className="text-blue-600 font-bold text-sm md:text-base">
                    ${product.dumpsPriceUsd ?? "N/A"}
                    <span className="text-red-500 ml-2 line-through text-xs md:text-sm">
                      ${product.dumpsMrpUsd ?? "N/A"}
                    </span>
                    <span className="text-gray-600 text-xs md:text-sm ml-1">
                      (
                      {calculateDiscount(
                        product.dumpsMrpUsd,
                        product.dumpsPriceUsd
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
          {/* Description */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="text-lg font-bold mb-3 text-gray-900">
              Description
            </h2>

            <div className="relative w-full overflow-visible">
              <div
                className="
        prose prose-sm max-w-none
        prose-p:text-gray-700
        prose-li:text-gray-700
        prose-strong:text-gray-900
        prose-a:text-blue-600
        prose-headings:text-gray-900

        break-words
        whitespace-normal

        [&_img]:max-w-full
        [&_img]:h-auto

        [&_table]:w-full
        [&_table]:overflow-x-auto
        [&_pre]:overflow-x-auto
        [&_code]:break-words
      "
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
                dangerouslySetInnerHTML={{
                  __html: product.Description || "No description available",
                }}
              />
            </div>
          </div>

          {/* Long Description */}
          <div className="bg-white rounded-2xl shadow-lg p-4 overflow-hidden">
            <h2 className="text-lg font-bold mb-3 text-gray-900">
              Detailed Overview
            </h2>
            <div
              className="
                prose prose-sm max-w-full
                prose-p:text-gray-700 prose-p:break-words
                prose-li:text-gray-700 prose-li:break-words
                prose-strong:text-gray-900
                prose-a:text-blue-600 prose-a:break-all
                prose-headings:break-words
                break-words
                overflow-hidden
                [&_*]:max-w-full
                [&_*]:break-words
                [&_img]:max-w-full
                [&_img]:h-auto
                [&_table]:block
                [&_table]:max-w-full
                [&_table]:overflow-x-auto
                [&_pre]:overflow-x-auto
                [&_pre]:max-w-full
                [&_code]:break-all
              "
              style={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                maxWidth: "100%",
              }}
              dangerouslySetInnerHTML={{
                __html:
                  product.longDescription || "No detailed overview available",
              }}
            />
          </div>
        </div>
      </div>

      {/* Full Width Sections Below */}

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

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Related Products
            </h2>
            <FaChevronRight className="text-gray-400 text-xl hidden md:block" />
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className="md:hidden">
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
              {relatedProducts.slice(0, 10).map((product) => (
                <div
                  key={product._id}
                  className="min-w-[160px] max-w-[160px] bg-white rounded-xl shadow-md hover:shadow-xl transition-all snap-start flex-shrink-0 cursor-pointer"
                  onClick={() => router.push(`/product/${product.slug}`)}
                >
                  <div className="p-3">
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-2 mb-3">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-24 w-full object-contain"
                      />
                    </div>

                    <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[32px]">
                      {product.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-blue-600">
                          ₹{product.dumpsPriceInr}
                        </p>
                        {product.dumpsMrpInr > product.dumpsPriceInr && (
                          <p className="text-xs text-gray-500 line-through">
                            ₹{product.dumpsMrpInr}
                          </p>
                        )}
                      </div>
                      <FaChevronRight className="text-blue-600 text-xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(Math.min(3, relatedProducts.length))].map((_, i) => (
                <div key={i} className="h-1 w-8 bg-blue-200 rounded-full" />
              ))}
            </div>
          </div>

          {/* Tablet & Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {relatedProducts.slice(0, 10).map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/product/${product.slug}`)}
              >
                <div className="p-4">
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-3 mb-3 group-hover:scale-105 transition-transform">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="h-32 w-full object-contain"
                    />
                  </div>

                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-3">
                    <p className="text-base font-bold text-blue-600">
                      ₹{product.dumpsPriceInr}
                    </p>
                    {product.dumpsMrpInr > product.dumpsPriceInr && (
                      <p className="text-xs text-gray-500 line-through">
                        ₹{product.dumpsMrpInr}
                      </p>
                    )}
                  </div>

                  {product.dumpsMrpInr > product.dumpsPriceInr && (
                    <div className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full mb-2">
                      {Math.round(
                        ((product.dumpsMrpInr - product.dumpsPriceInr) /
                          product.dumpsMrpInr) *
                          100
                      )}
                      % OFF
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/product/${product.slug}`);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                  >
                    <FaShoppingCart className="text-xs" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show more link */}
          {relatedProducts.length > 10 && (
            <div className="text-center mt-6">
              <button
                onClick={() => router.push("/products")}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base"
              >
                View All Products
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          )}
        </div>
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
  const publishedReviews = reviews.filter((r) => r.status === "Publish");

  // Calculate rating statistics
  const ratingStats = publishedReviews.reduce(
    (acc, r) => {
      acc[r.rating] = (acc[r.rating] || 0) + 1;
      acc.total += r.rating;
      acc.count += 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0, count: 0 }
  );

  const avgRating =
    ratingStats.count > 0
      ? (ratingStats.total / ratingStats.count).toFixed(1)
      : 0;

  return (
    <div className="space-y-8 pt-20">
      {/* Header with Overall Rating */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 md:p-8 shadow-lg border border-blue-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3 justify-center md:justify-start mb-2">
              <FaQuoteLeft className="text-blue-600" />
              Customer Reviews
            </h2>
            <p className="text-gray-600 text-sm">
              Real feedback from verified customers
            </p>
          </div>

          {publishedReviews.length > 0 && (
            <div className="flex items-center gap-6 bg-white rounded-xl px-6 py-4 shadow-md">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-4xl md:text-5xl font-bold text-gray-900">
                    {avgRating}
                  </span>
                  <FaStar className="text-yellow-400 text-2xl" />
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-lg ${
                        star <= Math.round(avgRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Based on {publishedReviews.length} review
                  {publishedReviews.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-1 min-w-[180px]">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingStats[rating];
                  const percentage =
                    ratingStats.count > 0
                      ? Math.round((count / ratingStats.count) * 100)
                      : 0;

                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700 w-8">
                        {rating}{" "}
                        <FaStar className="inline text-yellow-400 text-xs" />
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-10 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Reviews List */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              What Our Customers Say
            </h3>
            {publishedReviews.length > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {publishedReviews.length}{" "}
                {publishedReviews.length === 1 ? "Review" : "Reviews"}
              </span>
            )}
          </div>

          <div className="max-h-[600px] lg:max-h-[700px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600 text-sm">Loading reviews...</p>
                </div>
              </div>
            ) : publishedReviews.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                <FaQuoteLeft className="text-gray-300 text-5xl mx-auto mb-4" />
                <p className="text-gray-600 text-base font-medium mb-2">
                  No reviews yet
                </p>
                <p className="text-gray-500 text-sm">
                  Be the first to share your experience!
                </p>
              </div>
            ) : (
              publishedReviews.map((r, i) => (
                <div
                  key={r._id || i}
                  className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-md">
                        {(r.customer || r.name || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">
                          {r.customer || r.name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <FaStar
                                key={idx}
                                className={`text-base ${
                                  idx < r.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {r.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {new Date(r.createdAt || r.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="relative">
                    <FaQuoteLeft className="absolute -left-1 -top-1 text-blue-200 text-xl opacity-50" />
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed pl-6 break-words">
                      {r.comment}
                    </p>
                  </div>

                  {/* Verified Badge (if applicable) */}
                  {r.verified && (
                    <div className="mt-3 flex items-center gap-1 text-green-600">
                      <FaCheckCircle className="text-sm" />
                      <span className="text-xs font-medium">
                        Verified Purchase
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Review Form */}
        <div className="order-1 lg:order-2">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 md:p-8 shadow-lg border border-blue-100 sticky top-24">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
              Write Your Review
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Share your experience to help others make informed decisions
            </p>

            <form onSubmit={handleAddReview} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={reviewForm.name}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="w-full border-2 border-gray-200 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm md:text-base bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Rating *
                </label>
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setReviewForm({ ...reviewForm, rating: value })
                        }
                        className={`transition-all transform hover:scale-125 ${
                          value <= reviewForm.rating ? "scale-110" : ""
                        }`}
                      >
                        <FaStar
                          className={`text-3xl md:text-4xl ${
                            value <= reviewForm.rating
                              ? "text-yellow-400 drop-shadow-lg"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm font-medium text-gray-700">
                    {reviewForm.rating === 0 && "Click to rate"}
                    {reviewForm.rating === 1 && "⭐ Poor"}
                    {reviewForm.rating === 2 && "⭐⭐ Fair"}
                    {reviewForm.rating === 3 && "⭐⭐⭐ Good"}
                    {reviewForm.rating === 4 && "⭐⭐⭐⭐ Very Good"}
                    {reviewForm.rating === 5 && "⭐⭐⭐⭐⭐ Excellent"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  placeholder="Tell us about your experience with this product. What did you like? What could be improved?"
                  rows="6"
                  className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm md:text-base bg-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 10 characters
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-sm md:text-base transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Submit Review ✨
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <FaCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  Your review will be published after admin approval to ensure
                  quality and authenticity
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
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
