import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server"; // Ensure this path is correct

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(request: Request) {
  console.log("API Route: /api/stripe/uncancel-subscription HIT");
  try {
    const supabase = createSupabaseServerClient();
    console.log(
      "API Route: Supabase server client initialized for uncancel-subscription."
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn(
        "API Route: User authentication failed for uncancel-subscription."
      );
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }
    console.log(
      "API Route: User successfully authenticated for uncancel-subscription:",
      user.id
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("active_stripe_subscription_id, cancel_at_period_end") // Select cancel_at_period_end to verify state
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "API Route: Error fetching profile for uncancel-subscription:",
        profileError
      );
      return NextResponse.json(
        { error: "Error fetching user profile" },
        { status: 500 }
      );
    }

    if (!profile) {
      console.warn(
        `API Route: Profile data is null for user ${user.id} for uncancel-subscription.`
      );
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    if (!profile.active_stripe_subscription_id) {
      console.warn(
        `API Route: No active subscription found for user ${user.id} to uncancel.`
      );
      return NextResponse.json(
        { error: "No active subscription found to reactivate." },
        { status: 400 }
      );
    }

    if (profile.cancel_at_period_end === false) {
      console.warn(
        `API Route: Subscription ${profile.active_stripe_subscription_id} for user ${user.id} is not set to cancel.`
      );
      return NextResponse.json(
        {
          message: "Subscription is already set to renew.",
          alreadyActive: true,
        },
        { status: 200 }
      );
    }

    const subscriptionId = profile.active_stripe_subscription_id;
    console.log(
      `API Route: Attempting to uncancel (reactivate) subscription ${subscriptionId} for user ${user.id}.`
    );

    const updatedStripeSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false, // Key change to reactivate renewal
      }
    );

    // Stripe will send a customer.subscription.updated webhook.
    // The webhook handler will be responsible for updating the database (profiles table).
    // This API route primarily informs Stripe and then the client about the immediate action.

    console.log(
      `API Route: Subscription ${subscriptionId} for user ${user.id} successfully set to renew (cancel_at_period_end: false).`
    );

    return NextResponse.json({
      message: "Subscription successfully set to renew.",
      subscriptionId: updatedStripeSubscription.id,
      cancelAtPeriodEnd: updatedStripeSubscription.cancel_at_period_end, // Should be false
    });
  } catch (error: any) {
    console.error(
      "API Route: Error in POST /api/stripe/uncancel-subscription:",
      error.message,
      error.stack,
      error
    );
    let errorMessage = "Failed to reactivate subscription renewal";
    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = error.message;
    } else if (error.details) {
      errorMessage = error.details;
    }
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}
