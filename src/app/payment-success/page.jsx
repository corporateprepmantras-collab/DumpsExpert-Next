"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function PayPalSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("token");

  useEffect(() => {
    console.log("🔁 PayPal return token:", orderId);

    if (!orderId) {
      toast.error("PayPal token missing");
      router.replace("/cart");
      return;
    }

    const capturePayment = async () => {
      try {
        toast.loading("Finalizing PayPal payment...");

        const res = await axios.post(
          "/api/payments/paypal/capture",
          { orderId },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ Capture response:", res.data);

        if (!res.data.success) {
          throw new Error(res.data.error);
        }

        toast.dismiss();
        toast.success("Payment successful");
        router.replace("/dashboard/student");
      } catch (err) {
        toast.dismiss();
        console.error("❌ Capture failed:", err);
        toast.error("PayPal capture failed");
        router.replace("/cart");
      }
    };

    capturePayment();
  }, [orderId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">Completing your PayPal payment…</p>
    </div>
  );
}
