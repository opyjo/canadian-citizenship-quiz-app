"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";

// Ensure your Stripe publishable key is set in environment variables
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Plan {
  id: string; // Corresponds to Stripe Price ID
  name: string;
  description: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    id: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID!,
    name: "Lifetime Access",
    description: "Unlock all features forever with a single payment.",
    price: "$19.99",
    features: [
      "Access to all 500+ questions",
      "All quiz modes (Standard, Timed, Practice)",
      "Track your progress",
      "Lifetime updates to question bank",
    ],
    cta: "Get Lifetime Access",
  },
  {
    id: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
    name: "Monthly Subscription",
    description: "Access all features with a flexible monthly plan.",
    price: "$4.99/month",
    isPopular: true,
    features: [
      "Access to all 500+ questions",
      "All quiz modes (Standard, Timed, Practice)",
      "Track your progress",
      "Continuous updates & new features",
      "Cancel anytime",
    ],
    cta: "Subscribe Monthly",
  },
];

export default function PricingPage() {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleCheckout = async (priceId: string) => {
    setLoadingPriceId(priceId);
    setError(null);

    // Check if user is logged in using the auth store
    if (!user) {
      router.push("/auth?redirect=/pricing"); // Redirect to login, then back to pricing
      setLoadingPriceId(null);
      return;
    }

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
        credentials: "include",
      });

      const checkoutSession = await response.json();

      if (!response.ok || checkoutSession.error) {
        throw new Error(
          checkoutSession.error || "Failed to create checkout session."
        );
      }

      const stripe = await stripePromise;
      if (stripe && checkoutSession.sessionId) {
        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: checkoutSession.sessionId,
        });
        if (stripeError) {
          console.error("Stripe redirect error:", stripeError);
          setError(stripeError.message || "Failed to redirect to Stripe.");
        }
      } else {
        setError("Stripe.js failed to load or session ID missing.");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred.");
    }
    setLoadingPriceId(null);
  };

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Find the Perfect Plan
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Unlock your path to Canadian citizenship with our flexible plans.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-md">
          <p>Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col ${
              plan.isPopular ? "border-red-500 border-2 shadow-lg" : ""
            }`}
          >
            {plan.isPopular && (
              <div className="bg-red-500 text-white text-xs font-semibold py-1 px-3 rounded-t-md text-center">
                POPULAR
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold">
                {plan.name}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="mb-6">
                <span className="text-4xl font-extrabold">
                  {plan.price.split("/")[0]}
                </span>
                {plan.price.includes("/") && (
                  <span className="text-base text-muted-foreground">
                    /{plan.price.split("/")[1]}
                  </span>
                )}
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className={`w-full ${
                  plan.isPopular ? "bg-red-600 hover:bg-red-700" : ""
                }`}
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPriceId === plan.id}
              >
                {loadingPriceId === plan.id ? "Processing..." : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">Free Tier</h2>
        <p className="text-muted-foreground mb-2">
          Try out the app with a limited set of questions and features.
        </p>
        <ul className="list-disc list-inside inline-block text-left mb-4">
          <li>Access to a sample of 20 questions</li>
          <li>One Standard Practice Quiz attempt</li>
          <li>No progress tracking</li>
        </ul>
        <p className="text-muted-foreground">
          No payment required. Just sign up and start learning!
        </p>
      </div>
    </div>
  );
}
