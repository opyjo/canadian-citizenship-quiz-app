"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <div className="container mx-auto py-12 px-4 text-center min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      <XCircle className="h-16 w-16 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Your payment process was cancelled. You have not been charged.
      </p>
      <div className="flex space-x-4">
        <Link href="/pricing">
          <Button size="lg" variant="outline">
            View Pricing Again
          </Button>
        </Link>
        <Link href="/">
          <Button size="lg">Return Home</Button>
        </Link>
      </div>
    </div>
  );
}
