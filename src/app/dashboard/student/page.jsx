// app/dashboard/student/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { redirect } from "next/navigation";
import StudentDashboardClient from "@/components/StudentDashboardClient";

export const revalidate = 300;

async function getDashboardData(session) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const studentId = session?.user?.id || session?.user?._id;

    if (!studentId) {
      throw new Error("Student ID not found in session");
    }

    // Fetch orders and results in parallel
    const [ordersRes, resultsRes, userRes] = await Promise.all([
      fetch(`${BASE_URL}/api/student/orders`, {
        headers: { Cookie: `next-auth.session-token=${session.sessionToken}` },
        next: { revalidate: 300 },
        cache: "force-cache",
      }),
      fetch(`${BASE_URL}/api/results?studentId=${studentId}`, {
        headers: { Cookie: `next-auth.session-token=${session.sessionToken}` },
        next: { revalidate: 300 },
        cache: "force-cache",
      }),
      fetch(`${BASE_URL}/api/user/me`, {
        headers: { Cookie: `next-auth.session-token=${session.sessionToken}` },
        next: { revalidate: 300 },
        cache: "force-cache",
      }),
    ]);

    // Parse responses
    const ordersResponse = await ordersRes.json();
    const resultsResponse = await resultsRes.json();
    const userData = userRes.ok ? await userRes.json() : null;

    // Extract orders array (handle multiple formats)
    let ordersArray = [];
    if (Array.isArray(ordersResponse)) {
      ordersArray = ordersResponse;
    } else if (ordersResponse?.orders) {
      ordersArray = ordersResponse.orders;
    } else if (ordersResponse?.data) {
      ordersArray = ordersResponse.data;
    }

    // Extract results array
    const resultsArray = resultsResponse?.data || resultsResponse || [];

    // Calculate order statistics
    const completedOrders = ordersArray.filter((o) => o.status === "completed");
    const pendingOrders = ordersArray.filter(
      (o) => o.status === "pending" || o.status === "processing"
    );

    // Count products by type
    let totalPDFs = 0;
    let totalOnlineExams = 0;
    let totalCombos = 0;

    completedOrders.forEach((order) => {
      if (order.courseDetails && Array.isArray(order.courseDetails)) {
        order.courseDetails.forEach((course) => {
          if (course.type === "regular") totalPDFs++;
          else if (course.type === "online") totalOnlineExams++;
          else if (course.type === "combo") totalCombos++;
        });
      }
    });

    // Process results
    const processedResults =
      resultsArray.length > 0
        ? {
            attempts: resultsArray.map((result) => ({
              id: result._id,
              examName:
                result.examId?.title || result.examCode || "Unknown Exam",
              score: result.percentage || 0,
              correctAnswers: result.correct || 0,
              totalQuestions: result.totalQuestions || 0,
              timeTaken: result.duration || 0,
              date: result.completedAt || result.createdAt,
              passed: result.percentage >= 50,
              attempt: result.attempt || 1,
            })),
            totalAttempts: resultsArray.length,
            averageScore: Math.round(
              resultsArray.reduce((sum, r) => sum + (r.percentage || 0), 0) /
                resultsArray.length
            ),
            highestScore: Math.max(
              ...resultsArray.map((r) => r.percentage || 0),
              0
            ),
            lowestScore: Math.min(
              ...resultsArray
                .map((r) => r.percentage || 0)
                .filter((p) => p > 0),
              100
            ),
          }
        : {
            attempts: [],
            totalAttempts: 0,
            averageScore: 0,
            highestScore: 0,
            lowestScore: 0,
          };

    return {
      user: userData || {
        name: session?.user?.name || "Student User",
        email: session?.user?.email || "student@example.com",
        profileImage: session?.user?.image || "https://via.placeholder.com/120",
      },
      stats: {
        completed: completedOrders.length,
        pending: pendingOrders.length,
        totalOrders: ordersArray.length,
      },
      exams: {
        upcoming: totalOnlineExams,
        total: totalOnlineExams + totalCombos,
        available: totalOnlineExams,
      },
      courses: {
        totalPDFs,
        totalOnlineExams,
        totalCombos,
        active: totalPDFs + totalOnlineExams + totalCombos,
        total: totalPDFs + totalOnlineExams + totalCombos,
      },
      results: processedResults,
    };
  } catch (error) {
    console.error("❌ Dashboard error:", error);
    return {
      user: {
        name: session?.user?.name || "Student User",
        email: session?.user?.email || "student@example.com",
        profileImage: "https://via.placeholder.com/120",
      },
      stats: { completed: 0, pending: 0, totalOrders: 0 },
      exams: { upcoming: 0, total: 0, available: 0 },
      courses: {
        totalPDFs: 0,
        totalOnlineExams: 0,
        totalCombos: 0,
        active: 0,
        total: 0,
      },
      results: {
        attempts: [],
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      },
    };
  }
}

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const dashboardData = await getDashboardData(session);

  return <StudentDashboardClient {...dashboardData} />;
}

export async function generateMetadata() {
  return {
    title: "Student Dashboard | Prepmantras",
    description:
      "Access your exam preparation materials and track your progress",
  };
}
