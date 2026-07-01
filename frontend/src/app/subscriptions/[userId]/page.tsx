"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import PlanCard from "@/components/PlanCard";
import { Crown } from "lucide-react";
import LoadingSpinner from "@/components/loading-spinner";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "../../../context/firebase";
import axiosInstance from "@/lib/axiosInstance";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type SubscriptionStatus = {
  plan: string;
  limit: number | null;
  used: number;
  remaining: number | null;
  expiresAt: string | null;
};

export default function SubscriptionPage() {
  const { user } = useAuth();

  const [paymentAvailable, setPaymentAvailable] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const fetchStatus = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axiosInstance.get(`/subscriptions/status/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.data;
      setSubscription(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
  ) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/verify`,
        {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.data;

      if (data.success) {
        alert("Subscription activated");
        fetchStatus();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openRazorpay = (order: any) => {
    if (!window.Razorpay) return alert("Razorpay not loaded");

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id || order.orderId,
      handler: async (response: any) => {
        await verifyPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
        );
      },
    };

    new window.Razorpay(options).open();
  };

  const createOrder = async (planName: string) => {
    if (!user?._id) return alert("User not logged in");
    const token = await auth.currentUser?.getIdToken();
    const res = await axiosInstance.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/create-order/${user._id}`,
      { planName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const order = await res.data;
    openRazorpay(order);
  };

  const fetchPaymentStatus = async () => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await axiosInstance.get(`/payments/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPaymentAvailable(res.data.success);
      setPaymentMessage(res.data.message);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchPaymentStatus();
    }
  }, [auth.currentUser]);

  useEffect(() => {
    fetchStatus();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white pb-20 md:pb-0">
      {/* Header (Feed style) */}
      <div className="flex ml-4 pt-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")} // or "/feed"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">Subscription</h1>
            <p className="text-sm text-gray-500">Manage your plan and usage</p>
          </div>
        </div>
      </div>

      {/* Current subscription (tweet-like card) */}
      <div className="px-4 mt-6">
        <div className="rounded-xl border border-gray-800 bg-black p-5">
          <div className="flex items-center gap-2 mb-4 text-yellow-400">
            <Crown size={18} />
            <h2 className="text-lg font-semibold text-white">Current Plan</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Plan</p>
              <p className="font-semibold">
                {subscription?.plan?.toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Used</p>
              <p className="font-semibold">{subscription?.used}</p>
            </div>

            <div>
              <p className="text-gray-500">Remaining</p>
              <p className="font-semibold">
                {subscription?.remaining ?? "Unlimited"}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Expiry</p>
              <p className="font-semibold">
                {subscription?.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment status banner */}
        <div
          className={`mt-4 rounded-xl p-3 text-sm border ${
            paymentAvailable
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {paymentMessage ?? "Payment status not available"}
        </div>
      </div>

      {/* Plans */}
      <div className="px-4 mt-6">
        <PlanCard
          paymentAvailable={paymentAvailable}
          createOrder={createOrder}
          currentPlan={subscription?.plan}
        />
      </div>
    </div>
  );
}
