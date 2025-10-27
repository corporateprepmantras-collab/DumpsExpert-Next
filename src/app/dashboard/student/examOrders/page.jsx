"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ExamCoursesPage = () => {
  const [examCourses, setExamCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState([]);
  const [allExamSlugs, setAllExamSlugs] = useState([]);
  const [coursesWithoutSlugs, setCoursesWithoutSlugs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchExamCourses = async () => {
      const debug = [];

      try {
        console.log("🔄 Step 1: Fetching user orders...");
        const { data } = await axios.get(`/api/student/orders`);
        const orders = data?.orders || [];

        console.log("📦 Orders:", orders);
        debug.push(`Found ${orders.length} orders`);

        if (orders.length === 0) {
          setDebugInfo(["No orders found"]);
          setLoading(false);
          return;
        }

        // Extract courses and fetch product details
        const allCourses = [];

        for (const order of orders) {
          for (const course of order.courseDetails || []) {
            let productSlug = course.slug || "";
            const productId =
              course.courseId || course.productId || course.originalId;

            console.log(`Processing course: ${course.name}`, {
              courseSlug: course.slug,
              productId: productId,
            });

            // If no slug in order, try fetching from product
            if ((!productSlug || productSlug.trim() === "") && productId) {
              try {
                console.log(`Fetching product details for ID: ${productId}`);
                const productResponse = await axios.get(
                  `/api/products/${productId}`
                );
                const product =
                  productResponse.data?.product || productResponse.data;

                if (product && product.slug) {
                  productSlug = product.slug;
                  console.log(`✅ Got slug from product: "${productSlug}"`);
                } else {
                  console.log(`⚠️ Product found but no slug`);
                }
              } catch (err) {
                console.log(
                  `⚠️ Could not fetch product ${productId}:`,
                  err.message
                );
              }
            }

            allCourses.push({
              name: course.name || "Unknown",
              slug: productSlug,
              hasSlug: productSlug && productSlug.trim() !== "",
              code: course.sapExamCode || "N/A",
              purchaseDate: order.purchaseDate,
              category: course.category || "",
              sku: course.sku || "",
              productId: productId,
            });
          }
        }

        console.log("📚 Extracted Courses:", allCourses);
        debug.push(`Extracted ${allCourses.length} courses`);

        // Separate courses with and without slugs
        const withSlugs = allCourses.filter((c) => c.hasSlug);
        const withoutSlugs = allCourses.filter((c) => !c.hasSlug);

        setCoursesWithoutSlugs(withoutSlugs);
        debug.push(`⚠️ ${withoutSlugs.length} courses missing slugs`);

        // Step 2: Fetch ALL available exams
        console.log("🔄 Step 2: Fetching all available exams...");
        let availableExams = [];
        let examSlugs = [];

        try {
          const examsResponse = await axios.get("/api/exams");
          availableExams =
            examsResponse.data?.data || examsResponse.data?.exams || [];
          console.log("📋 Available Exams in DB:", availableExams);

          examSlugs = availableExams.map((e) => ({
            slug: e.slug || "no-slug",
            title: e.title || e.name || "Untitled",
            id: e._id,
            code: e.code || e.sapExamCode || "",
            productId: e.productId,
          }));

          setAllExamSlugs(examSlugs);
          debug.push(`Found ${availableExams.length} exams in database`);

          if (availableExams.length === 0) {
            debug.push(
              "⚠️ WARNING: No exams found in database! Please add exams first."
            );
          }
        } catch (err) {
          console.error("Error fetching all exams:", err);
          debug.push(`Error fetching exams: ${err.message}`);
          examSlugs = [];
        }

        // Step 3: Match courses with exams using productId or slug
        const coursesWithExams = [];
        const coursesWithoutExams = [];

        if (availableExams.length === 0) {
          coursesWithoutExams.push(
            ...withSlugs.map((course) => ({
              ...course,
              status: "No exams in database",
              suggestion: "Please add exams to the database first",
            }))
          );
        } else {
          for (const course of withSlugs) {
            let matchedExam = null;

            // PRIORITY 1: Match by productId (most reliable)
            if (course.productId) {
              matchedExam = availableExams.find(
                (exam) =>
                  exam.productId &&
                  exam.productId.toString() === course.productId.toString()
              );
              if (matchedExam) {
                console.log(
                  `✅ MATCH by productId: "${course.name}" → Exam: "${matchedExam.name}" (${matchedExam._id})`
                );
              }
            }

            // PRIORITY 2: Match by exact slug
            if (!matchedExam && course.slug) {
              matchedExam = availableExams.find(
                (exam) =>
                  exam.slug &&
                  exam.slug.toLowerCase() === course.slug.toLowerCase()
              );
              if (matchedExam) {
                console.log(
                  `✅ MATCH by slug: "${course.slug}" → Exam: "${matchedExam.name}" (${matchedExam._id})`
                );
              }
            }

            // PRIORITY 3: Match by partial slug
            if (!matchedExam && course.slug) {
              matchedExam = availableExams.find(
                (exam) =>
                  exam.slug &&
                  (exam.slug
                    .toLowerCase()
                    .includes(course.slug.toLowerCase()) ||
                    course.slug.toLowerCase().includes(exam.slug.toLowerCase()))
              );
              if (matchedExam) {
                console.log(
                  `✅ MATCH by partial slug: "${course.slug}" → Exam: "${matchedExam.name}" (${matchedExam._id})`
                );
              }
            }

            // PRIORITY 4: Match by exam code
            if (!matchedExam && course.code !== "N/A") {
              matchedExam = availableExams.find(
                (exam) =>
                  (exam.code || exam.sapExamCode) &&
                  (exam.code?.toLowerCase() === course.code.toLowerCase() ||
                    exam.sapExamCode?.toLowerCase() ===
                      course.code.toLowerCase())
              );
              if (matchedExam) {
                console.log(
                  `✅ MATCH by code: "${course.code}" → Exam: "${matchedExam.name}" (${matchedExam._id})`
                );
              }
            }

            if (matchedExam) {
              coursesWithExams.push({
                ...course,
                examId: matchedExam._id,
                examTitle: matchedExam.name || matchedExam.title,
                examSlug: matchedExam.slug,
                totalQuestions:
                  matchedExam.numberOfQuestions ||
                  matchedExam.questions?.length ||
                  0,
              });
            } else {
              console.log(
                `❌ NO MATCH for "${course.name}" (slug: "${course.slug}", productId: ${course.productId})`
              );
              coursesWithoutExams.push({
                ...course,
                status: "No exam found",
                suggestion:
                  "Check if exam exists with matching productId or slug",
              });
            }
          }
        }

        console.log("\n========== FINAL RESULTS ==========");
        console.log(`✅ Courses WITH exams: ${coursesWithExams.length}`);
        console.log(coursesWithExams);
        console.log(`❌ Courses WITHOUT exams: ${coursesWithoutExams.length}`);
        console.log(coursesWithoutExams);
        console.log(`⚠️ Courses WITHOUT slugs: ${withoutSlugs.length}`);
        console.log(withoutSlugs);
        console.log("===================================\n");

        setDebugInfo([
          ...debug,
          `✅ ${coursesWithExams.length} courses matched with exams`,
          `❌ ${coursesWithoutExams.length} courses have no matching exam`,
          `⚠️ ${withoutSlugs.length} courses missing slugs (can't be matched)`,
          {
            coursesWithExams,
            coursesWithoutExams,
            coursesWithoutSlugs: withoutSlugs,
            availableExamSlugs: examSlugs,
          },
        ]);

        setExamCourses(coursesWithExams);
      } catch (err) {
        console.error("💥 Error:", err);
        debug.push(`Error: ${err.message}`);
        setDebugInfo(debug);
      } finally {
        setLoading(false);
      }
    };

    fetchExamCourses();
  }, []);

  const handleStartExam = (examId) => {
    if (examId) {
      router.push(`/student/courses-exam/instructions/${examId}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-6">
      {/* Debug Panel */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-3 text-lg">
          🐛 Debug Info
        </h3>

        {/* Courses Missing Slugs Warning */}
        {coursesWithoutSlugs.length > 0 && (
          <div className="mb-4 bg-red-50 border-2 border-red-300 p-3 rounded">
            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              ⚠️ ACTION REQUIRED: {coursesWithoutSlugs.length} Products Missing
              Slugs
            </h4>
            <p className="text-sm text-red-700 mb-3">
              These products cannot be matched with exams because they don't
              have slugs. Please add slugs to these products in your admin
              panel:
            </p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {coursesWithoutSlugs.map((course, i) => (
                <div
                  key={i}
                  className="bg-white p-2 rounded border border-red-200 text-sm"
                >
                  <div className="font-semibold text-gray-800">
                    {course.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Product ID: {course.productId || "N/A"} | Code:{" "}
                    {course.code} | Category: {course.category || "N/A"}
                  </div>
                  <div className="text-xs text-red-600 mt-1 font-medium">
                    → Add slug to product with ID: {course.productId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Exams Warning */}
        {allExamSlugs.length === 0 && (
          <div className="mb-4 bg-orange-50 border-2 border-orange-300 p-3 rounded">
            <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              ⚠️ CRITICAL: No Exams Found in Database
            </h4>
            <p className="text-sm text-orange-700 mb-2">
              There are no exams in your database. You need to add exams before
              students can take them.
            </p>
            <p className="text-xs text-orange-600">
              Go to your admin panel → Exams → Create New Exam (make sure to set
              productId or slug)
            </p>
          </div>
        )}

        {/* Available Exam Slugs */}
        {allExamSlugs.length > 0 && (
          <div className="mb-4 bg-white p-3 rounded border border-yellow-200">
            <h4 className="font-semibold text-sm text-yellow-900 mb-2">
              📋 Available Exams in Database ({allExamSlugs.length}):
            </h4>
            <div className="text-xs text-gray-700 space-y-1 max-h-40 overflow-y-auto">
              {allExamSlugs.map((exam, i) => (
                <div key={i} className="border-b border-gray-200 pb-1">
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {exam.slug || "no-slug"}
                  </span>
                  <span className="text-gray-500 ml-2 text-xs">
                    → {exam.title}
                  </span>
                  {exam.productId && (
                    <span className="text-blue-600 ml-2 text-xs">
                      (ProductID: {exam.productId})
                    </span>
                  )}
                  {exam.code && (
                    <span className="text-green-600 ml-2 text-xs">
                      [Code: {exam.code}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Messages */}
        <div className="text-xs text-yellow-900 space-y-1 font-mono max-h-60 overflow-y-auto bg-white p-3 rounded border border-yellow-200">
          {debugInfo.map((info, i) => (
            <div key={i} className="border-b border-gray-100 pb-1">
              {typeof info === "string" ? (
                <span>{info}</span>
              ) : (
                <details className="cursor-pointer">
                  <summary className="font-semibold text-yellow-800">
                    View Detailed Breakdown
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(info, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">My Exam Courses</h1>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        ) : examCourses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">
              No Exam Courses Available
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {allExamSlugs.length === 0
                ? "No exams found in database. Please add exams first."
                : coursesWithoutSlugs.length > 0
                ? `${coursesWithoutSlugs.length} of your purchased courses need slugs added to products`
                : "The courses you purchased don't have matching exams yet"}
            </p>
            <p className="text-xs text-gray-500">
              Check the debug panel above for more details
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {examCourses.map((course, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center justify-between border border-gray-200 p-5 rounded-lg shadow-sm hover:shadow-md transition bg-gradient-to-r from-green-50 to-white"
              >
                <div className="flex flex-col space-y-1 flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-blue-700 font-semibold text-lg">
                      {course.name}
                    </h3>
                    {course.totalQuestions > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-2">
                        ✅ {course.totalQuestions} Questions
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span>
                      📅{" "}
                      {new Date(course.purchaseDate).toLocaleDateString(
                        "en-GB"
                      )}
                    </span>
                    <span className="font-medium text-blue-600">
                      📝 {course.code}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">
                      Product: {course.slug}
                    </span>
                    <span className="text-xs bg-blue-50 px-2 py-0.5 rounded font-mono">
                      Exam: {course.examSlug}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartExam(course.examId)}
                  className="bg-green-500 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition font-medium text-sm mt-4 lg:mt-0 lg:ml-4 flex items-center justify-center shadow-sm"
                >
                  ▶️ Start Exam
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCoursesPage;
