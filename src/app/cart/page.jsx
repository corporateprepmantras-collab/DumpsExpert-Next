"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import instance from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import useCartStore from "@/store/useCartStore";
import cartImg from "../../assets/landingassets/emptycart.webp";
import { useSession, signIn } from "next-auth/react";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Cart = () => {
  const { data: session, status, update } = useSession();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplicable, setCouponApplicable] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);

  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const router = useRouter();

  // Fetch userId from /api/user/me
  useEffect(() => {
    const fetchUserId = async () => {
      if (status === "authenticated") {
        try {
          const response = await axios.get("/api/user/me");
          setUserId(response.data.id);
          console.log("Fetched userId from /api/user/me:", response.data.id);
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
      document.body.removeChild(script);
    };
  }, []);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  const grandTotal = subtotal - discount;

  const handleDelete = (id, type) => {
    removeFromCart(id, type);
    toast.success("Item removed from cart");
  };

  const handleQuantityChange = (id, type, operation) => {
    updateQuantity(id, type, operation);
    toast.success(
      `Quantity ${operation === "inc" ? "increased" : "decreased"} for item`
    );
  };

  const handleCoupon = async () => {
    if (!couponCode) {
      setCouponError("Please enter a coupon code");
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      if (!instance || typeof axios.post !== "function") {
        throw new Error("Axios instance is not initialized");
      }

      const response = await axios.post("/api/coupons/validate", {
        code: couponCode,
      });
      const { discount } = response.data.coupon;

      // Calculate discount amount based on subtotal
      const discountAmount = (subtotal * discount) / 100;

      setDiscount(discountAmount);
      setCouponError("");
      setCouponApplicable(true);
      setCouponCode("");
      toast.success(
        `Coupon applied successfully! You saved ₹${discountAmount.toFixed(
          2
        )} (${discount}% off)`
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to apply coupon";
      setCouponError(errorMessage);
      setDiscount(0);
      setCouponApplicable(false);
      toast.error(errorMessage);
    }
  };

  const handleRazorpayPayment = async () => {
    if (status === "unauthenticated" || !userId) {
      toast.error("Please log in to proceed with payment");
      router.push("/auth/signin");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Razorpay SDK failed to load. Please try again later.");
      return;
    }

    if (grandTotal <= 0) {
      toast.error("Cart total must be greater than zero");
      return;
    }

    try {
      if (!instance || typeof axios.post !== "function") {
        throw new Error("Axios instance is not initialized");
      }

      console.log("Initiating Razorpay order creation:", {
        amount: grandTotal,
        userId,
      });
      const orderData = {
        amount: grandTotal,
        currency: "INR",
        userId, // Include userId for validation
      };
      const response = await axios.post(
        "/api/payments/razorpay/create-order",
        orderData
      );
      if (!response.data?.id) {
        throw new Error(
          response.data.error || "Failed to create Razorpay order"
        );
      }

      const { id, amount, currency } = response.data;

      const options = {
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_7kAotmP1o8JR8V",
        amount: amount,
        currency: currency,
        order_id: id,
        name: "DumpsExpert",
        description: "Purchase Exam Dumps",
        handler: async (razorpayResponse) => {
          try {
            console.log("Verifying Razorpay payment:", razorpayResponse);
            console.log("User ID sent to verify:", userId);
            const paymentVerification = await axios.post(
              "/api/payments/razorpay/verify",
              {
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                amount: grandTotal,
                userId,
              }
            );

            if (paymentVerification.data.success) {
              console.log("Creating order with:", {
                userId,
                items: cartItems,
                totalAmount: grandTotal,
              });
              await axios.post("/api/order", {
                userId,
                items: cartItems,
                totalAmount: grandTotal,
                paymentMethod: "razorpay",
                paymentId: paymentVerification.data.paymentId,
              });

              clearCart();

              // Update session with new user data
              await update({
                user: {
                  ...session.user,
                  role: paymentVerification.data.user.role,
                  subscription: paymentVerification.data.user.subscription,
                },
              });

              router.push("/dashboard");
              toast.success("Payment successful! Redirecting to dashboard...");
            } else {
              toast.error(
                paymentVerification.data.error || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", {
              message: error.message,
              stack: error.stack,
              response: error.response?.data,
            });
            toast.error(
              error.response?.data?.error || "Payment verification failed"
            );
          }
        },
        theme: {
          color: "#3B82F6",
        },
        prefill: {
          email: session.user.email,
          name: session.user.name,
        },
      };

      console.log("Opening Razorpay checkout with options:", options);
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response.error);
        toast.error(response.error?.description || "Payment failed");
      });
      rzp.open();
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Payment initiation failed:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to initiate payment. Please check if the server is running and try again.";
      toast.error(errorMessage);
    }
  };

  // PayPal payment handlers
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
      console.log("Creating PayPal order:", {
        amount: grandTotal,
        userId,
      });

      const response = await axios.post("/api/payments/paypal/create-order", {
        amount: grandTotal,
        currency: "INR",
        userId,
      });

      if (!response.data?.success || !response.data?.orderId) {
        throw new Error(
          response.data.error || "Failed to create PayPal order"
        );
      }

      setPaypalOrderId(response.data.orderId);
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
      console.log("PayPal payment approved:", data);
      console.log("User ID sent to verify:", userId);

      const paymentVerification = await axios.post(
        "/api/payments/paypal/verify",
        {
          orderId: data.orderID,
          amount: grandTotal,
          userId,
        }
      );

      if (paymentVerification.data.success) {
        console.log("Creating order with:", {
          userId,
          items: cartItems,
          totalAmount: grandTotal,
        });

        await axios.post("/api/order", {
          userId,
          items: cartItems,
          totalAmount: grandTotal,
          paymentMethod: "paypal",
          paymentId: paymentVerification.data.paymentId,
        });

        clearCart();

        // Update session with new user data if available
        if (paymentVerification.data.user) {
          await update({
            user: {
              ...session.user,
              role: paymentVerification.data.user.role,
              subscription: paymentVerification.data.user.subscription,
            },
          });
        }

        router.push("/dashboard");
        toast.success("Payment successful! Redirecting to dashboard...");
      } else {
        toast.error(
          paymentVerification.data.error || "Payment verification failed"
        );
      }
    } catch (error) {
      console.error("PayPal payment verification error:", error);
      toast.error(
        error.response?.data?.error || "Payment verification failed"
      );
    }
  };

  const onPayPalError = (error) => {
    console.error("PayPal payment error:", error);
    toast.error("PayPal payment failed. Please try again.");
  };

  const onPayPalCancel = () => {
    console.log("PayPal payment cancelled");
    toast.info("Payment cancelled");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <Image
              src={cartImg}
              alt="Empty Cart"
              width={300}
              height={300}
              className="mx-auto mb-8"
            />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Add some items to your cart to get started.
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
              {cartItems.map((item) => (
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
                      ₹{item.price}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item._id, item.type, "dec")
                      }
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
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
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal || 0}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
              </div>

              {/* Coupon Section */}
              <div className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <Button onClick={handleCoupon} variant="default">
                    Apply
                  </Button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-sm mt-2">{couponError}</p>
                )}

                <hr className="my-4" />

                <p className="font-medium text-lg">
                  Grand Total:{" "}
                  <span className="float-right text-green-600">
                    ₹{grandTotal || 0}
                  </span>
                </p>

                {cartItems.length > 0 && (
                  <div className="mt-6">
                    <Button
                      variant="default"
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
              <h3 className="text-xl font-semibold text-center">
                Select Payment Method
              </h3>

              {/* Razorpay Button */}
              <button
                onClick={handleRazorpayPayment}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
              >
                <Image
                  src="https://via.placeholder.com/100"
                  alt="Razorpay"
                  width={80}
                  height={40}
                  className="w-20 h-10"
                />
                Pay with Razorpay
              </button>

              {/* PayPal Button */}
              <div className="w-full">
                <PayPalScriptProvider
                  options={{
                    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
                    currency: "INR",
                    intent: "capture",
                  }}
                >
                  <PayPalButtons
                    style={{
                      layout: "horizontal",
                      color: "blue",
                      shape: "rect",
                      label: "pay",
                    }}
                    createOrder={createPayPalOrder}
                    onApprove={onPayPalApprove}
                    onError={onPayPalError}
                    onCancel={onPayPalCancel}
                  />
                </PayPalScriptProvider>
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="block mx-auto mt-2 text-sm text-gray-500 hover:underline"
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
