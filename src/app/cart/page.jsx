"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import instance from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import useCartStore from "@/store/useCartStore";
import cartImg from "../../assets/landingassets/emptycart.webp";
import { useSession } from "next-auth/react";
import axios from "axios";

const Cart = () => {
  const { data: session, status, update } = useSession();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplicable, setCouponApplicable] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userId, setUserId] = useState(null);

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
        } catch (error) {
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
  };

  if (!isMounted) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-[80vh] bg-[#f9f9f9] px-2 sm:px-4 py-6 sm:py-10">
      <Toaster richColors position="top-right" />
      <div className="flex justify-center mb-6">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
          Your Cart
        </h2>
      </div>

      {/* Main Section */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 w-full">
        {/* Cart Items */}
        <div className="w-full lg:w-[65%]">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <Image
                src={cartImg}
                alt="empty_cart_img"
                width={200}
                height={200}
                className="w-40 sm:w-56"
                draggable={false}
              />
              <p className="text-gray-600 text-base sm:text-lg">
                Your cart is empty. Add items to your cart to proceed.
              </p>
              <Button
                onClick={() => router.push("/ItDumps")}
                className="bg-indigo-600 hover:bg-indigo-700 px-6"
              >
                Shop Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4 w-full max-h-[565px] overflow-y-auto pr-1 sm:pr-2">
              {cartItems.map((item) => (
                <div
                  key={`${item._id}-${item.type}`}
                  className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 bg-white border p-3 sm:p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Image
                      src={item.imageUrl || "https://via.placeholder.com/100"}
                      alt={item.title || "Product Image"}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold">
                        {item.title || "Unknown Product"}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 capitalize">
                        {item.type || "Unknown"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.type, "dec")
                          }
                          className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="px-3 py-1 border rounded bg-white text-sm">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.type, "inc")
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2 w-full sm:w-auto">
                    <p className="text-base sm:text-lg font-semibold">
                      ₹{(item.price || 0) * (item.quantity || 1)}
                    </p>
                    <button
                      onClick={() => handleDelete(item._id, item.type)}
                      className="text-red-500 text-xs sm:text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[35%] bg-gray-50 p-4 sm:p-6 rounded-xl shadow-md border">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Order Summary
          </h2>

          <div className="text-gray-700 space-y-2 text-sm sm:text-base">
            <p>
              Total (MRP):{" "}
              <span className="float-right">₹{subtotal || 0}</span>
            </p>
            <p>
              Subtotal: <span className="float-right">₹{subtotal || 0}</span>
            </p>
            <p>
              Discount:{" "}
              <span className="float-right text-green-600">
                ₹{discount.toFixed(2) || 0}
              </span>
            </p>
          </div>

          <hr className="my-4" />

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <Button onClick={() => {}} className="px-4 sm:px-6">
              Apply
            </Button>
          </div>
          {couponError && (
            <p className="text-red-500 text-sm mt-2">{couponError}</p>
          )}

          <hr className="my-4" />

          <p className="font-medium text-base sm:text-lg">
            Grand Total:{" "}
            <span className="float-right text-green-600">
              ₹{grandTotal || 0}
            </span>
          </p>

          {cartItems.length > 0 && (
            <div className="mt-6">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setShowPaymentModal(true)}
              >
                Continue to Payment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-lg sm:text-xl font-semibold text-center">
              Select Payment Method
            </h3>

            <button
              onClick={() => {}}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
            >
              <Image
                src="https://via.placeholder.com/100"
                alt="Razorpay"
                width={80}
                height={40}
                className="w-16 sm:w-20 h-8 sm:h-10"
              />
              Pay with Razorpay
            </button>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="block mx-auto mt-2 text-xs sm:text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
