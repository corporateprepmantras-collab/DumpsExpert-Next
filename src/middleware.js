// ============================================
// FILE: /middleware.js (COMBINED WITH REDIRECTS - FIXED)
// ============================================

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log("[MIDDLEWARE] Processing:", pathname);

  // ========================================
  // 1. SKIP STATIC FILES & SPECIAL PATHS FIRST
  // ========================================
  const alwaysSkip = [
    "/_next/",
    "/static/",
    "/favicon.ico",
    "/api/redirects", // Skip redirect API itself
    "/api/auth", // Skip NextAuth to avoid state/cookie issues
  ];

  const shouldSkip = alwaysSkip.some((path) => pathname.startsWith(path));
  if (shouldSkip) {
    return NextResponse.next();
  }

  // ========================================
  // 2. URL REDIRECT CHECK (EARLY - Before Everything)
  // ========================================
  // Only skip redirect check for admin/dashboard/auth routes
  const skipRedirectRoutes = [
    "/admin",
    "/dashboard",
    "/auth",
    "/api/",
    "/maintenance",
    "/unauthorized",
  ];
  const shouldCheckRedirect = !skipRedirectRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (shouldCheckRedirect) {
    try {
      console.log("[REDIRECT] Checking path:", pathname);

      const baseUrl = request.nextUrl.origin;
      const redirectCheckUrl = `${baseUrl}/api/redirects/check?path=${encodeURIComponent(
        pathname,
      )}`;

      const redirectRes = await fetch(redirectCheckUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (redirectRes.ok) {
        const redirectData = await redirectRes.json();

        // Check if redirect exists
        if (redirectData.redirect && redirectData.toUrl) {
          const toUrl = redirectData.toUrl;
          console.log("[REDIRECT] ✅ Redirecting:", pathname, "→", toUrl);

          // Handle external vs internal redirects
          if (toUrl.startsWith("http://") || toUrl.startsWith("https://")) {
            // External redirect
            return NextResponse.redirect(toUrl, 301);
          } else {
            // Internal redirect
            return NextResponse.redirect(new URL(toUrl, request.url), 301);
          }
        }
      }
    } catch (err) {
      console.error("[REDIRECT] Check error:", err);
      // Continue if redirect check fails - don't block the request
    }
  }

  // ========================================
  // 3. MAINTENANCE MODE CHECK
  // ========================================
  const maintenanceExcluded = ["/admin", "/dashboard", "/api", "/maintenance"];
  const isMaintenanceExcluded = maintenanceExcluded.some((p) =>
    pathname.startsWith(p),
  );

  if (!isMaintenanceExcluded) {
    try {
      const maintenanceRes = await fetch(
        new URL("/api/maintenance-page", request.url),
        { cache: "no-store" },
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
  // 4. PUBLIC ROUTES (No Auth Required)
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
    "/api/auth", // Let NextAuth run without middleware side effects
    "/api/redirects",
    "/_next",
    "/favicon.ico",
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute) {
    console.log("[MIDDLEWARE] ✅ Public route, allowing access");
    return NextResponse.next();
  }

  // ========================================
  // 5. AUTH CHECK FOR PROTECTED ROUTES
  // ========================================
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
