#!/usr/bin/env node
/**
 * Production Cache Clear Script
 * Usage: node clear-production-cache.js [path]
 * Example: node clear-production-cache.js /blogs
 */

const PRODUCTION_URL = "https://www.prepmantras.com";
const SECRET = "prepmantras_cache_secret_2026_secure_key";

async function clearProductionCache(path = "/") {
  try {
    console.log(`\n🌐 Clearing PRODUCTION cache...`);
    console.log(`   URL: ${PRODUCTION_URL}`);
    console.log(`   Path: ${path}\n`);

    const response = await fetch(`${PRODUCTION_URL}/api/revalidate`, {
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
      console.log(`✅ Production cache cleared successfully!`);
      console.log(`   Message: ${data.message}`);
      console.log(`   Time: ${data.timestamp}`);
      console.log(`\n🎉 Your changes should now be visible on the live site!`);
      console.log(`   Visit: ${PRODUCTION_URL}${path}\n`);
    } else {
      console.error(`❌ Failed to clear cache: ${data.message}`);
      console.error(`   Status: ${response.status}`);

      if (response.status === 401) {
        console.error(`\n⚠️  Authentication failed. Check:`);
        console.error(`   1. REVALIDATE_SECRET is set in Vercel`);
        console.error(
          `   2. Secret matches: "prepmantras_cache_secret_2026_secure_key"`,
        );
      }
    }
  } catch (error) {
    console.error(`❌ Error clearing cache: ${error.message}`);
    console.error(`\n⚠️  Possible issues:`);
    console.error(`   1. Production site is down`);
    console.error(`   2. /api/revalidate endpoint not deployed`);
    console.error(`   3. Network connectivity issue`);
  }
}

// Get path from command line argument
const path = process.argv[2] || "/";

console.log("🚀 Prepmantras Production Cache Clearer");
console.log("=".repeat(50));
clearProductionCache(path);
