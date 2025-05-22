import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

export async function POST(request: Request) {
  console.log("API Route: /api/stripe/cancel-subscription HIT");
  try {
    const supabase = createSupabaseServerClient();
    console.log(
      "API Route: Supabase server client initialized for cancel-subscription."
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.warn(
        "API Route: User authentication failed for cancel-subscription."
      );
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }
    console.log(
      "API Route: User successfully authenticated for cancel-subscription:",
      user.id
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("active_stripe_subscription_id, subscription_current_period_end")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "API Route: Error fetching profile for cancel-subscription:",
        profileError
      );
      // Handle case where profile might not exist cleanly if that's expected for some users
      if (profileError.code === "PGRST116") {
        // Standard Supabase error for no rows found
        console.warn(
          `API Route: No profile found for user ${user.id} when attempting to cancel subscription.`
        );
        return NextResponse.json(
          {
            error:
              "User profile not found. Cannot determine subscription status.",
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Error fetching user profile" },
        { status: 500 }
      );
    }

    if (!profile) {
      // Should be caught by PGRST116 but as a fallback
      console.warn(
        `API Route: Profile data is null for user ${user.id} for cancel-subscription.`
      );
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    if (!profile.active_stripe_subscription_id) {
      console.warn(
        `API Route: No active subscription found for user ${user.id} to cancel.`
      );
      return NextResponse.json(
        { error: "No active subscription found to cancel." },
        { status: 400 }
      );
    }

    const subscriptionId = profile.active_stripe_subscription_id;
    console.log(
      `API Route: Attempting to cancel subscription ${subscriptionId} for user ${user.id} at period end.`
    );

    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Type assertion to bypass TypeScript error and add current_period_end property
    const updatedSubscription = (await stripe.subscriptions.retrieve(
      subscriptionId
    )) as Stripe.Subscription & {
      current_period_end?: number;
    };

    console.log(
      "API Route: Retrieved updated subscription object:",
      JSON.stringify(updatedSubscription, null, 2)
    );

    let cancelsAtDateISO: string | null = null;
    let userMessage = "Subscription cancellation initiated.";

    if (updatedSubscription.current_period_end) {
      const cancelsAtDate = new Date(
        updatedSubscription.current_period_end * 1000
      );
      cancelsAtDateISO = cancelsAtDate.toISOString();
      userMessage = `Subscription cancellation initiated. Your access will continue until ${cancelsAtDate.toLocaleDateString()}.`;
      console.log(
        `API Route: Subscription ${subscriptionId} for user ${user.id} successfully set to cancel at period end: ${cancelsAtDateISO}`
      );
    } else {
      console.warn(
        `API Route: Could not determine current_period_end for subscription ${subscriptionId}. The subscription is set to cancel at the end of the current period, but the exact date could not be retrieved from the subscription object.`
      );
      userMessage =
        "Subscription cancellation initiated. Your access will continue until the end of the current billing period.";
    }

    return NextResponse.json({
      message: userMessage,
      subscriptionId: updatedSubscription.id,
      cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end, // Should be true
      cancelsAt: cancelsAtDateISO, // This might be null if current_period_end was not available
    });
  } catch (error: any) {
    console.error(
      "API Route: Error in POST /api/stripe/cancel-subscription:",
      error.message,
      error.stack,
      error
    );
    let errorMessage = "Failed to cancel subscription";
    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = error.message; // Use Stripe's error message if available
    } else if (error.details) {
      errorMessage = error.details;
    }
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}
