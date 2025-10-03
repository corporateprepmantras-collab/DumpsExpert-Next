// middleware.js
import { NextResponse } from "next/server";

export async function middleware(req) {
  try {
    // ✅ resolve API endpoint relative to current URL
    const res = await fetch(new URL("/api/maintenance-page", req.url), {
      cache: "no-store",
    });

    if (!res.ok) return NextResponse.next();

    const data = await res.json();
    const isMaintenance = data?.maintenanceMode; // ✅ correct key

    // ❌ exclude admin, dashboard, api, maintenance
    const excludedPaths = ["/admin", "/dashboard", "/api", "/maintenance"];
    const pathname = req.nextUrl.pathname;

    const isExcluded = excludedPaths.some((p) => pathname.startsWith(p));

    if (isMaintenance && !isExcluded) {
      return NextResponse.rewrite(new URL("/maintenance", req.url));
    }
  } catch (err) {
    console.error("Middleware error:", err);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
