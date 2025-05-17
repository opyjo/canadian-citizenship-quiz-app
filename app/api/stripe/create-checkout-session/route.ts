import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Ensure your Stripe secret key is set in environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

const appUrl = process.env.APP_URL || "http://localhost:3000";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  // const { data: { user }, error: userError } = await supabase.auth.getUser();
  // console.log("API Route: User object:", user);
  // console.log("API Route: User error:", userError);

  const { priceId, quantity = 1 } = await request.json();

  if (!priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not authenticated (API Route):");
      if (userError) console.error("Supabase auth error:", userError.message);
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

    // PGRST116: "No rows found" - this is expected if the profile/customer_id doesn't exist yet.
    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Error fetching user profile" },
        { status: 500 }
      );
    }

    let stripeCustomerId = profile?.stripe_customer_id;

    if (!stripeCustomerId) {
      console.log(
        "Creating Stripe customer for user:",
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
      console.log("Stripe customer created:", stripeCustomerId);

      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);

      if (updateProfileError) {
        // It's good to log this, but you might not want to fail the entire request
        // if the primary operation (creating Stripe customer) succeeded.
        console.error(
          "Error updating profile with Stripe ID:",
          updateProfileError
        );
      }
    }

    const price = await stripe.prices.retrieve(priceId);
    const mode = price.type === "recurring" ? "subscription" : "payment";

    console.log(
      `Creating Stripe Checkout session for customer ${stripeCustomerId}, price ${priceId}, mode ${mode}`
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
      throw new Error("Could not create Stripe Checkout session");
    }
    console.log("Stripe Checkout session created:", session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error(
      "Error creating Stripe Checkout session:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
