"use client";

import { useState, useEffect } from "react";
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

  // Update the handleAddToCart function in your ProductDetailsPage component

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

    // Check if item already exists in cart
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
    <div className="min-h-screen pt-12 sm:pt-14 lg:pt-16 bg-gray-50 text-gray-800">
      <div className="container mx-auto px-2 sm:px-3 pt-0.5 pb-1">
        <Breadcrumbs />
      </div>
      {/* //updated ui */}
      {/* Product Unavailability Alert */}
      {!productAvailable && product && (
        <div className="container mx-auto px-2 sm:px-3 mb-1.5 sm:mb-2">
          <div className="bg-red-50 border-l-4 border-red-500 p-1.5 sm:p-2 rounded-lg shadow-sm">
            <div className="flex items-center gap-1.5">
              <FaExclamationTriangle className="text-red-500 text-sm sm:text-base flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 text-[10px] sm:text-xs">
                  Product Currently Unavailable
                </h3>
                <p className="text-red-700 text-[9px] sm:text-[10px] mt-0.5 leading-tight">
                  The PDF file for this product is not available at the moment.
                  Please contact support or check back later.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-2 sm:px-3 flex flex-col lg:flex-row gap-2 lg:gap-3">
        {/* Left Column - Sticky */}
        <div className="w-full lg:w-[35%]">
          <div className="lg:sticky lg:top-20">
            {/* Image */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 sm:p-1.5 shadow-md">
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-1">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full rounded-lg object-contain h-[160px] sm:h-[180px] lg:h-[150px]"
                />
              </div>
            </div>

            {/* Features List */}
            <div className="bg-white border border-gray-200 shadow-md rounded-lg p-1 sm:p-1.5 mt-1.5 lg:mt-2">
              <div className="flex flex-col space-y-0.5 sm:space-y-1">
                {[
                  "Instant Download After Purchase",
                  "100% Real & Updated Dumps",
                  "100% Money Back Guarantee",
                  "90 Days Free Updates",
                  "24/7 Customer Support",
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <FaCheckCircle className="text-green-600 text-[10px] sm:text-xs flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800 text-[9px] sm:text-[10px] font-medium leading-tight">
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[65%] space-y-1 sm:space-y-1.5">
          <h1 className="text-sm sm:text-base lg:text-lg font-bold break-words leading-tight">
            {product.title}
          </h1>

          {/* NEW: Exam Information Card */}
          {(product.examCode ||
            product.examName ||
            product.totalQuestions ||
            product.passingScore ||
            product.duration ||
            product.examLastUpdated) && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md p-1 sm:p-1.5">
              <h3 className="font-semibold text-[9px] sm:text-[10px] mb-0.5 sm:mb-1 text-blue-900 flex items-center gap-0.5 sm:gap-1">
                <FaFileAlt className="text-blue-600 text-[8px] sm:text-[9px]" />
                Exam Information
              </h3>

              <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
                {product.examCode && (
                  <div className="flex items-start gap-0.5 sm:gap-1">
                    <FaClipboardList className="text-blue-600 mt-0.5 flex-shrink-0 text-[7px] sm:text-[8px]" />
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[8px] text-gray-600 leading-none mb-0.5">
                        Exam Code
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-800 leading-tight">
                        {product.examCode}
                      </p>
                    </div>
                  </div>
                )}

                {product.examName && (
                  <div className="flex items-start gap-0.5 sm:gap-1">
                    <FaFileAlt className="text-blue-600 mt-0.5 flex-shrink-0 text-[7px] sm:text-[8px]" />
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[8px] text-gray-600 leading-none mb-0.5">
                        Exam Name
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-800 leading-tight">
                        {product.examName}
                      </p>
                    </div>
                  </div>
                )}

                {product.totalQuestions && (
                  <div className="flex items-start gap-0.5 sm:gap-1">
                    <FaClipboardList className="text-blue-600 mt-0.5 flex-shrink-0 text-[7px] sm:text-[8px]" />
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[8px] text-gray-600 leading-none mb-0.5">
                        Total Questions
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-800 leading-tight">
                        {product.totalQuestions}
                      </p>
                    </div>
                  </div>
                )}

                {product.passingScore && (
                  <div className="flex items-start gap-0.5 sm:gap-1">
                    <FaTrophy className="text-yellow-600 mt-0.5 flex-shrink-0 text-[7px] sm:text-[8px]" />
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[8px] text-gray-600 leading-none mb-0.5">
                        Passing Score
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-800 leading-tight">
                        {product.passingScore}
                      </p>
                    </div>
                  </div>
                )}

                {product.duration && (
                  <div className="flex items-start gap-0.5 sm:gap-1">
                    <FaClock className="text-green-600 mt-0.5 flex-shrink-0 text-[7px] sm:text-[8px]" />
                    <div className="min-w-0">
                      <p className="text-[7px] sm:text-[8px] text-gray-600 leading-none mb-0.5">
                        Duration
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-800 leading-tight">
                        {product.duration}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-0.5 sm:gap-1">
                  <FaCalendarAlt className="text-purple-600 mt-0.5 flex-shrink-0 text-[7px] sm:text-[8px]" />
                  <div className="min-w-0">
                    <p className="text-[7px] sm:text-[8px] text-gray-600 leading-none mb-0.5">
                      Last Updated
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-semibold text-gray-800 leading-tight">
                      {new Date(Date.now()).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
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
            <div className="flex items-center gap-0.5 flex-wrap">
              {[1, 2, 3, 4, 5].map((v) => (
                <FaStar
                  key={v}
                  className={`text-xs ${
                    v <= Math.round(avgRating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-[10px] sm:text-[11px] text-gray-600 font-medium">
                ({avgRating}/5)
              </span>
            </div>
          )}

          {/* Pricing Sections */}
          <div className="mt-1 sm:mt-1.5 space-y-1 sm:space-y-1.5">
            {/* PDF Download */}
            {(product.dumpsPriceInr || product.dumpsPriceUsd) && (
              <div
                className={`flex flex-col gap-1 p-1 sm:p-1.5 border rounded-lg shadow-sm ${
                  !productAvailable ? "bg-gray-100 opacity-70" : "bg-white"
                }`}
              >
                <div className="w-full">
                  <p className="font-semibold text-[10px] sm:text-xs mb-0">
                    📄 Downloadable PDF File
                    {!productAvailable && (
                      <span className="ml-2 text-xs text-red-600 font-normal">
                        (Currently Unavailable)
                      </span>
                    )}
                  </p>
                  <p className="text-blue-600 font-bold text-[10px] sm:text-xs">
                    ₹{product.dumpsPriceInr ?? "N/A"}
                    <span className="text-red-500 ml-1 line-through text-[8px] sm:text-[9px]">
                      ₹{product.dumpsMrpInr ?? "N/A"}
                    </span>
                    <span className="text-gray-600 text-xs sm:text-sm ml-1">
                      (
                      {calculateDiscount(
                        product.dumpsMrpInr,
                        product.dumpsPriceInr,
                      )}
                      % off)
                    </span>
                  </p>
                  <p className="text-blue-600 font-bold text-sm sm:text-base">
                    ${product.dumpsPriceUsd ?? "N/A"}
                    <span className="text-red-500 ml-2 line-through text-xs sm:text-sm">
                      ${product.dumpsMrpUsd ?? "N/A"}
                    </span>
                    <span className="text-gray-600 text-xs sm:text-sm ml-1">
                      (
                      {calculateDiscount(
                        product.dumpsMrpUsd,
                        product.dumpsPriceUsd,
                      )}
                      % off)
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-1 w-full">
                  {product.samplePdfUrl && (
                    <button
                      onClick={() =>
                        handleDownload(
                          product.samplePdfUrl,
                          `${product.title}-Sample.pdf`,
                        )
                      }
                      className="bg-gray-800 text-white px-2 py-1 rounded text-[9px] sm:text-[10px] hover:bg-gray-700 transition-all w-full sm:w-auto font-medium"
                    >
                      📥 Download Sample
                    </button>
                  )}
                  <button
                    onClick={() => handleAddToCart("regular")}
                    disabled={!productAvailable}
                    className={`font-semibold px-2 py-1 rounded text-[9px] sm:text-[10px] transition-all w-full sm:flex-1 ${
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
              <div className="flex flex-col gap-1 p-1 sm:p-1.5 border rounded-lg bg-white shadow-sm">
                <div className="w-full">
                  <p className="font-semibold text-[10px] sm:text-xs mb-0">
                    📝 Online Exam
                  </p>
                  {exams[0] && (
                    <p className="text-[10px] sm:text-xs text-gray-600 mb-0.5">
                      {exams[0].name || "Online Exam"}
                    </p>
                  )}
                  <p className="text-blue-600 font-bold text-[10px] sm:text-xs">
                    ₹{examPrices.priceInr || "N/A"}
                    {examPrices.mrpInr > 0 && (
                      <>
                        <span className="text-red-600 line-through ml-2 text-xs sm:text-sm">
                          ₹{examPrices.mrpInr}
                        </span>
                        <span className="text-gray-600 text-xs sm:text-sm ml-1">
                          (
                          {calculateDiscount(
                            examPrices.mrpInr,
                            examPrices.priceInr,
                          )}
                          % off)
                        </span>
                      </>
                    )}
                  </p>
                  {exams[0] && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                      Duration: {exams[0].duration || 0} mins | Questions:{" "}
                      {exams[0].numberOfQuestions || 0}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-1 w-full">
                  <button
                    onClick={() =>
                      router.push(`/exam/sample-instruction/${slug}`)
                    }
                    className="bg-blue-600 text-white px-2 py-1 rounded text-[9px] sm:text-[10px] hover:bg-blue-700 transition-all w-full sm:w-auto font-medium"
                  >
                    🎯 Try Online Exam
                  </button>

                  <button
                    onClick={() => handleAddToCart("online")}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-2 py-1 rounded text-[9px] sm:text-[10px] hover:shadow-lg transition-all w-full sm:flex-1"
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
                  className={`flex flex-col gap-1 p-1 sm:p-1.5 border rounded-lg shadow-sm ${
                    !productAvailable ? "bg-gray-100 opacity-70" : "bg-white"
                  }`}
                >
                  <div className="w-full">
                    <p className="font-semibold text-[10px] sm:text-xs mb-0">
                      🎁 Get Combo (PDF + Online Exam)
                      {!productAvailable && (
                        <span className="ml-1 text-[8px] sm:text-[9px] text-red-600 font-normal">
                          (Currently Unavailable)
                        </span>
                      )}
                    </p>
                    <p className="text-blue-600 font-bold text-[10px] sm:text-xs">
                      ₹{product.comboPriceInr ?? "N/A"}
                      <span className="text-red-600 line-through ml-1 text-[8px] sm:text-[9px]">
                        ₹{product.comboMrpInr ?? "N/A"}
                      </span>
                      <span className="text-gray-600 text-[8px] sm:text-[9px] ml-1">
                        (
                        {calculateDiscount(
                          product.comboMrpInr,
                          product.comboPriceInr,
                        )}
                        % off)
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap gap-1 w-full">
                    <button
                      onClick={() => handleAddToCart("combo")}
                      disabled={!productAvailable}
                      className={`font-semibold px-2 py-1 rounded text-[9px] sm:text-[10px] transition-all w-full sm:flex-1 ${
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
          <div className="bg-white rounded-lg shadow-lg p-1 sm:p-1.5">
            <h2 className="text-[11px] sm:text-sm font-bold mb-0.5 sm:mb-1 text-gray-900">
              Description
            </h2>

            <div className="relative w-full overflow-visible">
              <div
                className="
        prose prose-xs max-w-none
        prose-p:text-gray-700 prose-p:text-[10px] prose-p:leading-tight
        prose-li:text-gray-700 prose-li:text-[10px] prose-li:leading-tight
        prose-strong:text-gray-900
        prose-a:text-blue-600
        prose-headings:text-gray-900 prose-headings:text-[11px]

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
      <div className="container mx-auto px-2 sm:px-3 mt-4 sm:mt-5 lg:mt-6">
        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 overflow-hidden">
          <h2 className="text-sm sm:text-base font-bold mb-1.5 sm:mb-2 text-gray-900">
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

      <div className="container mx-auto px-2 sm:px-3 mt-6 sm:mt-8 lg:mt-10">
        <ReviewsSection
          reviews={reviews}
          reviewForm={reviewForm}
          setReviewForm={setReviewForm}
          handleAddReview={handleAddReview}
        />
      </div>

      <div className="container mx-auto px-2 sm:px-3 mt-6 sm:mt-8">
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
    <div className="space-y-4 sm:space-y-6 pt-8 sm:pt-10 md:pt-12">
      {/* Header with Overall Rating */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-lg border border-blue-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center md:text-left">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 justify-center md:justify-start mb-1">
              <FaQuoteLeft className="text-blue-600 text-xs sm:text-sm md:text-base" />
              Customer Reviews
            </h2>
            <p className="text-gray-600 text-[10px] sm:text-xs">
              Real feedback from verified customers
            </p>
          </div>

          {publishedReviews.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 bg-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-md w-full sm:w-auto">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-0.5 justify-center">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    {avgRating}
                  </span>
                  <FaStar className="text-yellow-400 text-base sm:text-lg" />
                </div>
                <div className="flex items-center gap-0.5 mb-0.5 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-sm ${
                        star <= Math.round(avgRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[9px] sm:text-[10px] text-gray-500">
                  Based on {publishedReviews.length} review
                  {publishedReviews.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-0.5 min-w-[140px] sm:min-w-[160px] w-full sm:w-auto">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingStats[rating];
                  const percentage =
                    ratingStats.count > 0
                      ? Math.round((count / ratingStats.count) * 100)
                      : 0;

                  return (
                    <div key={rating} className="flex items-center gap-1">
                      <span className="text-[9px] sm:text-[10px] font-medium text-gray-700 w-5 sm:w-6">
                        {rating}{" "}
                        <FaStar className="inline text-yellow-400 text-[9px] sm:text-[10px]" />
                      </span>
                      <div className="flex-1 h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-gray-600 w-6 sm:w-8 text-right">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Reviews List */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-bold text-gray-800">
              What Our Customers Say
            </h3>
            {publishedReviews.length > 0 && (
              <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                {publishedReviews.length}{" "}
                {publishedReviews.length === 1 ? "Review" : "Reviews"}
              </span>
            )}
          </div>

          <div className="max-h-[500px] sm:max-h-[600px] lg:max-h-[700px] overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-3 sm:border-4 border-blue-500 border-t-transparent mx-auto mb-3 sm:mb-4"></div>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Loading reviews...
                  </p>
                </div>
              </div>
            ) : publishedReviews.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300">
                <FaQuoteLeft className="text-gray-300 text-4xl sm:text-5xl mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 text-sm sm:text-base font-medium mb-1 sm:mb-2">
                  No reviews yet
                </p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Be the first to share your experience!
                </p>
              </div>
            ) : (
              publishedReviews.map((r, i) => (
                <div
                  key={r._id || i}
                  className="bg-white border-2 border-gray-100 rounded-lg sm:rounded-xl p-2 sm:p-3 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-1.5 sm:mb-2 gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-md flex-shrink-0">
                        {(r.customer || r.name || "A")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-[11px] sm:text-xs">
                          {r.customer || r.name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, idx) => (
                              <FaStar
                                key={idx}
                                className={`text-[10px] ${
                                  idx < r.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[9px] text-gray-500">
                            {r.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[9px] text-gray-500 bg-gray-100 px-1 py-0.5 rounded-full whitespace-nowrap">
                        {new Date(r.createdAt || r.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="relative">
                    <FaQuoteLeft className="absolute -left-1 -top-1 text-blue-200 text-xs sm:text-sm opacity-50" />
                    <p className="text-gray-700 text-[11px] sm:text-xs leading-relaxed pl-3 sm:pl-4 break-words">
                      {r.comment}
                    </p>
                  </div>

                  {/* Verified Badge (if applicable) */}
                  {r.verified && (
                    <div className="mt-2 flex items-center gap-0.5 text-green-600">
                      <FaCheckCircle className="text-[10px]" />
                      <span className="text-[9px] font-medium">
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
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-lg border border-blue-100 sticky top-16 sm:top-20">
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 mb-1">
              Write Your Review
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-600 mb-3 sm:mb-4">
              Share your experience to help others make informed decisions
            </p>

            <form onSubmit={handleAddReview} className="space-y-2 sm:space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                  Your Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] sm:text-xs" />
                  <input
                    value={reviewForm.name}
                    onChange={(e) =>
                      setReviewForm({ ...reviewForm, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="w-full border-2 border-gray-200 pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 sm:py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[11px] sm:text-xs bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  Your Rating *
                </label>
                <div className="bg-white rounded-lg p-2 sm:p-3 border-2 border-gray-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
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
                          className={`text-lg sm:text-xl md:text-2xl ${
                            value <= reviewForm.rating
                              ? "text-yellow-400 drop-shadow-lg"
                              : "text-gray-300 hover:text-yellow-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-[10px] sm:text-xs font-medium text-gray-700">
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
                <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                  Your Review *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  placeholder="Tell us about your experience with this product. What did you like? What could be improved?"
                  rows="4"
                  className="w-full border-2 border-gray-200 p-2 sm:p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-[11px] sm:text-xs bg-white"
                  required
                />
                <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">
                  Minimum 10 characters
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl text-[11px] sm:text-xs transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Submit Review ✨
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 sm:p-2 flex items-start gap-1">
                <FaCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0 text-[10px] sm:text-xs" />
                <p className="text-[9px] sm:text-[10px] text-blue-800">
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
    <div className="py-4 sm:py-6">
      <h2 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-center flex items-center justify-center gap-1.5">
        <FaUser className="text-blue-600 text-xs sm:text-sm" /> Frequently Asked
        Questions (FAQs)
      </h2>
      <div className="space-y-2 sm:space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = activeIndex === idx;
          return (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg shadow-sm bg-white"
            >
              <button
                onClick={() => toggleAccordion(idx)}
                className="w-full flex justify-between items-center px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left group hover:bg-gray-50 gap-1.5"
              >
                <span className="font-medium text-gray-800 text-[11px] sm:text-xs text-left">
                  {faq.question}
                </span>
                <FaChevronRight
                  className={`text-gray-600 transform transition-transform text-[10px] flex-shrink-0 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-gray-600 text-[10px] sm:text-xs">
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
