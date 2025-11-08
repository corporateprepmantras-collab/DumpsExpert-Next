"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import useCartStore from "@/store/useCartStore";
import cartImg from "../../assets/landingassets/emptycart.webp";
import { useSession, signIn } from "next-auth/react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Cart = () => {
  const { data: session, status, update } = useSession();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");

  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const router = useRouter();

  // IMPROVED: Get actual item price based on currency and TYPE
  const getItemPrice = (item, currency) => {
    const type = item.type || "regular";

    console.log(`🔍 Getting price for ${item.title}:`, {
      type,
      currency,
      allPrices: {
        dumps: { inr: item.dumpsPriceInr, usd: item.dumpsPriceUsd },
        exam: { inr: item.examPriceInr, usd: item.examPriceUsd },
        combo: { inr: item.comboPriceInr, usd: item.comboPriceUsd },
      },
    });

    // Convert to number safely
    const toNum = (val) => {
      if (val === null || val === undefined || val === "") return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    if (currency === "USD") {
      switch (type) {
        case "combo":
          return (
            toNum(item.comboPriceUsd) ||
            toNum(item.priceUSD) ||
            toNum(item.price) ||
            0
          );
        case "online":
          return (
            toNum(item.examPriceUsd) ||
            toNum(item.priceUSD) ||
            toNum(item.price) ||
            0
          );
        case "regular":
        default:
          return (
            toNum(item.dumpsPriceUsd) ||
            toNum(item.priceUSD) ||
            toNum(item.price) ||
            0
          );
      }
    } else {
      // INR
      switch (type) {
        case "combo":
          return (
            toNum(item.comboPriceInr) ||
            toNum(item.priceINR) ||
            toNum(item.price) ||
            0
          );
        case "online":
          return (
            toNum(item.examPriceInr) ||
            toNum(item.priceINR) ||
            toNum(item.price) ||
            0
          );
        case "regular":
        default:
          return (
            toNum(item.dumpsPriceInr) ||
            toNum(item.priceINR) ||
            toNum(item.price) ||
            0
          );
      }
    }
  };

  // Helper to get MRP (original price) based on type
  const getItemMRP = (item, currency) => {
    const type = item.type || "regular";

    const toNum = (val) => {
      if (val === null || val === undefined || val === "") return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    if (currency === "USD") {
      switch (type) {
        case "combo":
          return toNum(item.comboMrpUsd) || 0;
        case "online":
          return toNum(item.examMrpUsd) || 0;
        case "regular":
        default:
          return toNum(item.dumpsMrpUsd) || 0;
      }
    } else {
      switch (type) {
        case "combo":
          return toNum(item.comboMrpInr) || 0;
        case "online":
          return toNum(item.examMrpInr) || 0;
        case "regular":
        default:
          return toNum(item.dumpsMrpInr) || 0;
      }
    }
  };

  // Calculate discount percentage
  const calculateItemDiscount = (item, currency) => {
    const price = getItemPrice(item, currency);
    const mrp = getItemMRP(item, currency);

    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  // Calculate subtotal in selected currency
  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const itemPrice = getItemPrice(item, selectedCurrency);
      console.log(
        `💰 Item: ${item.title} (${item.type}) - Price: ${itemPrice}`
      );
      return acc + itemPrice * (item.quantity || 1);
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Calculate discount based on coupon
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    const isPercentage =
      appliedCoupon.discountType === "percentage" ||
      (appliedCoupon.discountValue > 0 && appliedCoupon.discountValue <= 100);

    if (isPercentage) {
      const discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscount
        ? Math.min(discountAmount, appliedCoupon.maxDiscount)
        : discountAmount;
    } else {
      return appliedCoupon.discountValue;
    }
  };

  const discount = calculateDiscount();
  const grandTotal = Math.max(0, subtotal - discount);

  // Currency symbol helper
  const getCurrencySymbol = (currency) => {
    return currency === "USD" ? "$" : "₹";
  };

  // Format price helper
  const formatPrice = (amount, currency) => {
    const numAmount = Number(amount) || 0;
    return `${getCurrencySymbol(currency)}${numAmount.toFixed(2)}`;
  };

  // Fetch userId from /api/user/me
  useEffect(() => {
    const fetchUserId = async () => {
      if (status === "authenticated") {
        try {
          const response = await axios.get("/api/user/me");
          setUserId(response.data.id);
        } catch (error) {
          console.error("Failed to fetch userId:", error);
          toast.error("Failed to fetch user details. Please try again.");
        }
      }
    };
    fetchUserId();
  }, [status]);

  // Load Razorpay SDK
  useEffect(() => {
    setIsMounted(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Log cart items on mount and when they change
  useEffect(() => {
    if (cartItems.length > 0) {
      console.log("🛒 CART ITEMS:", cartItems);
      console.log("📊 CART SUMMARY:");
      cartItems.forEach((item) => {
        console.log(`  - ${item.title} (${item.type}):`, {
          examPriceInr: item.examPriceInr,
          examPriceUsd: item.examPriceUsd,
          dumpsPriceInr: item.dumpsPriceInr,
          dumpsPriceUsd: item.dumpsPriceUsd,
          comboPriceInr: item.comboPriceInr,
          comboPriceUsd: item.comboPriceUsd,
        });
      });
    }
  }, [cartItems]);

  const handleDelete = (id, type) => {
    removeFromCart(id, type);
    toast.success("Item removed from cart");

    if (cartItems.length === 1) {
      setAppliedCoupon(null);
      setCouponCode("");
    }
  };

  const handleQuantityChange = (id, type, operation) => {
    updateQuantity(id, type, operation);
    toast.success(
      `Quantity ${operation === "inc" ? "increased" : "decreased"}`
    );
  };

  const handleCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const response = await axios.post("/api/coupons/validate", {
        code: couponCode.trim(),
        totalAmount: subtotal,
        currency: selectedCurrency,
      });

      const isValid =
        response.data.success ||
        response.data.message === "Coupon is valid" ||
        response.data.coupon;

      if (isValid && response.data.coupon) {
        const couponData = response.data.coupon;

        const discountValue =
          couponData.discountValue ||
          couponData.discount ||
          response.data.discount ||
          0;

        const discountType =
          couponData.discountType ||
          response.data.discountType ||
          (discountValue > 0 && discountValue <= 100 ? "percentage" : "fixed");

        setAppliedCoupon({
          code: couponCode.trim(),
          discountType: discountType,
          discountValue: discountValue,
          maxDiscount: couponData.maxDiscount || response.data.maxDiscount,
        });
        setCouponError("");

        const actualDiscount =
          discountType === "percentage" ||
          (discountValue > 0 && discountValue <= 100)
            ? (subtotal * discountValue) / 100
            : discountValue;

        toast.success(
          `Coupon applied! You saved ${formatPrice(
            actualDiscount,
            selectedCurrency
          )}`
        );
      } else {
        const errorMsg =
          response.data.error || response.data.message || "Invalid coupon code";
        setCouponError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Coupon validation failed:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to validate coupon";
      setCouponError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.info("Coupon removed");
  };

  // Create order payload helper
  const createOrderPayload = (paymentMethod, paymentId) => {
    return {
      userId,
      items: cartItems.map((item) => {
        const actualPrice = getItemPrice(item, selectedCurrency);

        console.log(`📦 Creating order item for ${item.title}:`, {
          type: item.type,
          actualPrice,
          currency: selectedCurrency,
          examPrices: {
            inr: item.examPriceInr,
            usd: item.examPriceUsd,
          },
        });

        return {
          _id: item._id,
          productId: item.productId || item._id,
          courseId: item._id,
          name: item.name || item.title || "Unnamed Course",
          title: item.title,

          price: actualPrice,
          priceINR:
            selectedCurrency === "INR"
              ? actualPrice
              : getItemPrice(item, "INR"),
          priceUSD:
            selectedCurrency === "USD"
              ? actualPrice
              : getItemPrice(item, "USD"),

          dumpsPriceInr: Number(item.dumpsPriceInr) || 0,
          dumpsPriceUsd: Number(item.dumpsPriceUsd) || 0,
          dumpsMrpInr: Number(item.dumpsMrpInr) || 0,
          dumpsMrpUsd: Number(item.dumpsMrpUsd) || 0,

          comboPriceInr: Number(item.comboPriceInr) || 0,
          comboPriceUsd: Number(item.comboPriceUsd) || 0,
          comboMrpInr: Number(item.comboMrpInr) || 0,
          comboMrpUsd: Number(item.comboMrpUsd) || 0,

          examPriceInr: Number(item.examPriceInr) || 0,
          examPriceUsd: Number(item.examPriceUsd) || 0,
          examMrpInr: Number(item.examMrpInr) || 0,
          examMrpUsd: Number(item.examMrpUsd) || 0,

          category: item.category,
          code: item.code || item.sapExamCode,
          sapExamCode: item.sapExamCode,
          sku: item.sku,
          slug: item.slug,
          imageUrl: item.imageUrl || "",
          samplePdfUrl: item.samplePdfUrl || "",
          mainPdfUrl: item.mainPdfUrl || "",
          duration: item.duration || "",
          eachQuestionMark: item.eachQuestionMark || "",
          numberOfQuestions: item.numberOfQuestions || "0",
          passingScore: item.passingScore || "",
          mainInstructions: item.mainInstructions || "",
          sampleInstructions: item.sampleInstructions || "",
          Description: item.Description || "",
          longDescription: item.longDescription || "",
          status: item.status || "active",
          action: item.action,
          type: item.type || "regular",
          metaTitle: item.metaTitle,
          metaKeywords: item.metaKeywords,
          metaDescription: item.metaDescription,
          schema: item.schema,
          quantity: item.quantity || 1,
        };
      }),
      totalAmount: grandTotal,
      subtotal: subtotal,
      discount: discount,
      currency: selectedCurrency,
      couponCode: appliedCoupon?.code || null,
      paymentMethod: paymentMethod,
      paymentId: paymentId,
      paymentStatus: "completed",
    };
  };

  const handleRazorpayPayment = async () => {
    if (status === "unauthenticated" || !userId) {
      toast.error("Please log in to proceed with payment");
      router.push("/auth/signin");
      return;
    }

    if (grandTotal <= 0) {
      toast.error("Cart total must be greater than zero");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      const razorpayCurrency = selectedCurrency === "USD" ? "INR" : "INR";
      const razorpayAmount =
        selectedCurrency === "USD" ? Math.round(grandTotal * 83) : grandTotal;

      const response = await axios.post("/api/payments/razorpay/create-order", {
        amount: razorpayAmount,
        currency: razorpayCurrency,
        userId,
        originalCurrency: selectedCurrency,
        originalAmount: grandTotal,
      });

      const orderId =
        response.data.orderId ||
        response.data.order_id ||
        response.data.id ||
        response.data.data?.orderId;

      if (!orderId) {
        throw new Error("Order ID not received from server");
      }

      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK not loaded. Please refresh the page.");
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        console.error("❌ NEXT_PUBLIC_RAZORPAY_KEY_ID not configured");
        toast.error("Razorpay is not configured. Please contact support.");
        return;
      }

      console.log(
        "✅ Using Razorpay Key:",
        razorpayKey.substring(0, 10) + "..."
      );

      const options = {
        key: razorpayKey,
        amount: Math.round(razorpayAmount * 100),
        currency: razorpayCurrency,
        name: "DumpsExpert",
        description: "Purchase IT Certification Materials",
        order_id: orderId,
        handler: async (razorpayResponse) => {
          try {
            toast.loading("Verifying payment...");

            const paymentVerification = await axios.post(
              "/api/payments/razorpay/verify",
              {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                amount: grandTotal,
                originalCurrency: selectedCurrency,
                userId,
              }
            );

            if (!paymentVerification.data.success) {
              throw new Error(
                paymentVerification.data.error || "Payment verification failed"
              );
            }

            toast.dismiss();
            toast.loading("Creating your order...");

            const orderPayload = createOrderPayload(
              "razorpay",
              paymentVerification.data.paymentId
            );

            console.log("📤 Sending order payload:", orderPayload);

            const orderResponse = await axios.post("/api/order", orderPayload);

            clearCart();

            if (paymentVerification.data.user) {
              await update({
                user: {
                  ...session.user,
                  role: paymentVerification.data.user.role,
                  subscription: paymentVerification.data.user.subscription,
                },
              });
            }

            toast.dismiss();
            toast.success("Payment successful! Order created.");
            setShowPaymentModal(false);

            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
          } catch (error) {
            console.error("Order creation failed:", error);
            toast.dismiss();
            toast.error(
              error.response?.data?.error ||
                "Failed to create order. Please contact support."
            );
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          contact: session?.user?.phone || "",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setShowPaymentModal(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setShowPaymentModal(false);
      });

      rzp.open();
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error(error.response?.data?.error || "Failed to initiate payment");
    }
  };

  const createPayPalOrder = async () => {
    if (status === "unauthenticated" || !userId) {
      toast.error("Please log in to proceed with payment");
      router.push("/auth/signin");
      return;
    }

    if (grandTotal <= 0) {
      toast.error("Cart total must be greater than zero");
      return;
    }

    try {
      // PayPal always uses USD in sandbox
      const amountInUSD = grandTotal; // Ensure this is already in USD or convert it

      console.log("🔵 Creating PayPal order:", {
        amount: amountInUSD,
        userId,
      });

      const response = await axios.post("/api/payments/paypal/create-order", {
        amount: amountInUSD,
        currency: "USD",
        userId,
      });

      if (!response.data?.success || !response.data?.orderId) {
        throw new Error(response.data.error || "Failed to create PayPal order");
      }

      console.log("✅ PayPal order created:", response.data.orderId);
      return response.data.orderId;
    } catch (error) {
      console.error("❌ PayPal order creation failed:", error);
      console.error("❌ Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorMessage: error.response?.data?.error,
        errorDetails: error.response?.data?.details,
        hint: error.response?.data?.hint,
      });

      // Show user-friendly error
      const errorMsg =
        error.response?.data?.hint ||
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create PayPal order";

      toast.error(errorMsg);
      throw error;
    }
  };

  const onPayPalApprove = async (data) => {
    try {
      toast.loading("Verifying payment...");

      const paymentVerification = await axios.post(
        "/api/payments/paypal/verify",
        {
          orderId: data.orderID,
          amount: grandTotal,
          userId,
        }
      );

      if (!paymentVerification.data.success) {
        throw new Error(
          paymentVerification.data.error || "Payment verification failed"
        );
      }

      toast.dismiss();
      toast.loading("Creating your order...");

      const orderPayload = createOrderPayload(
        "paypal",
        paymentVerification.data.paymentId
      );

      console.log("📤 Sending order payload:", orderPayload);

      await axios.post("/api/order", orderPayload);

      clearCart();

      if (paymentVerification.data.user) {
        await update({
          user: {
            ...session.user,
            role: paymentVerification.data.user.role,
            subscription: paymentVerification.data.user.subscription,
          },
        });
      }

      toast.dismiss();
      toast.success("Payment successful! Order created.");
      setShowPaymentModal(false);
      router.push("/dashboard");
    } catch (error) {
      console.error("PayPal payment verification failed:", error);
      toast.dismiss();
      toast.error(error.response?.data?.error || "Payment verification failed");
    }
  };

  if (!isMounted) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <Image
              src={cartImg}
              alt="Empty Cart"
              width={300}
              height={300}
              className="mx-auto mb-8"
            />
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add some items to your cart to get started!
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const itemPrice = getItemPrice(item, selectedCurrency);
                const itemMRP = getItemMRP(item, selectedCurrency);
                const itemDiscount = calculateItemDiscount(
                  item,
                  selectedCurrency
                );

                return (
                  <div
                    key={`${item._id}-${item.type}`}
                    className="bg-white rounded-lg shadow-sm p-6 flex items-start gap-4"
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={item.imageUrl || "/placeholder-image.jpg"}
                        alt={item.title}
                        width={100}
                        height={100}
                        className="rounded-lg object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {item.title}
                      </h3>

                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <p className="capitalize">
                          <span className="font-medium">Type:</span> {item.type}
                        </p>
                        {item.sapExamCode && (
                          <p>
                            <span className="font-medium">Code:</span>{" "}
                            {item.sapExamCode}
                          </p>
                        )}
                      </div>

                      {/* Pricing Display */}
                      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                        <span className="text-2xl font-bold text-green-600">
                          {formatPrice(itemPrice, selectedCurrency)}
                        </span>

                        {itemMRP > itemPrice && (
                          <>
                            <span className="text-lg text-gray-400 line-through">
                              {formatPrice(itemMRP, selectedCurrency)}
                            </span>
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                              {itemDiscount}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* All Available Prices - Debug Info */}
                      <details className="text-xs text-gray-500 mb-3">
                        <summary className="cursor-pointer hover:text-gray-700 font-medium">
                          View all prices
                        </summary>
                        <div className="mt-2 space-y-1 pl-4 bg-gray-50 p-2 rounded">
                          <p className="font-medium text-gray-700">
                            Regular PDF:
                          </p>
                          <p className="pl-2">
                            ₹{item.dumpsPriceInr || 0} / $
                            {item.dumpsPriceUsd || 0}
                          </p>

                          <p className="font-medium text-gray-700 mt-2">
                            Online Exam:
                          </p>
                          <p className="pl-2">
                            ₹{item.examPriceInr || 0} / $
                            {item.examPriceUsd || 0}
                          </p>

                          <p className="font-medium text-gray-700 mt-2">
                            Combo:
                          </p>
                          <p className="pl-2">
                            ₹{item.comboPriceInr || 0} / $
                            {item.comboPriceUsd || 0}
                          </p>
                        </div>
                      </details>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center space-x-2 border rounded-lg px-2 bg-white">
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.type, "dec")
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 rounded"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.type, "inc")
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleDelete(item._id, item.type)}
                          className="text-red-500 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50 text-sm font-medium"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Currency Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => {
                    setSelectedCurrency(e.target.value);
                    setAppliedCoupon(null);
                    setCouponCode("");
                    setCouponError("");
                    toast.info(`Currency changed to ${e.target.value}`);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Prices will update based on selected currency
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {formatPrice(subtotal, selectedCurrency)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon?.code}):</span>
                    <span className="font-medium">
                      -{formatPrice(discount, selectedCurrency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div className="mb-4">
                {!appliedCoupon ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Have a coupon?
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Button
                        onClick={handleCoupon}
                        variant="default"
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-sm mt-2">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Coupon Applied: {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600">
                          You saved {formatPrice(discount, selectedCurrency)}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Grand Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatPrice(grandTotal, selectedCurrency)}
                </span>
              </div>

              <Button
                variant="default"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3"
                onClick={() => setShowPaymentModal(true)}
              >
                Proceed to Payment
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Secure checkout powered by Razorpay & PayPal
              </p>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
              <h3 className="text-xl font-semibold text-center mb-4">
                Select Payment Method
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium">{selectedCurrency}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(grandTotal, selectedCurrency)}
                  </span>
                </div>
              </div>

              {/* Razorpay Payment Option */}
              <button
                onClick={handleRazorpayPayment}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
              >
                <span>💳</span>
                <span>Pay with Razorpay</span>
                <span className="ml-auto">
                  {formatPrice(grandTotal, selectedCurrency)}
                </span>
              </button>
              {selectedCurrency === "USD" && (
                <p className="text-xs text-amber-600 text-center -mt-2">
                  Note: USD amount will be converted to INR for Razorpay payment
                </p>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* PayPal Payment Option */}
              <div className="w-full">
                {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID &&
                process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID !==
                  "YOUR_PAYPAL_CLIENT_ID" ? (
                  <PayPalScriptProvider
                    options={{
                      "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                      currency: "USD", // PayPal sandbox works best with USD
                      intent: "capture",
                      vault: false,
                      commit: true,
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "paypal",
                        height: 45,
                      }}
                      createOrder={createPayPalOrder}
                      onApprove={onPayPalApprove}
                      onError={(error) => {
                        console.error("PayPal error:", error);
                        toast.error("PayPal payment failed. Please try again.");
                      }}
                      onCancel={() => {
                        toast.info("Payment cancelled");
                      }}
                      onInit={(data, actions) => {
                        console.log("PayPal buttons initialized");
                      }}
                      forceReRender={[grandTotal]}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-yellow-800">
                      PayPal is currently unavailable. Please use Razorpay or
                      contact support.
                    </p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                Razorpay: UPI, Cards, Net Banking & Wallets
                <br />
                PayPal: Credit/Debit Cards & PayPal Balance
              </p>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="block mx-auto mt-4 text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
