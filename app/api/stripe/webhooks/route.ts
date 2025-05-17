import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase-admin"; // Using path alias

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Helper function to update user profile in Supabase
async function updateUserAccess(
  supabaseAdmin: any, // Consider typing this more strictly if possible
  userId: string,
  updates: Partial<any> // Consider defining a type for profile updates
) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) {
    console.error(`Error updating profile for user ${userId}:`, error);
    throw error;
  }
  console.log(`Profile updated for user ${userId} with:`, updates);
}

export async function POST(req: Request) {
  const buf = await req.text();
  const headerPayload = await headers(); // Added await here
  const sig = headerPayload.get("stripe-signature");

  if (!sig) {
    console.error("Webhook error: Missing stripe-signature header");
    return NextResponse.json(
      { error: "Webhook error: Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log("Received Stripe event:", event.type); // Log only type initially for brevity

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(
          "Processing checkout.session.completed:",
          session.id,
          "Metadata:",
          session.metadata
        );
        const supabaseUUID = session.metadata?.supabaseUUID;
        const priceId = session.metadata?.priceId;

        if (!supabaseUUID) {
          console.error(
            "Missing supabaseUUID in checkout session metadata for checkout.session.completed"
          );
          break;
        }

        if (session.mode === "payment" && session.payment_status === "paid") {
          console.log(
            `Processing one-time payment for user ${supabaseUUID}, priceId: ${priceId}`
          );
          await updateUserAccess(supabaseAdmin, supabaseUUID, {
            access_level: "lifetime",
            purchased_lifetime_price_id: priceId,
            active_stripe_subscription_id: null,
            subscription_current_period_end: null,
            active_monthly_plan_price_id: null,
          });
        } else if (session.mode === "subscription" && session.subscription) {
          // session.subscription is usually an ID string, but can be an object if expanded
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

          const subscriptionDetails = await stripe.subscriptions.retrieve(
            subscriptionId,
            { expand: ["items.data.price"] } // Ensure price is expanded
          );
          console.log(
            `Processing subscription for user ${supabaseUUID}, subscriptionId: ${subscriptionDetails.id}, priceId: ${subscriptionDetails.items.data[0]?.price.id}`
          );
          if (!subscriptionDetails.items.data[0]?.price.id) {
            console.error(
              "Price ID missing in subscription items for checkout.session.completed:",
              subscriptionDetails.id
            );
            break;
          }
          await updateUserAccess(supabaseAdmin, supabaseUUID, {
            access_level: "subscribed_monthly",
            active_stripe_subscription_id: subscriptionDetails.id,
            subscription_current_period_end: new Date(
              subscriptionDetails.current_period_end * 1000
            ).toISOString(),
            active_monthly_plan_price_id:
              subscriptionDetails.items.data[0].price.id,
            purchased_lifetime_price_id: null,
          });
        }
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Processing invoice.payment_succeeded:", invoice.id);
        // invoice.subscription is typically an ID string for this event.
        // The Stripe.Invoice type *should* have this property.
        // If TypeScript errors here, your Stripe type definitions are likely the issue.
        const invSubscriptionId = invoice.subscription;

        if (invSubscriptionId && typeof invSubscriptionId === "string") {
          const subscriptionDetails = await stripe.subscriptions.retrieve(
            invSubscriptionId,
            { expand: ["items.data.price"] } // Ensure price is expanded
          );
          const customerId =
            typeof subscriptionDetails.customer === "string"
              ? subscriptionDetails.customer
              : subscriptionDetails.customer.id;

          const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profileError) {
            console.error(
              `Error fetching profile for Stripe customer ID: ${customerId} during invoice.payment_succeeded: ${profileError.message}`
            );
            break;
          }

          if (profile?.id) {
            const userId = profile.id;
            console.log(
              `Processing recurring subscription payment for user ${userId}, subscriptionId: ${subscriptionDetails.id}`
            );
            if (!subscriptionDetails.items.data[0]?.price.id) {
              console.error(
                "Price ID missing in subscription items for invoice.payment_succeeded:",
                subscriptionDetails.id
              );
              break;
            }
            await updateUserAccess(supabaseAdmin, userId, {
              subscription_current_period_end: new Date(
                subscriptionDetails.current_period_end * 1000
              ).toISOString(),
              access_level: "subscribed_monthly",
              active_monthly_plan_price_id:
                subscriptionDetails.items.data[0].price.id,
            });
          } else {
            console.error(
              `Could not find user profile for Stripe customer ID: ${customerId} during invoice.payment_succeeded`
            );
          }
        } else if (invSubscriptionId) {
          // Handle case where invoice.subscription might be an expanded object (less common for this event)
          console.warn(
            `Invoice ${invoice.id} has an unexpected format for subscription field:`,
            invSubscriptionId
          );
        }
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const sub = event.data.object as Stripe.Subscription;
        // The Stripe.Subscription type *should* have current_period_end and items.
        // If TypeScript errors here, your Stripe type definitions are likely the issue.
        console.log(
          `Processing ${event.type} for subscription: ${sub.id}, status: ${sub.status}`
        );

        const customerIdForSubUpdate =
          typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const { data: profileForSubUpdate, error: profileForSubUpdateError } =
          await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", customerIdForSubUpdate)
            .single();

        if (profileForSubUpdateError) {
          console.error(
            `Error fetching profile for Stripe customer ID: ${customerIdForSubUpdate} during ${event.type}: ${profileForSubUpdateError.message}`
          );
          break;
        }

        if (profileForSubUpdate?.id) {
          const userId = profileForSubUpdate.id;
          if (sub.status === "active") {
            if (!sub.items.data[0]?.price.id) {
              console.error(
                `Price ID missing in subscription items for ${event.type}:`,
                sub.id
              );
              break;
            }
            await updateUserAccess(supabaseAdmin, userId, {
              access_level: "subscribed_monthly",
              active_stripe_subscription_id: sub.id,
              subscription_current_period_end: new Date(
                sub.current_period_end * 1000
              ).toISOString(),
              active_monthly_plan_price_id: sub.items.data[0].price.id,
            });
          } else {
            // Handles 'canceled', 'past_due', 'unpaid', etc.
            // If 'canceled' and cancel_at_period_end is true, access might still be valid until period end.
            // This simplified logic revokes access for any non-active status.
            let accessLevel = "free"; // Default for non-active
            let activeSubId: string | null = sub.id;
            let activePriceId: string | null = null;

            if (sub.status === "canceled") {
              activeSubId = null; // Subscription is definitively canceled
            } else if (
              (sub.status === "past_due" || sub.status === "unpaid") &&
              sub.cancel_at_period_end &&
              sub.current_period_end * 1000 > Date.now()
            ) {
              // Still within grace period or before cancellation takes effect
              accessLevel = "subscribed_monthly"; // Or a specific 'delinquent' status
              activePriceId = sub.items.data[0]?.price.id || null;
              console.log(
                `Subscription ${sub.id} is ${sub.status} but cancel_at_period_end is set. Access maintained until period end.`
              );
            } else if (
              sub.status === "incomplete_expired" ||
              sub.status === "incomplete"
            ) {
              activeSubId = null;
            }

            await updateUserAccess(supabaseAdmin, userId, {
              access_level: accessLevel,
              active_stripe_subscription_id: activeSubId,
              active_monthly_plan_price_id: activePriceId,
              // Optionally, clear subscription_current_period_end or set based on logic
              // subscription_current_period_end: (accessLevel !== "free" && sub.current_period_end) ? new Date(sub.current_period_end * 1000).toISOString() : null,
            });
          }
        } else {
          console.error(
            `Could not find user profile for Stripe customer ID: ${customerIdForSubUpdate} during ${event.type}`
          );
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error: any) {
    console.error(
      `Error processing specific event ${event.type || "unknown"}:`,
      error.message,
      error.stack
    );
    // Optionally, return a 500 error to Stripe if processing fails critically,
    // so Stripe knows to retry (if the error is transient).
    // return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
