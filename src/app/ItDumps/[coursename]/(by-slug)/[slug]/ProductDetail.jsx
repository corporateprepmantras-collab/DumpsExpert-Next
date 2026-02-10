"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaQuoteLeft } from "react-icons/fa";
import RelatedProducts from "./RelatedProducts";
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
  FaDownload,
  FaEye,
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
      examData.examPriceINR,
  );

  const priceUsd = toNum(
    examData.priceUSD ||
      examData.priceUsd ||
      examData.price_usd ||
      examData.examPriceUsd ||
      examData.onlineExamPriceUsd ||
      examData.examPriceUSD ||
      examData.onlineExamPriceUSD,
  );

  const mrpInr = toNum(
    examData.mrpINR ||
      examData.mrpInr ||
      examData.mrp_inr ||
      examData.mrp ||
      examData.examMrp ||
      examData.examMrpInr ||
      examData.examMrpINR,
  );

  const mrpUsd = toNum(
    examData.mrpUSD ||
      examData.mrpUsd ||
      examData.mrp_usd ||
      examData.examMrpUsd ||
      examData.examMrpUSD,
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
    const response = await fetch(`/api/products/get-by-slug/${slug}`, {
      next: { revalidate: 60 },
      cache: "force-cache",
    });
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
        const response = await fetch(endpoint, {
          next: { revalidate: 60 },
          cache: "force-cache",
        });
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
    const response = await fetch(`/api/products`, {
      next: { revalidate: 60 },
      cache: "force-cache",
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function fetchReviews(productId) {
  try {
    const response = await fetch(`/api/reviews?productId=${productId}`, {
      next: { revalidate: 60 },
      cache: "force-cache",
    });
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

  // Helper function for discount calculation
  const calculateDiscount = (mrp, price) => {
    if (!mrp || !price || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  // Real-time price calculations using useMemo for instant updates
  const pdfPrices = useMemo(() => {
    if (!product) return null;
    return {
      priceInr: toNum(product.dumpsPriceInr),
      priceUsd:
        toNum(product.dumpsPriceUsd) ||
        (toNum(product.dumpsPriceInr) > 0
          ? parseFloat((toNum(product.dumpsPriceInr) / 83).toFixed(2))
          : 0),
      mrpInr: toNum(product.dumpsMrpInr),
      mrpUsd:
        toNum(product.dumpsMrpUsd) ||
        (toNum(product.dumpsMrpInr) > 0
          ? parseFloat((toNum(product.dumpsMrpInr) / 83).toFixed(2))
          : 0),
      discount: calculateDiscount(product.dumpsMrpInr, product.dumpsPriceInr),
    };
  }, [product]);

  const onlineExamPrices = useMemo(() => {
    return {
      priceInr: examPrices.priceInr || 0,
      priceUsd:
        examPrices.priceUsd ||
        (examPrices.priceInr > 0
          ? parseFloat((examPrices.priceInr / 83).toFixed(2))
          : 0),
      mrpInr: examPrices.mrpInr || 0,
      mrpUsd:
        examPrices.mrpUsd ||
        (examPrices.mrpInr > 0
          ? parseFloat((examPrices.mrpInr / 83).toFixed(2))
          : 0),
      discount: calculateDiscount(examPrices.mrpInr, examPrices.priceInr),
    };
  }, [examPrices]);

  const comboPrices = useMemo(() => {
    if (!product) return null;
    return {
      priceInr: toNum(product.comboPriceInr),
      priceUsd:
        toNum(product.comboPriceUsd) ||
        (toNum(product.comboPriceInr) > 0
          ? parseFloat((toNum(product.comboPriceInr) / 83).toFixed(2))
          : 0),
      mrpInr: toNum(product.comboMrpInr),
      mrpUsd:
        toNum(product.comboMrpUsd) ||
        (toNum(product.comboMrpInr) > 0
          ? parseFloat((toNum(product.comboMrpInr) / 83).toFixed(2))
          : 0),
      discount: calculateDiscount(product.comboMrpInr, product.comboPriceInr),
    };
  }, [product]);

  const hasOnlineExam = useMemo(() => {
    return examPrices.priceInr > 0 || examPrices.priceUsd > 0;
  }, [examPrices]);

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

    const cartStore = useCartStore.getState();
    const existingItem = cartStore.cartItems.find(
      (item) => item._id === product._id && item.type === type,
    );

    if (existingItem) {
      toast.info("ℹ️ This item is already in your cart");
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
              productData?.examPriceInr || productData?.onlineExamPriceInr,
            ),
            priceUsd: toNum(
              productData?.examPriceUsd || productData?.onlineExamPriceUsd,
            ),
            mrpInr: toNum(
              productData?.examMrpInr || productData?.onlineExamMrpInr,
            ),
            mrpUsd: toNum(
              productData?.examMrpUsd || productData?.onlineExamMrpUsd,
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
          setAvgRating(total / fetchedReviews.length);
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
        setAvgRating(total / updatedReviews.length);
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

  return (
    <div className="min-h-screen pt-12 sm:pt-14 lg:pt-16 bg-gray-50 text-gray-800">
      <div className="container pt-2 sm:pt-3 lg:pt-4 mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl pb-1">
        <Breadcrumbs />
      </div>

      {/* Product Unavailability Alert - Compact */}
      {!productAvailable && product && (
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl mb-3 sm:mb-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <FaExclamationTriangle className="text-red-500 text-base sm:text-lg flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 text-sm sm:text-base">
                  Product Currently Unavailable
                </h3>
                <p className="text-red-700 text-xs sm:text-sm mt-1 leading-relaxed">
                  The PDF file for this product is not available at the moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">
          {/* Left Column - Image & Features - More Compact */}
          <div className="w-full lg:w-[32%]">
            <div className="lg:sticky lg:top-20">
              {/* Image - Smaller */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-3 sm:p-4">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full rounded object-contain h-[140px] sm:h-[160px] lg:h-[180px]"
                  />
                </div>
              </div>

              {/* Features List - Compact */}
              <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 sm:p-4 mt-3 sm:mt-4">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-2 sm:mb-3">
                  Why Choose Us?
                </h3>
                <div className="flex flex-col space-y-1.5 sm:space-y-2">
                  {[
                    "Instant Download",
                    "100% Real Dumps",
                    "Money Back Guarantee",
                    "90 Days Free Updates",
                    "24/7 Support",
                  ].map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-600 text-xs sm:text-sm flex-shrink-0 mt-0.5" />
                      <span className="text-gray-800 text-[11px] sm:text-xs font-medium leading-tight">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - More Compact */}
          <div className="w-full lg:w-[68%] space-y-3 sm:space-y-4">
            <h1 className="text-sm sm:text-base lg:text-lg font-bold break-words leading-tight text-gray-900">
              {product.title}
            </h1>

            {/* Exam Information Card - Ultra Compact */}
            {(product.examCode ||
              product.examName ||
              product.totalQuestions ||
              product.passingScore ||
              product.duration ||
              product.examLastUpdated) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-1.5 sm:p-2.5 lg:p-1.5">
                <h3 className="font-semibold text-[11px] sm:text-xs lg:text-[11px] mb-1 sm:mb-1.5 lg:mb-0 text-blue-900 flex items-center gap-1">
                  <FaFileAlt className="text-blue-600 text-[10px] sm:text-xs lg:text-[10px]" />
                  Exam Information
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-1.5 lg:gap-0.5">
                  {product.examCode && (
                    <div className="bg-white rounded px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-1.5 lg:py-0.5 border border-blue-100">
                      <p className="text-[9px] sm:text-[10px] lg:text-[9px] text-gray-500 mb-0">
                        Exam Code
                      </p>
                      <p className="text-[11px] sm:text-xs lg:text-[11px] font-semibold text-gray-900">
                        {product.examCode}
                      </p>
                    </div>
                  )}

                  {product.examName && (
                    <div className="bg-white rounded px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-1.5 lg:py-0.5 border border-blue-100 col-span-2 md:col-span-3">
                      <p className="text-[9px] sm:text-[10px] lg:text-[9px] text-gray-500 mb-0">
                        Exam Name
                      </p>
                      <p className="text-[11px] sm:text-xs lg:text-[11px] font-semibold text-gray-900 break-words leading-tight">
                        {product.examName}
                      </p>
                    </div>
                  )}

                  {product.totalQuestions && (
                    <div className="bg-white rounded px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-1.5 lg:py-0.5 border border-blue-100">
                      <p className="text-[9px] sm:text-[10px] lg:text-[9px] text-gray-500 mb-0">
                        Questions
                      </p>
                      <p className="text-[11px] sm:text-xs lg:text-[11px] font-semibold text-gray-900">
                        {product.totalQuestions}
                      </p>
                    </div>
                  )}

                  {product.passingScore && (
                    <div className="bg-white rounded px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-1.5 lg:py-0.5 border border-blue-100">
                      <p className="text-[9px] sm:text-[10px] lg:text-[9px] text-gray-500 mb-0">
                        Passing Score
                      </p>
                      <p className="text-[11px] sm:text-xs lg:text-[11px] font-semibold text-gray-900">
                        {product.passingScore}
                      </p>
                    </div>
                  )}

                  {product.duration && (
                    <div className="bg-white rounded px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-1.5 lg:py-0.5 border border-blue-100">
                      <p className="text-[9px] sm:text-[10px] lg:text-[9px] text-gray-500 mb-0">
                        Duration
                      </p>
                      <p className="text-[11px] sm:text-xs lg:text-[11px] font-semibold text-gray-900">
                        {product.duration}
                      </p>
                    </div>
                  )}

                  <div className="bg-white rounded px-1.5 py-0.5 sm:px-2 sm:py-1 lg:px-1.5 lg:py-0.5 border border-blue-100">
                    <p className="text-[9px] sm:text-[10px] lg:text-[9px] text-gray-500 mb-0">
                      Last Updated
                    </p>
                    <p className="text-[11px] sm:text-xs lg:text-[11px] font-semibold text-gray-900">
                      {new Date(Date.now()).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {avgRating && avgRating > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-1 sm:mt-1.5 lg:mt-0.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <FaStar
                        key={v}
                        className={`text-[10px] sm:text-xs lg:text-[10px] ${
                          v <= Math.round(avgRating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-[10px] sm:text-xs lg:text-[10px] text-gray-600 font-medium">
                      ({avgRating.toFixed(1)}/5)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Sections - Ultra Compact */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {/* Online Exam Questions */}
                {hasOnlineExam && !isLoadingExams && (
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3">
                      <div className="lg:w-48 lg:flex-shrink-0">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                          Online Exam Questions
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs sm:text-sm flex-wrap">
                        <span className="text-orange-500 font-semibold">
                          ₹{onlineExamPrices.priceInr || "3499"}
                        </span>
                        <span className="text-gray-600 text-[11px] sm:text-xs">
                          (${onlineExamPrices.priceUsd || "47.28"})
                        </span>
                        <span className="line-through text-gray-500 text-[11px] sm:text-xs">
                          ₹{onlineExamPrices.mrpInr || "6000"}
                        </span>
                      </div>

                      <div className="flex flex-row gap-2 lg:ml-auto">
                        <button
                          onClick={() =>
                            router.push(`/exam/sample-instruction/${slug}`)
                          }
                          className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded bg-slate-700 hover:bg-slate-800 text-white font-medium text-[11px] sm:text-xs uppercase transition-colors whitespace-nowrap"
                        >
                          <FaEye size={12} />
                          <span className="hidden sm:inline">TRY EXAM</span>
                          <span className="sm:hidden">TRY</span>
                        </button>
                        <button
                          onClick={() => handleAddToCart("online")}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#FA8B31] hover:bg-[#E57A21] text-gray-900 font-bold text-[11px] sm:text-xs uppercase rounded transition-colors whitespace-nowrap"
                        >
                          <FaShoppingCart size={12} />
                          ADD
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF Downloadable Format */}
                {pdfPrices && (pdfPrices.priceInr || pdfPrices.priceUsd) && (
                  <div
                    className={`p-3 sm:p-4 ${
                      !productAvailable ? "bg-gray-50 opacity-70" : ""
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3">
                      <div className="lg:w-48 lg:flex-shrink-0">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                          PDF Downloadable
                        </h3>
                        {!productAvailable && (
                          <span className="text-[10px] text-red-600 mt-0.5 inline-block">
                            (Unavailable)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs sm:text-sm flex-wrap">
                        <span className="text-orange-500 font-semibold">
                          ₹{pdfPrices.priceInr || "4999"}
                        </span>
                        <span className="text-gray-600 text-[11px] sm:text-xs">
                          (${pdfPrices.priceUsd || "67.55"})
                        </span>
                        <span className="line-through text-gray-500 text-[11px] sm:text-xs">
                          ₹{pdfPrices.mrpInr || "7000"}
                        </span>
                      </div>

                      <div className="flex flex-row gap-2 lg:ml-auto">
                        {product.samplePdfUrl && (
                          <button
                            onClick={() =>
                              handleDownload(
                                product.samplePdfUrl,
                                `${product.title}-Sample.pdf`,
                              )
                            }
                            className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded bg-slate-700 hover:bg-slate-800 text-white font-medium text-[11px] sm:text-xs uppercase transition-colors whitespace-nowrap"
                          >
                            <FaDownload size={12} />
                            <span className="hidden sm:inline">SAMPLE</span>
                            <span className="sm:hidden">PDF</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleAddToCart("regular")}
                          disabled={!productAvailable}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded text-[11px] sm:text-xs uppercase transition-colors whitespace-nowrap font-bold ${
                            productAvailable
                              ? "bg-[#FA8B31] hover:bg-[#E57A21] text-gray-900 cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <FaShoppingCart size={12} />
                          {productAvailable ? "ADD" : "N/A"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* PDF + Online Exam */}
                {hasOnlineExam &&
                  comboPrices &&
                  (comboPrices.priceInr || comboPrices.priceUsd) && (
                    <div
                      className={`p-3 sm:p-4 ${
                        !productAvailable ? "bg-gray-50 opacity-70" : ""
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 sm:gap-3">
                        <div className="lg:w-48 lg:flex-shrink-0">
                          <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                            PDF + Online Exam
                          </h3>
                          {!productAvailable && (
                            <span className="text-[10px] text-red-600 mt-0.5 inline-block">
                              (Unavailable)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs sm:text-sm flex-wrap">
                          <span className="text-orange-500 font-semibold">
                            ₹{comboPrices.priceInr || "6998"}
                          </span>
                          <span className="text-gray-600 text-[11px] sm:text-xs">
                            (${comboPrices.priceUsd || "94.57"})
                          </span>
                          <span className="line-through text-gray-500 text-[11px] sm:text-xs">
                            ₹{comboPrices.mrpInr || "8498"}
                          </span>
                        </div>

                        <div className="flex flex-row gap-2 lg:ml-auto">
                          <button
                            onClick={() => handleAddToCart("combo")}
                            disabled={!productAvailable}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded text-[11px] sm:text-xs uppercase transition-colors whitespace-nowrap font-bold ${
                              productAvailable
                                ? "bg-[#FA8B31] hover:bg-[#E57A21] text-gray-900 cursor-pointer"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <FaShoppingCart size={12} />
                            {productAvailable ? "ADD" : "N/A"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Description - Compact */}
            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
              <h2 className="text-sm sm:text-base font-bold mb-2 sm:mb-3 text-gray-900">
                Description
              </h2>

              <div className="relative w-full overflow-visible">
                <div
                  className="
        prose prose-sm max-w-none
        prose-p:text-gray-700 prose-p:text-xs prose-p:sm:text-sm prose-p:leading-relaxed
        prose-li:text-gray-700 prose-li:text-xs prose-li:sm:text-sm prose-li:leading-relaxed
        prose-strong:text-gray-900
        prose-a:text-blue-600
        prose-headings:text-gray-900 prose-headings:text-sm

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
          </div>
        </div>

        {/* Full Width Sections Below */}

        {/* Long Description - Full Width */}
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl mt-6 sm:mt-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 overflow-hidden border-2 border-gray-200">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-4 sm:mb-5 text-gray-900 flex items-center gap-2">
              <FaClipboardList className="text-blue-600 text-lg sm:text-xl" />
              Detailed Overview
            </h2>
            <div
              className="prose prose-sm sm:prose max-w-full
              prose-p:text-gray-700 prose-p:break-words prose-p:leading-relaxed prose-p:text-xs prose-p:sm:text-sm prose-p:lg:text-base
              prose-li:text-gray-700 prose-li:break-words prose-li:leading-relaxed prose-li:text-xs prose-li:sm:text-sm prose-li:lg:text-base
              prose-strong:text-gray-900
              prose-a:text-blue-600 prose-a:break-all
              prose-headings:break-words prose-headings:text-gray-900 prose-headings:text-sm prose-headings:sm:text-base prose-headings:lg:text-lg
              break-words overflow-hidden
              [&_*]:max-w-full [&_*]:break-words
              [&_img]:max-w-full [&_img]:h-auto
              [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto
              [&_pre]:overflow-x-auto [&_pre]:max-w-full
              [&_code]:break-all"
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

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl mt-6 sm:mt-8">
          <ReviewsSection
            reviews={reviews}
            reviewForm={reviewForm}
            setReviewForm={setReviewForm}
            handleAddReview={handleAddReview}
          />
        </div>

        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl mt-6 sm:mt-8">
          {product.faqs && product.faqs.length > 0 && (
            <FAQSection
              faqs={product.faqs}
              activeIndex={activeIndex}
              toggleAccordion={toggleAccordion}
            />
          )}
        </div>

        <RelatedProducts currentSlug={slug} maxProducts={10} />

        <Toaster />
      </div>
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
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0, count: 0 },
  );

  const avgRating =
    ratingStats.count > 0
      ? (ratingStats.total / ratingStats.count).toFixed(1)
      : 0;

  return (
    <div className="space-y-6 sm:space-y-8 pt-8 sm:pt-12 md:pt-16">
      {/* Header with Overall Rating */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-blue-200">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3 justify-center lg:justify-start mb-2">
              <FaQuoteLeft className="text-blue-600 text-xl sm:text-2xl lg:text-3xl" />
              Customer Reviews
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Real feedback from verified customers
            </p>
          </div>

          {publishedReviews.length > 0 && (
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 bg-white rounded-xl px-6 py-6 shadow-lg w-full lg:w-auto">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">
                    {avgRating}
                  </span>
                  <FaStar className="text-yellow-400 text-2xl sm:text-3xl" />
                </div>
                <div className="flex items-center gap-1 mb-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-lg sm:text-xl ${
                        star <= Math.round(avgRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-500">
                  Based on {publishedReviews.length} review
                  {publishedReviews.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-2 min-w-[200px] sm:min-w-[260px] w-full md:w-auto">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingStats[rating];
                  const percentage =
                    ratingStats.count > 0
                      ? Math.round((count / ratingStats.count) * 100)
                      : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm sm:text-base font-medium text-gray-700 w-8 flex items-center gap-1">
                        {rating}
                        <FaStar className="text-yellow-400 text-xs" />
                      </span>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm sm:text-base text-gray-600 w-8 text-right font-medium">
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10">
        {/* Reviews List */}
        <div className="order-2 xl:order-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              What Our Customers Say
            </h3>
            {publishedReviews.length > 0 && (
              <span className="text-sm sm:text-base text-gray-500 bg-gray-100 px-3 py-2 rounded-full font-medium">
                {publishedReviews.length}{" "}
                {publishedReviews.length === 1 ? "Review" : "Reviews"}
              </span>
            )}
          </div>

          <div className="max-h-[600px] sm:max-h-[700px] xl:max-h-[900px] overflow-y-auto space-y-4 sm:space-y-6 pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                  <p className="text-gray-600 text-base">Loading reviews...</p>
                </div>
              </div>
            ) : publishedReviews.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300">
                <FaQuoteLeft className="text-gray-300 text-6xl mx-auto mb-6" />
                <p className="text-gray-600 text-lg sm:text-xl font-medium mb-4">
                  No reviews yet
                </p>
                <p className="text-gray-500 text-base sm:text-lg">
                  Be the first to share your experience!
                </p>
              </div>
            ) : (
              publishedReviews.map((r, i) => (
                <div
                  key={r._id || i}
                  className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
                        {(r.customer || r.name || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base sm:text-lg">
                          {r.customer || r.name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, idx) => (
                              <FaStar
                                key={idx}
                                className={`text-sm sm:text-base ${
                                  idx < r.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm sm:text-base text-gray-500 font-medium">
                            {r.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(r.createdAt || r.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="relative">
                    <FaQuoteLeft className="absolute -left-2 -top-2 text-blue-200 text-lg opacity-50" />
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed pl-6 break-words">
                      {r.comment}
                    </p>
                  </div>

                  {/* Verified Badge (if applicable) */}
                  {r.verified && (
                    <div className="mt-4 flex items-center gap-2 text-green-600">
                      <FaCheckCircle className="text-sm sm:text-base" />
                      <span className="text-sm sm:text-base font-medium">
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
        <div className="order-1 xl:order-2">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 sm:p-8 shadow-xl border-2 border-blue-200 xl:sticky xl:top-24">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
              Write Your Review
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Share your experience to help others make informed decisions
            </p>

            <form onSubmit={handleAddReview} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    value={reviewForm.name}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="w-full border-2 border-gray-300 pl-12 pr-4 py-3 sm:py-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-3">
                  Your Rating *
                </label>
                <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-300">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setReviewForm({ ...reviewForm, rating: value })
                        }
                        className={`transition-all transform hover:scale-125 active:scale-110 p-2 ${
                          value <= reviewForm.rating ? "scale-110" : ""
                        }`}
                      >
                        <FaStar
                          className={`text-3xl sm:text-4xl ${
                            value <= reviewForm.rating
                              ? "text-yellow-400 drop-shadow-lg"
                              : "text-gray-300 hover:text-yellow-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-sm sm:text-base font-medium text-gray-700">
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
                <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  placeholder="Tell us about your experience with this product. What did you like? What could be improved?"
                  rows="5"
                  className="w-full border-2 border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm sm:text-base bg-white"
                  required
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Minimum 10 characters
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 sm:py-5 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl text-base sm:text-lg transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Submit Review ✨
              </button>

              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 flex items-start gap-3">
                <FaCheckCircle className="text-blue-600 mt-1 flex-shrink-0 text-base" />
                <p className="text-sm sm:text-base text-blue-800 leading-relaxed">
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
          width: 8px;
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
    <div className="py-6 sm:py-8 lg:py-10">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-center flex items-center justify-center gap-3">
        <FaUser className="text-blue-600 text-xl sm:text-2xl lg:text-3xl" />
        Frequently Asked Questions (FAQs)
      </h2>
      <div className="space-y-4 sm:space-y-6">
        {faqs.map((faq, idx) => {
          const isOpen = activeIndex === idx;
          return (
            <div
              key={idx}
              className="border-2 border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left group hover:bg-gray-50 gap-4 transition-colors"
              >
                <span className="font-semibold text-gray-800 text-sm sm:text-base lg:text-lg text-left leading-relaxed">
                  {faq.question}
                </span>
                <FaChevronRight
                  className={`text-gray-600 transform transition-transform text-lg sm:text-xl flex-shrink-0 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-gray-600 text-sm sm:text-base lg:text-lg border-t border-gray-200 bg-gray-50">
                  <p className="leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
