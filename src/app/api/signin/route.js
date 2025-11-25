// ============================================
// FILE: /app/api/auth/signin/route.js (SECURE VERSION)
// ============================================

import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongo";
import UserInfo from "@/models/userInfoSchema";

// ========================================
// IN-MEMORY RATE LIMITING
// (Use Redis in production: @upstash/redis)
// ========================================
const loginAttempts = new Map();
const blockedIPs = new Map();

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes

// Clean up old entries every minute
setInterval(() => {
  const now = Date.now();

  // Clean login attempts
  for (const [key, data] of loginAttempts.entries()) {
    if (now - data.firstAttempt > ATTEMPT_WINDOW) {
      loginAttempts.delete(key);
    }
  }

  // Clean blocked IPs
  for (const [ip, blockTime] of blockedIPs.entries()) {
    if (now - blockTime > BLOCK_DURATION) {
      blockedIPs.delete(ip);
    }
  }
}, 60000);

// ========================================
// HELPER FUNCTIONS
// ========================================

function getClientIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getUserAgent(request) {
  return request.headers.get("user-agent") || "unknown";
}

function checkRateLimit(identifier) {
  const now = Date.now();

  // Check if identifier is blocked
  if (blockedIPs.has(identifier)) {
    const blockTime = blockedIPs.get(identifier);
    if (now - blockTime < BLOCK_DURATION) {
      const remainingTime = Math.ceil(
        (BLOCK_DURATION - (now - blockTime)) / 1000 / 60
      );
      return {
        allowed: false,
        remainingTime,
        message: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
      };
    }
    // Block expired, remove it
    blockedIPs.delete(identifier);
  }

  const attempts = loginAttempts.get(identifier);

  if (!attempts) {
    // First attempt
    loginAttempts.set(identifier, {
      count: 1,
      firstAttempt: now,
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Check if window expired
  if (now - attempts.firstAttempt > ATTEMPT_WINDOW) {
    // Reset window
    loginAttempts.set(identifier, {
      count: 1,
      firstAttempt: now,
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Check if max attempts reached
  if (attempts.count >= MAX_ATTEMPTS) {
    blockedIPs.set(identifier, now);
    loginAttempts.delete(identifier);
    return {
      allowed: false,
      remainingTime: Math.ceil(BLOCK_DURATION / 1000 / 60),
      message: `Too many failed attempts. Try again in ${Math.ceil(
        BLOCK_DURATION / 1000 / 60
      )} minutes.`,
    };
  }

  // Increment attempts
  attempts.count++;
  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - attempts.count,
  };
}

function recordFailedAttempt(identifier) {
  const attempts = loginAttempts.get(identifier);
  if (attempts) {
    attempts.count++;
    if (attempts.count >= MAX_ATTEMPTS) {
      blockedIPs.set(identifier, Date.now());
      loginAttempts.delete(identifier);
    }
  } else {
    loginAttempts.set(identifier, {
      count: 1,
      firstAttempt: Date.now(),
    });
  }
}

function clearRateLimit(identifier) {
  loginAttempts.delete(identifier);
  blockedIPs.delete(identifier);
}

// ========================================
// POST /api/auth/signin
// ========================================
export async function POST(request) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);

  try {
    // ============= 1. PARSE REQUEST =============
    const { email, password } = await request.json();

    console.log("🔐 [SIGNIN] Attempt:", {
      email: email?.toLowerCase(),
      ip: clientIP,
      userAgent: userAgent.substring(0, 50),
    });

    // ============= 2. INPUT VALIDATION =============
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.warn("⚠️ [SIGNIN] Invalid email format:", email);
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ============= 3. RATE LIMITING (IP) =============
    const ipRateLimit = checkRateLimit(clientIP);
    if (!ipRateLimit.allowed) {
      console.warn("⚠️ [SIGNIN] IP blocked:", {
        ip: clientIP,
        remainingTime: ipRateLimit.remainingTime,
      });
      return NextResponse.json(
        {
          message: ipRateLimit.message,
          blocked: true,
          remainingTime: ipRateLimit.remainingTime,
        },
        { status: 429 }
      );
    }

    // ============= 4. RATE LIMITING (EMAIL) =============
    const emailRateLimit = checkRateLimit(normalizedEmail);
    if (!emailRateLimit.allowed) {
      console.warn("⚠️ [SIGNIN] Email blocked:", {
        email: normalizedEmail,
        remainingTime: emailRateLimit.remainingTime,
      });
      return NextResponse.json(
        {
          message: emailRateLimit.message,
          blocked: true,
          remainingTime: emailRateLimit.remainingTime,
        },
        { status: 429 }
      );
    }

    // ============= 5. DATABASE CONNECTION =============
    await connectMongoDB();

    // ============= 6. CONSTANT-TIME DELAY (Prevent Timing Attacks) =============
    // Add random delay to prevent timing-based email enumeration
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 100)
    );

    // ============= 7. FIND USER =============
    const userInfo = await UserInfo.findOne({
      email: normalizedEmail,
    }).select(
      "+password +role +subscription +isVerified +accountLocked +lockUntil +failedLoginAttempts"
    );

    // ============= 8. USER NOT FOUND (Constant-time response) =============
    if (!userInfo) {
      recordFailedAttempt(clientIP);
      recordFailedAttempt(normalizedEmail);

      console.warn("❌ [SIGNIN] User not found:", normalizedEmail);

      // Add delay to match successful login timing
      await new Promise((resolve) =>
        setTimeout(resolve, 100 + Math.random() * 100)
      );

      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ============= 9. CHECK EMAIL VERIFICATION =============
    if (!userInfo.isVerified) {
      recordFailedAttempt(clientIP);
      console.warn("⚠️ [SIGNIN] Unverified account:", normalizedEmail);

      return NextResponse.json(
        {
          message: "Please verify your email before signing in",
          needsVerification: true,
        },
        { status: 403 }
      );
    }

    // ============= 10. CHECK ACCOUNT LOCK =============
    if (userInfo.isAccountLocked()) {
      const remainingMinutes = Math.ceil(
        (userInfo.lockUntil - new Date()) / 1000 / 60
      );

      console.warn("⚠️ [SIGNIN] Account locked:", {
        email: normalizedEmail,
        remainingMinutes,
      });

      return NextResponse.json(
        {
          message: `Account temporarily locked due to multiple failed login attempts. Try again in ${remainingMinutes} minutes.`,
          locked: true,
          remainingTime: remainingMinutes,
        },
        { status: 423 }
      );
    }

    // ============= 11. VERIFY PASSWORD =============
    const isPasswordValid = await userInfo.comparePassword(password);

    if (!isPasswordValid) {
      // Increment failed attempts in database
      await userInfo.incrementFailedAttempts();

      // Record in rate limiter
      recordFailedAttempt(clientIP);
      recordFailedAttempt(normalizedEmail);

      console.warn("❌ [SIGNIN] Invalid password:", {
        email: normalizedEmail,
        attempts: userInfo.failedLoginAttempts + 1,
        ip: clientIP,
      });

      // Add delay to match successful login timing
      await new Promise((resolve) =>
        setTimeout(resolve, 100 + Math.random() * 100)
      );

      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ============= 12. SUCCESS - RESET ATTEMPTS =============
    await userInfo.resetFailedAttempts(clientIP, userAgent);

    // Clear rate limits
    clearRateLimit(clientIP);
    clearRateLimit(normalizedEmail);

    const loginDuration = Date.now() - startTime;

    console.log("✅ [SIGNIN] Success:", {
      email: normalizedEmail,
      role: userInfo.role,
      subscription: userInfo.subscription,
      duration: `${loginDuration}ms`,
      ip: clientIP,
    });

    // ============= 13. RETURN SUCCESS RESPONSE =============
    return NextResponse.json(
      {
        message: "Sign-in successful",
        user: {
          id: userInfo.authUserId?.toString() || userInfo._id.toString(),
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role,
          subscription: userInfo.subscription,
          profileImage: userInfo.profileImage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [SIGNIN] Error:", {
      error: error.message,
      stack: error.stack,
      ip: clientIP,
    });

    // Don't expose internal errors to client
    return NextResponse.json(
      { message: "An error occurred during sign-in. Please try again." },
      { status: 500 }
    );
  }
}

// ========================================
// GET /api/auth/signin (Health Check)
// ========================================
export async function GET() {
  return NextResponse.json({
    message: "Sign-in endpoint is working",
    rateLimit: {
      maxAttempts: MAX_ATTEMPTS,
      windowMinutes: ATTEMPT_WINDOW / 60000,
      blockDurationMinutes: BLOCK_DURATION / 60000,
    },
  });
}
