#!/usr/bin/env node
/**
 * Instant Cache Clear Script
 * Run: node clear-cache.js
 * Or: npm run clear-cache
 */

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const SECRET =
  process.env.REVALIDATE_SECRET || "prepmantras_cache_secret_2026_secure_key";

async function clearCache(path = "/") {
  try {
    console.log(`🔄 Clearing cache for: ${path}...`);

    const response = await fetch(`${SITE_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: SECRET,
        path: path,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Cache cleared successfully!`);
      console.log(`   Message: ${data.message}`);
      console.log(`   Time: ${data.timestamp}`);
    } else {
      console.error(`❌ Failed to clear cache: ${data.message}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

// Get path from command line argument
const path = process.argv[2] || "/";

console.log("🚀 Prepmantras Cache Clearer");
console.log("=".repeat(50));
clearCache(path);
