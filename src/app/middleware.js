// ============================================
// FILE: /middleware.js (COMBINED & FIXED)
// ============================================

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log("[MIDDLEWARE] Processing:", pathname);

  // ========================================
  // 1. MAINTENANCE MODE CHECK (First Priority)
  // ========================================
  const maintenanceExcluded = ["/admin", "/dashboard", "/api", "/maintenance"];
  const isMaintenanceExcluded = maintenanceExcluded.some(p => pathname.startsWith(p));

  if (!isMaintenanceExcluded) {
    try {
      const maintenanceRes = await fetch(
        new URL("/api/maintenance-page", request.url),
        { cache: "no-store" }
      );

      if (maintenanceRes.ok) {
        const data = await maintenanceRes.json();
        if (data?.maintenanceMode) {
          console.log("[MIDDLEWARE] Maintenance mode active, redirecting");
          return NextResponse.rewrite(new URL("/maintenance", request.url));
        }
      }
    } catch (err) {
      console.error("[MIDDLEWARE] Maintenance check error:", err);
      // Continue if maintenance check fails
    }
  }

  // ========================================
  // 2. PUBLIC ROUTES (No Auth Required)
  // ========================================
  const publicRoutes = [
    "/auth",
    "/",
    "/maintenance",
    "/unauthorized",
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
    "/_next",
    "/favicon.ico",
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    console.log("[MIDDLEWARE] ✅ Public route, allowing access");
    return NextResponse.next();
  }

  // ========================================
  // 3. AUTH CHECK FOR PROTECTED ROUTES
  // ========================================
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  console.log("[MIDDLEWARE] Token:", token ? "Present" : "Missing");

  // Protected routes require authentication
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      console.log("[MIDDLEWARE] ❌ No token, redirecting to signin");
      const url = new URL("/auth/signin", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Role-based access control
    const role = token.role || "guest";
    const subscription = token.subscription || "no";

    console.log("[MIDDLEWARE] Role:", role, "Subscription:", subscription);

    // Determine target dashboard
    let targetDashboard = "/dashboard/guest";
    if (role === "admin") {
      targetDashboard = "/dashboard/admin";
    } else if (role === "student" && subscription === "yes") {
      targetDashboard = "/dashboard/student";
    }

    // Redirect generic /dashboard to specific dashboard
    if (pathname === "/dashboard") {
      console.log("[MIDDLEWARE] Redirecting to:", targetDashboard);
      return NextResponse.redirect(new URL(targetDashboard, request.url));
    }

    // Restrict access based on role
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      console.log("[MIDDLEWARE] ❌ Admin access denied");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (
      pathname.startsWith("/dashboard/student") &&
      (role !== "student" || subscription !== "yes")
    ) {
      console.log("[MIDDLEWARE] ❌ Student access denied");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (pathname.startsWith("/dashboard/guest") && role !== "guest") {
      console.log("[MIDDLEWARE] ❌ Guest access denied");
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  console.log("[MIDDLEWARE] ✅ Allowing request");
  return NextResponse.next();
}

export const config = {
  // Match all routes except static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};