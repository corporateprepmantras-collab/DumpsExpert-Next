import { NextResponse } from "next/server";

export async function GET(request) {
  const country =
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-vercel-ip-country") ||
    "US";

  const currency = country === "IN" ? "INR" : "USD";

  return NextResponse.json({ country, currency });
}
