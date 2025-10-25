"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import useCartStore from "@/store/useCartStore";
import cartImg from "../../assets/landingassets/emptycart.webp";
import { useSession } from "next-auth/react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Cart() {
  const { data: session, status, update } = useSession();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart, setCartItems } =
    useCartStore();

  const currencies = {
    USD: { symbol: "$", name: "US Dollar" },
    INR: { symbol: "₹", name: "Indian Rupee" },
  };

  // ✅ Fetch user ID
  useEffect(() => {
    const fetchUserId = async () => {
      if (status === "authenticated") {
        try {
          const res = await axios.get("/api/user/me");
          setUserId(res.data.id);
        } catch {
          toast.error("Failed to load user info");
        }
      }
    };
    fetchUserId();
  }, [status]);

  // ✅ Load Razorpay SDK once
  useEffect(() => {
    setIsMounted(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // ✅ Fetch missing prices for online items
  useEffect(() => {
    const fetchPrices = async () => {
      setLoadingPrices(true);
      const updated = await Promise.all(
        cartItems.map(async (item) => {
          if (item.type === "online" && !item.priceINR) {
            try {
              const res = await axios.get(
                `/api/exam/by-product/${item.productId}`
              );
              const exam = res.data;
              return {
                ...item,
                priceINR: exam.priceINR,
                priceUSD: exam.priceUSD,
              };
            } catch (err) {
              console.error("Error fetching price:", err);
            }
          }
          return item;
        })
      );
      setCartItems(updated);
      setLoadingPrices(false);
    };
    if (cartItems.length > 0) fetchPrices();
  }, [cartItems, setCartItems]);

  // ✅ Calculate totals dynamically based on selected currency
  const subtotal = cartItems.reduce((acc, item) => {
    const price =
      selectedCurrency === "USD" ? item.priceUSD || 0 : item.priceINR || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const grandTotal = subtotal - discount;

  // ✅ Coupon Validation
  const handleCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      toast.error("Enter a coupon code");
      return;
    }
    try {
      const res = await axios.post("/api/coupons/validate", {
        code: couponCode,
        totalAmount: grandTotal,
      });
      if (res.data.success) {
        setDiscount(res.data.discount);
        toast.success(`Coupon applied! You saved ₹${res.data.discount}`);
      } else {
        throw new Error(res.data.error);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid coupon";
      setCouponError(msg);
      toast.error(msg);
    }
  };

  // ✅ Razorpay Payment Handler
  const handleRazorpayPayment = async () => {
    if (!userId) {
      toast.error("Please log in");
      router.push("/auth/signin");
      return;
    }
    try {
      const res = await axios.post("/api/payments/razorpay/create-order", {
        amount: grandTotal,
        currency: "INR",
        userId,
      });
      const { orderId } = res.data;
      const options = {
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_7kAotmP1o8JR8V",
        amount: grandTotal * 100,
        currency: "INR",
        name: "DumpsExpert",
        description: "Purchase IT Certification Dumps",
        order_id: orderId,
        handler: async (response) => {
          const verify = await axios.post("/api/payments/razorpay/verify", {
            ...response,
            amount: grandTotal,
            userId,
          });
          if (verify.data.success) {
            await axios.post("/api/order", {
              userId,
              items: cartItems,
              totalAmount: grandTotal,
              paymentMethod: "razorpay",
              paymentId: verify.data.paymentId,
            });
            clearCart();
            toast.success("Payment successful!");
            router.push("/dashboard");
          } else toast.error("Payment verification failed");
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: { color: "#4F46E5" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Failed to initiate Razorpay payment");
    }
  };

  // ✅ PayPal Handlers
  const createPayPalOrder = async () => {
    const res = await axios.post("/api/payments/paypal/create-order", {
      amount: grandTotal,
      currency: selectedCurrency,
      userId,
    });
    setPaypalOrderId(res.data.orderId);
    return res.data.orderId;
  };

  const onPayPalApprove = async (data) => {
    const verify = await axios.post("/api/payments/paypal/verify", {
      orderId: data.orderID,
      amount: grandTotal,
      userId,
    });
    if (verify.data.success) {
      await axios.post("/api/order", {
        userId,
        items: cartItems,
        totalAmount: grandTotal,
        paymentMethod: "paypal",
        paymentId: verify.data.paymentId,
      });
      clearCart();
      toast.success("Payment successful!");
      router.push("/dashboard");
    } else toast.error("Payment verification failed");
  };

  if (!isMounted) return <div className="text-center mt-20">Loading...</div>;
  if (loadingPrices)
    return <div className="text-center mt-20">Fetching prices...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Toaster position="top-right" />
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
            <p className="text-gray-600 mb-8">Your cart is empty.</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 🛒 Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item._id}-${item.type}`}
                  className="bg-white p-6 rounded-lg shadow flex items-center space-x-4"
                >
                  <Image
                    src={item.imageUrl || "/placeholder-image.jpg"}
                    alt={item.title}
                    width={80}
                    height={80}
                    className="rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      Type: {item.type}
                    </p>
                    <p className="font-semibold text-green-600">
                      {currencies[selectedCurrency].symbol}
                      {selectedCurrency === "USD"
                        ? item.priceUSD?.toFixed(2)
                        : item.priceINR?.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.type, "dec")}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 bg-gray-200 rounded-full"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.type, "inc")}
                      className="w-8 h-8 bg-gray-200 rounded-full"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id, item.type)}
                    className="text-red-500 text-xl"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* 📦 Order Summary */}
            <div className="bg-white rounded-lg shadow p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <label className="block text-sm mb-2">Display Currency</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="border px-3 py-2 rounded w-full mb-4"
              >
                {Object.entries(currencies).map(([code, { symbol, name }]) => (
                  <option key={code} value={code}>
                    {symbol} {name}
                  </option>
                ))}
              </select>

              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>
                  {currencies[selectedCurrency].symbol}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 mb-2">
                  <span>Discount</span>
                  <span>
                    -{currencies[selectedCurrency].symbol}
                    {discount.toFixed(2)}
                  </span>
                </div>
              )}
              <hr className="my-3" />
              <p className="flex justify-between font-semibold">
                Total{" "}
                <span className="text-green-600">
                  {currencies[selectedCurrency].symbol}
                  {grandTotal.toFixed(2)}
                </span>
              </p>

              <div className="mt-6">
                <input
                  type="text"
                  placeholder="Enter coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-2"
                />
                <Button
                  onClick={handleCoupon}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  Apply Coupon
                </Button>
              </div>

              <Button
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setShowPaymentModal(true)}
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}

        {/* 💳 Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-center">
                Choose Payment Method
              </h3>

              <button
                onClick={handleRazorpayPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mb-3"
              >
                Pay with Razorpay (₹{grandTotal.toFixed(2)})
              </button>

              <PayPalScriptProvider
                options={{
                  "client-id":
                    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
                  currency: selectedCurrency,
                }}
              >
                <PayPalButtons
                  style={{ layout: "horizontal", color: "blue", shape: "rect" }}
                  createOrder={createPayPalOrder}
                  onApprove={onPayPalApprove}
                />
              </PayPalScriptProvider>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="block mx-auto mt-4 text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
