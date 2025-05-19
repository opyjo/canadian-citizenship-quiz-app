import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Ensure your Stripe secret key is set in environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

const appUrl = process.env.APP_URL || "http://localhost:3000";

export async function POST(request: Request) {
  console.log("API Route: /api/stripe/create-checkout-session HIT");

  try {
    console.log("API Route: Incoming request headers:", request.headers);
    const requestCookies = request.headers.get("cookie");
    console.log(
      "API Route: Raw cookies from request:",
      requestCookies || "No cookies found"
    );

    const supabase = createSupabaseServerClient();
    console.log("API Route: Supabase server client initialized.");

    const { priceId, quantity = 1 } = await request.json();

    if (!priceId) {
      console.error("API Route: Price ID is required but was not provided.");
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }
    console.log(
      `API Route: Received priceId: ${priceId}, quantity: ${quantity}`
    );

    console.log("API Route: Attempting to get user from Supabase...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log(
      "API Route: supabase.auth.getUser() response - User:",
      JSON.stringify(user, null, 2)
    );
    console.log(
      "API Route: supabase.auth.getUser() response - Error:",
      JSON.stringify(userError, null, 2)
    );

    if (userError || !user) {
      console.warn(
        "API Route: User authentication failed. Condition (userError || !user) is TRUE."
      );
      if (userError)
        console.error(
          "API Route: Supabase auth error details:",
          userError.message,
          userError
        );
      if (!user) console.warn("API Route: User object is null or undefined.");
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }
    console.log("API Route: User successfully authenticated:", user.id);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("API Route: Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Error fetching user profile" },
        { status: 500 }
      );
    }
    console.log(
      "API Route: User profile fetched (or confirmed not existing yet):",
      profile
    );

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      console.log(
        "API Route: Stripe customer ID not found in profile. Creating new Stripe customer for user:",
        user.id,
        "email:",
        user.email
      );
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabaseUUID: user.id,
        },
      });
      stripeCustomerId = customer.id;
      console.log("API Route: Stripe customer created:", stripeCustomerId);

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);

      if (updateProfileError) {
        console.error(
          "API Route: Error updating profile with Stripe ID:",
          updateProfileError
        );
      } else {
        console.log(
          "API Route: Profile updated successfully with Stripe customer ID."
        );
      }
    }

    const price = await stripe.prices.retrieve(priceId);
    const mode = price.type === "recurring" ? "subscription" : "payment";

    console.log(
      `API Route: Creating Stripe Checkout session for customer ${stripeCustomerId}, price ${priceId}, mode ${mode}`
    );
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: mode,
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancelled`,
      metadata: {
        supabaseUUID: user.id,
        priceId: priceId,
      },
    });

    if (!session.id) {
      console.error(
        "API Route: Could not create Stripe Checkout session (session.id is missing)."
      );
      throw new Error("Could not create Stripe Checkout session");
    }
    console.log(
      "API Route: Stripe Checkout session created successfully:",
      session.id
    );
    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error(
      "API Route: Error in POST /api/stripe/create-checkout-session:",
      error.message,
      error.stack,
      error
    );
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
