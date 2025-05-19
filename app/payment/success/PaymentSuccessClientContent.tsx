"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessClientContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // Here you could potentially fetch the session details from your backend
      // to display more specific information or confirm the subscription status again.
      // For now, we just acknowledge the success.
      console.log("Stripe Checkout Session ID:", sessionId);
      // You might want to clear cart, redirect to dashboard, etc.
    }
  }, [sessionId]);

  return (
    <div className="container mx-auto py-12 px-4 text-center min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Thank you for your purchase. Your access has been updated.
      </p>
      <Link href="/dashboard">
        <Button size="lg">Go to Dashboard</Button>
      </Link>
      {sessionId && (
        <p className="text-xs text-muted-foreground mt-4">
          Session ID: {sessionId}
        </p>
      )}
    </div>
  );
}
