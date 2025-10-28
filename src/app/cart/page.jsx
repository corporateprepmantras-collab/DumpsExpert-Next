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
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const router = useRouter();

  // Get actual item price based on currency
  const getItemPrice = (item, currency) => {
    if (currency === "USD") {
      return item.dumpsPriceUsd || item.priceUSD || item.price || 0;
    } else {
      return item.dumpsPriceInr || item.priceINR || item.price || 0;
    }
  };

  // Calculate subtotal in selected currency
  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const itemPrice = getItemPrice(item, selectedCurrency);
      return acc + itemPrice * (item.quantity || 1);
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Calculate discount based on coupon
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discountType === "percentage") {
      const discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
      return appliedCoupon.maxDiscount
        ? Math.min(discountAmount, appliedCoupon.maxDiscount)
        : discountAmount;
    } else if (appliedCoupon.discountType === "fixed") {
      return appliedCoupon.discountValue;
    }
    return 0;
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

  const handleDelete = (id, type) => {
    removeFromCart(id, type);
    toast.success("Item removed from cart");

    // Reset coupon if cart becomes empty
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

      if (response.data.success) {
        setAppliedCoupon({
          code: couponCode.trim(),
          discountType: response.data.discountType,
          discountValue: response.data.discountValue,
          maxDiscount: response.data.maxDiscount,
        });
        setCouponError("");
        toast.success(
          `Coupon applied! You saved ${formatPrice(
            response.data.discount,
            selectedCurrency
          )}`
        );
      } else {
        setCouponError(response.data.error || "Invalid coupon code");
        toast.error(response.data.error || "Invalid coupon code");
      }
    } catch (error) {
      console.error("Coupon validation failed:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to validate coupon";
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

  const handleRazorpayPayment = async () => {
    if (status === "unauthenticated" || !userId) {
      toast.error("Please log in to proceed with payment");
      router.push("/auth/signin");
      return;
    }

    if (selectedCurrency !== "INR") {
      toast.error("Razorpay only supports INR currency");
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
      const response = await axios.post("/api/payments/razorpay/create-order", {
        amount: grandTotal,
        currency: "INR",
        userId,
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

      const razorpayKey =
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_7kAotmP1o8JR8V";

      const options = {
        key: razorpayKey,
        amount: Math.round(grandTotal * 100),
        currency: "INR",
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

            const orderPayload = {
              userId,
              items: cartItems.map((item) => ({
                _id: item._id,
                productId: item.productId || item._id,
                courseId: item._id,
                name: item.name || item.title || "Unnamed Course",
                title: item.title,

                // All pricing fields
                price: getItemPrice(item, selectedCurrency),
                priceINR: item.priceINR || item.dumpsPriceInr,
                priceUSD: item.priceUSD || item.dumpsPriceUsd,
                dumpsPriceInr: item.dumpsPriceInr,
                dumpsPriceUsd: item.dumpsPriceUsd,
                dumpsMrpInr: item.dumpsMrpInr,
                dumpsMrpUsd: item.dumpsMrpUsd,
                comboPriceInr: item.comboPriceInr,
                comboPriceUsd: item.comboPriceUsd,
                comboMrpInr: item.comboMrpInr,
                comboMrpUsd: item.comboMrpUsd,

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
                type: item.type || "exam",
                metaTitle: item.metaTitle,
                metaKeywords: item.metaKeywords,
                metaDescription: item.metaDescription,
                schema: item.schema,
                quantity: item.quantity || 1,
              })),
              totalAmount: grandTotal,
              subtotal: subtotal,
              discount: discount,
              currency: selectedCurrency,
              couponCode: appliedCoupon?.code || null,
              paymentMethod: "razorpay",
              paymentId: paymentVerification.data.paymentId,
              paymentStatus: "completed",
            };

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

    if (selectedCurrency !== "USD") {
      toast.error("PayPal only supports USD currency");
      return;
    }

    if (grandTotal <= 0) {
      toast.error("Cart total must be greater than zero");
      return;
    }

    try {
      const response = await axios.post("/api/payments/paypal/create-order", {
        amount: grandTotal,
        currency: "USD",
        userId,
      });

      if (!response.data?.success || !response.data?.orderId) {
        throw new Error(response.data.error || "Failed to create PayPal order");
      }

      return response.data.orderId;
    } catch (error) {
      console.error("PayPal order creation failed:", error);
      toast.error(
        error.response?.data?.error || "Failed to create PayPal order"
      );
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

      const orderPayload = {
        userId,
        items: cartItems.map((item) => ({
          _id: item._id,
          productId: item.productId || item._id,
          courseId: item._id,
          name: item.name || item.title || "Unnamed Course",
          title: item.title,

          price: getItemPrice(item, selectedCurrency),
          priceINR: item.priceINR || item.dumpsPriceInr,
          priceUSD: item.priceUSD || item.dumpsPriceUsd,
          dumpsPriceInr: item.dumpsPriceInr,
          dumpsPriceUsd: item.dumpsPriceUsd,
          dumpsMrpInr: item.dumpsMrpInr,
          dumpsMrpUsd: item.dumpsMrpUsd,
          comboPriceInr: item.comboPriceInr,
          comboPriceUsd: item.comboPriceUsd,
          comboMrpInr: item.comboMrpInr,
          comboMrpUsd: item.comboMrpUsd,

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
          type: item.type || "exam",
          metaTitle: item.metaTitle,
          metaKeywords: item.metaKeywords,
          metaDescription: item.metaDescription,
          schema: item.schema,
          quantity: item.quantity || 1,
        })),
        totalAmount: grandTotal,
        subtotal: subtotal,
        discount: discount,
        currency: selectedCurrency,
        couponCode: appliedCoupon?.code || null,
        paymentMethod: "paypal",
        paymentId: paymentVerification.data.paymentId,
        paymentStatus: "completed",
      };

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
                return (
                  <div
                    key={`${item._id}-${item.type}`}
                    className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4"
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={item.imageUrl || "/placeholder-image.jpg"}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        Type: {item.type}
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatPrice(itemPrice, selectedCurrency)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(item._id, item.type, "dec")
                        }
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-50"
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
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(item._id, item.type)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove item"
                    >
                      🗑️
                    </button>
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
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="INR">₹ Indian Rupee (INR)</option>
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

              {selectedCurrency === "INR" && (
                <button
                  onClick={handleRazorpayPayment}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
                >
                  <span>💳</span>
                  <span>Pay with Razorpay</span>
                  <span className="ml-auto">
                    {formatPrice(grandTotal, "INR")}
                  </span>
                </button>
              )}

              {selectedCurrency === "USD" && (
                <div className="w-full">
                  <PayPalScriptProvider
                    options={{
                      "client-id":
                        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
                        "YOUR_PAYPAL_CLIENT_ID",
                      currency: "USD",
                      intent: "capture",
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "paypal",
                      }}
                      createOrder={createPayPalOrder}
                      onApprove={onPayPalApprove}
                      onError={(error) => {
                        console.error("PayPal error:", error);
                        toast.error("PayPal payment failed");
                      }}
                      onCancel={() => {
                        toast.info("Payment cancelled");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center">
                {selectedCurrency === "INR"
                  ? "Razorpay accepts UPI, Cards, Net Banking & Wallets"
                  : "PayPal accepts Credit/Debit Cards & PayPal Balance"}
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
