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
  const [showCurrencySwitcher, setShowCurrencySwitcher] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const [userCountry, setUserCountry] = useState("IN");
  const isIndia = userCountry === "IN";
  const isInternational = userCountry !== "IN";

  const router = useRouter();

  const getItemPrice = (item, currency) => {
    const type = item.type || "regular";
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

  const calculateItemDiscount = (item, currency) => {
    const price = getItemPrice(item, currency);
    const mrp = getItemMRP(item, currency);
    if (!mrp || mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const itemPrice = getItemPrice(item, selectedCurrency);
      return acc + itemPrice * (item.quantity || 1);
    }, 0);
  };

  const subtotal = calculateSubtotal();

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

  const getCurrencySymbol = (currency) => (currency === "USD" ? "$" : "₹");
  const formatPrice = (amount, currency) => {
    const numAmount = Number(amount) || 0;
    return `${getCurrencySymbol(currency)}${numAmount.toFixed(2)}`;
  };

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setSelectedCurrency(data.currency || "INR");
        setUserCountry(data.country_code || "IN");
      } catch (err) {
        console.error("Currency detection failed", err);
        setSelectedCurrency("INR");
        setUserCountry("IN");
      }
    };
    detectCurrency();
  }, []);

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

  const createOrderPayload = (paymentMethod, paymentId) => {
    return {
      userId,
      items: cartItems.map((item) => {
        const actualPrice = getItemPrice(item, selectedCurrency);
        return {
          _id: item._id,
          productId: item.productId || item._id,
          courseId: item._id,
          name: item.name || item.title || "Unnamed Course",
          title: item.title,
          price: actualPrice,
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
            const orderResponse = await axios.post("/api/order", orderPayload);

            if (!orderResponse.data.success) {
              throw new Error(
                orderResponse.data.error || "Order creation failed"
              );
            }

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
              router.push("/dashboard/student");
            }, 1000);
          } catch (error) {
            console.error("Order creation failed:", error);
            toast.dismiss();
            const errorMsg =
              error.response?.data?.error ||
              error.response?.data?.details?.[0] ||
              error.message ||
              "Failed to create order. Please contact support.";
            toast.error(errorMsg);
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
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to initiate payment";
      toast.error(errorMsg);
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
      const orderResponse = await axios.post("/api/order", orderPayload);

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.error || "Order creation failed");
      }

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
      router.push("/dashboard/student");
    } catch (error) {
      console.error("PayPal payment verification failed:", error);
      toast.dismiss();
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.details?.[0] ||
        error.message ||
        "Payment verification failed";
      toast.error(errorMsg);
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
      const amountInUSD = grandTotal;

      const response = await axios.post("/api/payments/paypal/create-order", {
        amount: amountInUSD,
        currency: "USD",
        userId,
      });

      if (!response.data?.success || !response.data?.orderId) {
        throw new Error(response.data.error || "Failed to create PayPal order");
      }

      return response.data.orderId;
    } catch (error) {
      console.error("❌ PayPal order creation failed:", error);
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

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <Toaster position="top-right" richColors />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Currency Switcher */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Shopping Cart
          </h1>

          {/* Simple Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowCurrencySwitcher(!showCurrencySwitcher)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:border-gray-400 transition-colors text-sm font-medium"
            >
              <span>{selectedCurrency === "USD" ? "$" : "₹"}</span>
              <span>{selectedCurrency}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showCurrencySwitcher ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showCurrencySwitcher && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setSelectedCurrency("INR");
                      setShowCurrencySwitcher(false);
                      setAppliedCoupon(null);
                      setCouponCode("");
                      toast.success("Currency changed to INR");
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      selectedCurrency === "INR"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    ₹ Indian Rupee (INR)
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCurrency("USD");
                      setShowCurrencySwitcher(false);
                      setAppliedCoupon(null);
                      setCouponCode("");
                      toast.success("Currency changed to USD");
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm mt-1 ${
                      selectedCurrency === "USD"
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    $ US Dollar (USD)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Image
              src={cartImg}
              alt="Empty Cart"
              width={300}
              height={300}
              className="mx-auto mb-8"
            />
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some items to your cart to get started!
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
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

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mb-3 flex-wrap">
                        <span className="text-xl font-bold text-blue-600">
                          {formatPrice(itemPrice, selectedCurrency)}
                        </span>

                        {itemMRP > itemPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(itemMRP, selectedCurrency)}
                            </span>
                            <span className="text-sm text-red-600">
                              ({itemDiscount}% off)
                            </span>
                          </>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.type, "dec")
                            }
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.type, "inc")
                            }
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleDelete(item._id, item.type)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit sticky top-24">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    {formatPrice(subtotal, selectedCurrency)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">
                      -{formatPrice(discount, selectedCurrency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Have a coupon?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <Button
                        onClick={handleCoupon}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Apply
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-red-600 text-sm mt-2">{couponError}</p>
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
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6 pt-6 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">
                  Grand Total:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(grandTotal, selectedCurrency)}
                </span>
              </div>

              <Button
                onClick={() => setShowPaymentModal(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
              <h3 className="text-xl font-semibold text-center mb-4 text-gray-900">
                Select Payment Method
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium text-gray-900">
                    {selectedCurrency}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-blue-600">
                    {formatPrice(grandTotal, selectedCurrency)}
                  </span>
                </div>
              </div>

              {/* Payment Options based on Currency */}
              {selectedCurrency === "INR" ? (
                <>
                  {/* Razorpay for INR */}
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

                  <p className="text-xs text-gray-500 text-center mt-2">
                    Secure payment via UPI, Cards, Net Banking & Wallets
                  </p>
                </>
              ) : (
                <>
                  {/* PayPal for USD and other currencies */}
                  <div className="w-full space-y-3">
                    {/* Manual PayPal Button */}
                    <button
                      onClick={async () => {
                        try {
                          toast.loading("Creating PayPal payment...");
                          const orderId = await createPayPalOrder();

                          if (orderId) {
                            toast.dismiss();
                            // Redirect to PayPal for payment
                            window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
                          }
                        } catch (error) {
                          toast.dismiss();
                          console.error("PayPal payment failed:", error);
                          toast.error("Failed to initiate PayPal payment");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg shadow transition"
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H7.72a.483.483 0 0 1-.477-.558L7.418 21h1.518l.95-6.02h1.385c4.678 0 7.75-2.203 8.796-6.502z" />
                        <path d="M2.379 0h7.99c1.384 0 2.485.296 3.089 1.037.532.653.693 1.633.447 2.993l-.035.193v.289l.476.27c.33.176.602.373.816.59.73.736.983 1.845.71 3.328-.88 4.783-3.726 6.917-8.465 6.917H6.053a.944.944 0 0 0-.931.802l-.025.14-1.055 6.698-.03.16a.545.545 0 0 1-.538.46H.79a.484.484 0 0 1-.477-.558L2.379 0z" />
                      </svg>
                      <span>Pay with PayPal</span>
                      <span className="ml-auto">
                        {formatPrice(grandTotal, selectedCurrency)}
                      </span>
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      Secure international payment via PayPal
                      <br />
                      You'll be redirected to PayPal to complete payment
                    </p>
                  </div>
                </>
              )}

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
