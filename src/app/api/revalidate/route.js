// ============================================
// On-Demand Revalidation API for Instant Cache Clearing
// ============================================
// Usage: POST https://www.prepmantras.com/api/revalidate
// Body: { "secret": "your-secret-key", "path": "/" }

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { secret, path, tag } = body;

    // Validate secret key
    const REVALIDATE_SECRET =
      process.env.REVALIDATE_SECRET ||
      "prepmantras_cache_secret_2026_secure_key";

    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    // Revalidate by path
    if (path) {
      revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);
      return NextResponse.json({
        revalidated: true,
        message: `Path ${path} revalidated successfully`,
        timestamp: new Date().toISOString(),
      });
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
      console.log(`✅ Revalidated tag: ${tag}`);
      return NextResponse.json({
        revalidated: true,
        message: `Tag ${tag} revalidated successfully`,
        timestamp: new Date().toISOString(),
      });
    }

    // If no path or tag provided, revalidate homepage
    revalidatePath("/");
    console.log("✅ Revalidated homepage");
    return NextResponse.json({
      revalidated: true,
      message: "Homepage revalidated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Revalidation error:", error);
    return NextResponse.json(
      { message: "Error revalidating", error: error.message },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  return NextResponse.json({
    message: "Revalidation API - Use POST method",
    usage: {
      method: "POST",
      endpoint: "/api/revalidate",
      body: {
        secret: "your-secret-key",
        path: "/",
        tag: "optional-tag",
      },
      examples: [
        { path: "/", description: "Revalidate homepage" },
        { path: "/blogs", description: "Revalidate blogs page" },
        { tag: "blogs", description: "Revalidate all blog pages" },
      ],
    },
  });
}
