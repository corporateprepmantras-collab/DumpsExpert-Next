// app/api/redirects/check/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongo";
import Redirect from "../../../../models/Redirect";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    console.log("[REDIRECT API] Checking path:", path);

    if (!path) {
      return NextResponse.json({ redirect: false }, { status: 200 });
    }

    // Look for exact match first
    let redirect = await Redirect.findOne({
      fromUrl: path,
      active: { $ne: false }, // Only check active redirects
    });

    // If no exact match, try with trailing slash
    if (!redirect && !path.endsWith("/")) {
      redirect = await Redirect.findOne({
        fromUrl: path + "/",
        active: { $ne: false },
      });
    }

    // Try without trailing slash
    if (!redirect && path.endsWith("/") && path.length > 1) {
      redirect = await Redirect.findOne({
        fromUrl: path.slice(0, -1),
        active: { $ne: false },
      });
    }

    if (redirect) {
      console.log(
        "[REDIRECT API] ✅ Found redirect:",
        redirect.fromUrl,
        "→",
        redirect.toUrl
      );

      // Increment hit counter asynchronously (don't wait)
      Redirect.findByIdAndUpdate(redirect._id, {
        $inc: { hits: 1 },
      }).catch((err) => console.error("Hit counter error:", err));

      return NextResponse.json({
        redirect: true,
        toUrl: redirect.toUrl,
        fromUrl: redirect.fromUrl,
      });
    }

    console.log("[REDIRECT API] ❌ No redirect found for:", path);
    return NextResponse.json({ redirect: false });
  } catch (err) {
    console.error("[REDIRECT API] Error:", err);
    return NextResponse.json(
      { redirect: false, error: err.message },
      { status: 500 }
    );
  }
}
