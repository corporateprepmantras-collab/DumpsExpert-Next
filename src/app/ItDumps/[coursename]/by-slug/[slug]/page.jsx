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
    return data.data || null; // ✅ directly return product object
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
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
  const [exams, setExams] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    comment: "",
    rating: 0,
  });
  const [avgRating, setAvgRating] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  const handleAddToCart = (type = "regular") => {
    if (!product) return;

    let item = {
      ...product,
      type,
      title: product.title,
      imageUrl: product.imageUrl,
      samplePdfUrl: product.samplePdfUrl,
      mainPdfUrl: product.mainPdfUrl,
    };

    switch (type) {
      case "regular":
        item.title = `${product.title} [PDF]`;
        item.price = product.dumpsPriceInr || product.dumpsPriceUsd;
        break;
      case "online":
        item.title = `${product.title} [Online Exam]`;
        item.price = exams?.priceINR || exams?.priceUSD;
        break;
      case "combo":
        item.title = `${product.title} [Combo]`;
        item.price = product.comboPriceInr || product.comboPriceUsd;
        break;
      default:
        item.title = product.title;
        item.price = product.dumpsPriceInr || product.dumpsPriceUsd;
    }

    useCartStore.getState().addToCart(item);
    toast.success(`Added ${item.title} to cart!`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        // ✅ Fetch product
        const productData = await fetchProduct(slug);
        setProduct(productData);

        // ✅ Fetch related products
        const allProducts = await fetchAllProducts();
        setRelatedProducts(allProducts.filter((p) => p.slug !== slug));
console.log("All products:", productData);
        // ✅ Fetch exam details by slug
        const examRes = await fetch(
          `/api/exams/byslug/${encodeURIComponent(slug)}`
        );
        if (!examRes.ok) throw new Error("Failed to fetch exam details");
  const examData = await examRes.json();
setExams(Array.isArray(examData.data) ? examData.data : []);

        console.log("Exam data:", examData);

        // ✅ Mock reviews
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
      } catch (err) {
        console.error("Error loading product/exam data:", err);
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

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment || reviewForm.rating === 0)
      return;

    setReviews([
      { ...reviewForm, createdAt: new Date().toISOString() },
      ...reviews,
    ]);
    setReviewForm({ name: "", comment: "", rating: 0 });
  };

  const toggleAccordion = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  if (!product) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen mt-20 bg-white py-10 px-4 md:px-20 text-gray-800">
      <div className="max-w-5xl mx-auto mb-6">
        <Breadcrumbs />
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Column */}
        <div className="md:w-[40%]">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full rounded-xl object-contain shadow-md max-h-[400px]"
          />

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 bg-white border border-gray-200 shadow-sm rounded-xl px-6 py-5 mt-8 text-gray-900 text-sm font-medium">
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

     {/* Right Column */}
<div className="md:w-[60%] space-y-3">
  {/* Title & Basic Info */}
  <h1 className="text-2xl md:text-3xl font-bold break-words">{product.title}</h1>
  <p className="text-xs md:text-sm">
    Exam Code: <strong>{product.sapExamCode}</strong>
  </p>
  <p className="text-xs md:text-sm">
    Category: <strong>{product.category}</strong>
  </p>
{Array.isArray(exams) && exams.length > 0 && exams.map((exam) => (
  <div
    key={exam._id}
    className=" pt-2"
  >
    {/* Info */}
    <div className="w-full">
      <p className="font-semibold text-sm md:text-base">
        Exam Name: {exam.name || "Online Exam"}
      </p>
    <p className="text-xs md:text-sm mt-1">
        Exam Code: <strong>{exam.code ?? "N/A"}</strong> <br />
         Duration:{" "}
        <strong>{exam.duration ?? 0} mins</strong>
      </p>
      <p className="text-xs md:text-sm">
        Passing Score: <strong>{exam.passingScore ?? "N/A"}</strong>
      </p>
      
    </div>
  </div>
))}
  {/* Ratings */}
  {avgRating && (
    <div className="flex items-center gap-2 flex-wrap">
      {[1, 2, 3, 4, 5].map((v) => (
        <FaStar
          key={v}
          className={`text-lg md:text-xl ${
            v <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-xs md:text-sm text-gray-600">({avgRating}/5)</span>
    </div>
  )}

  {/* Pricing Sections */}
  <div className="mt-4 space-y-6">
    {/* Dumps PDF */}
    {(product.dumpsPriceInr || product.dumpsPriceUsd) && (
      <div className="flex flex-col md:flex-row md:justify-between gap-4 p-3 border rounded-lg bg-white shadow-sm">
        {/* Info */}
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
              ({calculateDiscount(product.dumpsMrpInr, product.dumpsPriceInr)}% off)
            </span>
          </p>
          <p className="text-xs md:text-sm">
            $<span className="text-blue-400 font-bold ml-1">{product.dumpsPriceUsd ?? "N/A"}</span>
            <span className="text-red-400 font-bold line-through ml-2 text-xs md:text-sm">
              ${product.dumpsMrpUsd ?? "N/A"}
            </span>
            <span className="text-gray-400 font-bold text-xs md:text-sm ml-1">
              ({calculateDiscount(product.dumpsMrpUsd, product.dumpsPriceUsd)}% off)
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {product.samplePdfUrl && (
            <button
              onClick={() =>
                handleDownload(product.samplePdfUrl, `${product.title}-Sample.pdf`)
              }
              className="bg-gray-800 text-white px-4 py-2 rounded text-sm w-full sm:w-auto"
            >
              Download Sample
            </button>
          )}
          <button
            onClick={() => handleAddToCart("regular")}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto"
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    )}

    {/* Online Exam */}
{Array.isArray(exams) && exams.length > 0 && exams.map((exam) => (
  <div
    key={exam._id}
    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-white shadow-sm gap-4"
  >
    {/* Info */}
    <div className="w-full">
     
      <p className="text-blue-600 font-bold text-sm md:text-base">
        ₹{exam.priceINR ?? "N/A"}
        <span className="text-red-600 line-through ml-2 text-xs md:text-sm">
          ₹{exam.mrpINR ?? "N/A"}
        </span>
        <span className="text-gray-600 text-xs md:text-sm ml-1">
          ({calculateDiscount(exam.mrpINR, exam.priceINR)}% off)
        </span>
      </p>
      <p className="text-xs md:text-sm">
        $<span className="text-blue-400 font-bold ml-1">{exam.priceUSD ?? "N/A"}</span>
        <span className="text-red-400 font-bold line-through ml-2 text-xs md:text-sm">
          ${exam.mrpUSD ?? "N/A"}
        </span>
        <span className="text-gray-400 font-bold text-xs md:text-sm ml-1">
          ({calculateDiscount(exam.mrpUSD, exam.priceUSD)}% off)
        </span>
      </p>
    
    </div>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
      <button
        onClick={() => router.push(`/exam/sample-instruction/${slug}`)}
        className="bg-blue-600 text-white px-3 py-2 rounded text-sm w-full sm:w-auto"
      >
        Try Online Exam
      </button>
      <button
        onClick={() => handleAddToCart("online")}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-4 py-2 rounded text-sm w-full sm:w-auto"
      >
        🛒 Add to Cart
      </button>
    </div>
  </div>
))}


    {/* Combo */}
    {Array.isArray(exams) && exams.length > 0 && exams.map((exam) => (
      <div
        key={`combo-${exam._id}`}
        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-white shadow-sm gap-4"
      >
        {/* Info */}
        <div className="w-full">
          <p className="font-semibold text-sm md:text-base">Get Combo (PDF + Online Exam)</p>
          <p className="text-blue-600 font-bold text-sm md:text-base">
            ₹{product.comboPriceInr ?? "N/A"}
            <span className="text-red-600 line-through ml-2 text-xs md:text-sm">
              ₹{product.comboMrpInr ?? "N/A"}
            </span>
          </p>
          <p className="text-xs md:text-sm">
            $<span className="text-blue-400 font-bold ml-1">{product.comboPriceUsd ?? "N/A"}</span>
            <span className="text-red-400 line-through ml-2 text-xs md:text-sm">
              ${product.comboMrpUsd ?? "N/A"}
            </span>
          </p>
        </div>

        {/* Button */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={() => handleAddToCart("combo")}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-4 py-2 rounded text-sm w-full sm:w-auto"
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    ))}
  </div>

  {/* Description */}
  <div className="mt-6">
    <h2 className="text-lg md:text-xl font-semibold mb-2">Description:</h2>
    <div
      className="prose max-w-none text-xs md:text-sm"
      dangerouslySetInnerHTML={{
        __html: product.Description || "No description available",
      }}
    />
  </div>
</div>

      </div>

      {/* Long Description */}
      <div className="my-10">
        <h2 className="text-lg font-semibold mb-2">Detailed Overview:</h2>
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{
            __html: product.longDescription || "No detailed overview available",
          }}
        />
      </div>

      {/* Reviews */}
      <ReviewsSection
        reviews={reviews}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        handleAddReview={handleAddReview}
      />

      {/* FAQs */}
      {product.faqs && product.faqs.length > 0 && (
        <FAQSection
          faqs={product.faqs}
          activeIndex={activeIndex}
          toggleAccordion={toggleAccordion}
        />
      )}

      {/* Related */}
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
                <p className="text-xs text-gray-500 mt-1">₹ {p.dumpsPriceInr}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

/* --- Subcomponents --- */
function ReviewsSection({ reviews, reviewForm, setReviewForm, handleAddReview }) {
  return (
    <div className="container mx-auto mt-10 grid md:grid-cols-2 gap-10">
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
                  value <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"
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
                <span className="font-medium text-gray-800">{faq.question}</span>
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
