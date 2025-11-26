// ============================================
// FILE: /middleware.js (FIXED FOR OAUTH DASHBOARD ROUTING)
// ============================================

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown";

  console.log("[MIDDLEWARE] 🛡️ Processing:", {
    path: pathname,
    ip: clientIP,
    method: request.method,
    host: request.headers.get("host"),
  });

  // ========================================
  // 1. MAINTENANCE MODE CHECK (First Priority)
  // ========================================
  const maintenanceExcluded = [
    "/admin",
    "/dashboard/admin",
    "/api",
    "/maintenance",
    "/_next",
  ];

  const isMaintenanceExcluded = maintenanceExcluded.some((p) =>
    pathname.startsWith(p)
  );

  if (!isMaintenanceExcluded) {
    try {
      const maintenanceRes = await fetch(
        new URL("/api/maintenance-page", request.url),
        { cache: "no-store" }
      );

      if (maintenanceRes.ok) {
        const data = await maintenanceRes.json();
        if (data?.maintenanceMode) {
          console.log("[MIDDLEWARE] 🚧 Maintenance mode active, redirecting");
          return NextResponse.rewrite(new URL("/maintenance", request.url));
        }
      }
    } catch (err) {
      console.error("[MIDDLEWARE] ❌ Maintenance check error:", err);
    }
  }

  // ========================================
  // 2. PUBLIC ROUTES (No Auth Required)
  // ========================================
  const publicRoutes = [
    "/auth/signin",
    "/auth/signup",
    "/auth/verify-email",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/maintenance",
    "/unauthorized",
    "/api/auth", // NextAuth routes - IMPORTANT for OAuth
    "/api/seo",
    "/api/products",
    "/api/blogs",
    "/api/trending",
    "/api/announcement",
    "/api/general-faqs",
    "/api/content1",
    "/api/content2",
    "/api/dumps",
    "/api/categories",
    "/api/faqs",
    "/api/maintenance-page",
    "/api/coupons/validate",
    "/api/payments/razorpay/create-order",
    "/api/payments/razorpay/verify",
    "/api/payments/paypal/create-order",
    "/api/payments/paypal/verify",
    "/_next",
    "/favicon.ico",
    "/images",
    "/fonts",
  ];

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ⚠️ SPECIAL CASE: Homepage "/" is public, but only if it's EXACTLY "/"
  const isHomepage = pathname === "/" || pathname === "";

  if (isPublicRoute || isHomepage) {
    console.log("[MIDDLEWARE] ✅ Public route, allowing access");
    return NextResponse.next();
  }

  // ========================================
  // 3. AUTH CHECK FOR PROTECTED ROUTES
  // ========================================
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log("[MIDDLEWARE] 🔐 Token Debug:", {
    hasToken: !!token,
    email: token?.email || "N/A",
    role: token?.role || "N/A",
    subscription: token?.subscription || "N/A",
    name: token?.name || "N/A",
  });

  // ========================================
  // 4. PROTECTED DASHBOARD ROUTES
  // ========================================
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      console.log("[MIDDLEWARE] ❌ No token, redirecting to signin");
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Extract role and subscription with fallback defaults
    const role = token.role || "guest";
    const subscription = token.subscription || "no";

    console.log("[MIDDLEWARE] 👤 User info:", {
      role,
      subscription,
      email: token.email,
    });

    // Determine target dashboard based on role
    let targetDashboard = "/dashboard/guest";
    if (role === "admin") {
      targetDashboard = "/dashboard/admin";
    } else if (role === "student" && subscription === "yes") {
      targetDashboard = "/dashboard/student";
    }

    console.log("[MIDDLEWARE] 🎯 Target dashboard:", targetDashboard);

    // Redirect generic /dashboard to specific dashboard
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      console.log(
        "[MIDDLEWARE] 🔄 Redirecting /dashboard to:",
        targetDashboard
      );
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // ========================================
    // 5. ROLE-BASED ACCESS CONTROL (CRITICAL)
    // ========================================

    // ADMIN DASHBOARD - Only admins allowed
    if (pathname.startsWith("/dashboard/admin")) {
      if (role !== "admin") {
        console.warn("[MIDDLEWARE] ⚠️ UNAUTHORIZED ADMIN ACCESS ATTEMPT:", {
          path: pathname,
          email: token.email,
          role: role,
          ip: clientIP,
        });
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      console.log("[MIDDLEWARE] ✅ Admin access granted");
    }

    // STUDENT DASHBOARD - Only students with subscription
    if (pathname.startsWith("/dashboard/student")) {
      if (role !== "student" || subscription !== "yes") {
        console.warn("[MIDDLEWARE] ⚠️ UNAUTHORIZED STUDENT ACCESS ATTEMPT:", {
          path: pathname,
          email: token.email,
          role: role,
          subscription: subscription,
          ip: clientIP,
        });
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      console.log("[MIDDLEWARE] ✅ Student access granted");
    }

    // GUEST DASHBOARD - Only guests
    if (pathname.startsWith("/dashboard/guest")) {
      // Prevent admin/students from accessing guest dashboard
      if (role === "admin" || (role === "student" && subscription === "yes")) {
        console.log(
          "[MIDDLEWARE] 🔄 Redirecting privileged user from guest to:",
          targetDashboard
        );
        return NextResponse.redirect(new URL(targetDashboard, request.url));
      }
      console.log("[MIDDLEWARE] ✅ Guest access granted");
    }
  }

  // ========================================
  // 6. PROTECTED API ROUTES
  // ========================================

  // Admin API endpoints
  if (pathname.startsWith("/api/admin")) {
    if (!token || token.role !== "admin") {
      console.warn("[MIDDLEWARE] ⚠️ UNAUTHORIZED ADMIN API ACCESS:", {
        path: pathname,
        email: token?.email,
        role: token?.role,
        ip: clientIP,
      });
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
    console.log("[MIDDLEWARE] ✅ Admin API access granted");
  }

  // Student API endpoints
  if (pathname.startsWith("/api/student")) {
    if (!token || token.role !== "student" || token.subscription !== "yes") {
      console.warn("[MIDDLEWARE] ⚠️ UNAUTHORIZED STUDENT API ACCESS:", {
        path: pathname,
        email: token?.email,
        role: token?.role,
        subscription: token?.subscription,
        ip: clientIP,
      });
      return NextResponse.json(
        { error: "Unauthorized: Active subscription required" },
        { status: 403 }
      );
    }
    console.log("[MIDDLEWARE] ✅ Student API access granted");
  }

  // User-specific API endpoints (require authentication)
  if (pathname.startsWith("/api/user") || pathname.startsWith("/api/order")) {
    if (!token) {
      console.warn("[MIDDLEWARE] ⚠️ UNAUTHENTICATED API ACCESS:", {
        path: pathname,
        ip: clientIP,
      });
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    // For /api/order GET (view all orders), require admin
    if (pathname === "/api/order" && request.method === "GET") {
      if (token.role !== "admin") {
        console.warn("[MIDDLEWARE] ⚠️ NON-ADMIN TRYING TO VIEW ALL ORDERS:", {
          email: token.email,
          role: token.role,
          ip: clientIP,
        });
        return NextResponse.json(
          { error: "Forbidden: Admin access required" },
          { status: 403 }
        );
      }
    }

    console.log("[MIDDLEWARE] ✅ User API access granted");
  }

  // ========================================
  // 7. SECURITY HEADERS
  // ========================================
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Log IP for audit (in production, send to logging service)
  if (token) {
    response.headers.set("X-User-Role", token.role || "guest");
  }

  console.log("[MIDDLEWARE] ✅ Request allowed");
  return response;
}

export const config = {
  // Match all routes except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
