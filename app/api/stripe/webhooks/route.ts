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

  // Log the full event data object for debugging if needed, especially for unhandled types
  if (event.type === "customer.created") {
    console.log(
      "Full event data for customer.created:",
      JSON.stringify(event.data.object, null, 2)
    );
  }

  try {
    switch (event.type) {
      case "customer.created":
        const customer = event.data.object as Stripe.Customer;
        console.log(
          "RAW customer.created OBJECT:",
          JSON.stringify(customer, null, 2)
        );
        const supabaseUUIDForCustomer = customer.metadata?.supabaseUUID;
        const stripeCustomerId = customer.id;

        if (supabaseUUIDForCustomer && stripeCustomerId) {
          console.log(
            `Processing customer.created for supabaseUUID: ${supabaseUUIDForCustomer}, stripe_customer_id: ${stripeCustomerId}`
          );
          try {
            await updateUserAccess(supabaseAdmin, supabaseUUIDForCustomer, {
              stripe_customer_id: stripeCustomerId,
            });
          } catch (updateError) {
            console.error(
              `Error updating profile with stripe_customer_id during customer.created:`,
              updateError
            );
            // Still return 200 to Stripe, error is logged
          }
        } else {
          console.warn(
            "WARN: customer.created - Missing supabaseUUID in metadata or customer ID.",
            { supabaseUUIDForCustomer, stripeCustomerId }
          );
        }
        break;

      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(
          "RAW checkout.session.completed OBJECT:",
          JSON.stringify(session, null, 2)
        );
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

          // Correctly expect Stripe.Subscription directly
          const subscriptionDetails: Stripe.Subscription =
            await stripe.subscriptions.retrieve(
              subscriptionId,
              { expand: ["items.data.price"] } // Ensure price is expanded
            );
          console.log(
            "DEBUG: checkout.session.completed - Retrieved subscriptionDetails:",
            JSON.stringify(subscriptionDetails, null, 2)
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

          let calculatedPeriodEnd: string | null = null;
          // Access current_period_end from the first subscription item
          if (
            subscriptionDetails.items?.data[0] &&
            typeof subscriptionDetails.items.data[0].current_period_end ===
              "number"
          ) {
            calculatedPeriodEnd = new Date(
              subscriptionDetails.items.data[0].current_period_end * 1000
            ).toISOString();
          } else {
            console.warn(
              `WARN: checkout.session.completed - subscriptionDetails.items.data[0].current_period_end is not a number for sub ${subscriptionDetails.id}:`,
              subscriptionDetails.items?.data[0]?.current_period_end
            );
            if (session.invoice && typeof session.invoice === "string") {
              try {
                const invoiceData = await stripe.invoices.retrieve(
                  session.invoice as string,
                  { expand: ["lines.data"] }
                );
                if (invoiceData.lines.data[0]?.period?.end) {
                  calculatedPeriodEnd = new Date(
                    invoiceData.lines.data[0].period.end * 1000
                  ).toISOString();
                  console.log(
                    `Fell back to invoice line item period end: ${calculatedPeriodEnd}`
                  );
                }
              } catch (invError) {
                console.error(
                  "Error fetching invoice data for fallback period end:",
                  invError
                );
              }
            }
          }

          await updateUserAccess(supabaseAdmin, supabaseUUID, {
            access_level: "subscribed_monthly",
            active_stripe_subscription_id: subscriptionDetails.id,
            subscription_current_period_end: calculatedPeriodEnd, // Use the safely calculated value
            active_monthly_plan_price_id:
              subscriptionDetails.items.data[0].price.id,
            purchased_lifetime_price_id: null,
            stripe_subscription_status: "active",
            cancel_at_period_end:
              subscriptionDetails.cancel_at_period_end || false,
          });
        }
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        console.log(
          "RAW invoice.payment_succeeded OBJECT:",
          JSON.stringify(invoice, null, 2)
        );
        console.log("Processing invoice.payment_succeeded:", invoice.id);

        // Correctly extract subscription ID from invoice
        let invSubscriptionId: string | null = null;
        if (
          invoice.lines?.data[0]?.parent?.subscription_item_details
            ?.subscription
        ) {
          invSubscriptionId =
            invoice.lines.data[0].parent.subscription_item_details.subscription;
        } else if (invoice.parent?.subscription_details?.subscription) {
          const subDetail = invoice.parent.subscription_details.subscription;
          if (typeof subDetail === "string") {
            invSubscriptionId = subDetail;
          } else if (
            subDetail &&
            typeof subDetail === "object" &&
            subDetail.id
          ) {
            invSubscriptionId = subDetail.id; // It's an expanded Subscription object
          }
        }
        // Removed typeof invoice.subscription === 'string' as it's not reliably present

        if (!invSubscriptionId) {
          console.error(
            `ERROR: invoice.payment_succeeded - Could not determine subscription ID from invoice ${invoice.id}`
          );
          // If you have an invoice but no subscription ID, it might be for a one-time payment product invoice.
          // You might want to handle this case specifically if applicable (e.g. check invoice.billing_reason)
          if (invoice.billing_reason === "manual") {
            // Example: one-time payment invoice created manually or via API
            console.log(
              `Invoice ${invoice.id} appears to be for a one-time payment or not subscription related.`
            );
            // Potentially find user via customer ID and update if it was for a lifetime product based on line items
          } else {
            // If it was expected to be a subscription, this is an issue.
          }
          break;
        }

        console.log(
          `DEBUG: invoice.payment_succeeded - Extracted invSubscriptionId: ${invSubscriptionId}`
        );

        // The old cast `invoice.subscription as string | Stripe.Subscription | null` is removed as we now extract it.

        if (invSubscriptionId) {
          // Already checked if it's a string implicitly by assignment from string fields
          const subscriptionDetails: Stripe.Subscription =
            await stripe.subscriptions.retrieve(
              invSubscriptionId,
              { expand: ["items.data.price"] } // Ensure price is expanded
            );
          console.log(
            "DEBUG: invoice.payment_succeeded - Retrieved subscriptionDetails:",
            JSON.stringify(subscriptionDetails, null, 2)
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
              `Error fetching profile for Stripe customer ID: ${customerId} during invoice.payment_succeeded (expanded sub): ${profileError.message}`
            );
            break;
          }

          if (profile?.id) {
            const userId = profile.id;
            console.log(
              `Processing recurring subscription payment for user ${userId}, subscriptionId: ${subscriptionDetails.id} (from expanded invoice sub)`
            );
            if (!subscriptionDetails.items.data[0]?.price.id) {
              console.error(
                "Price ID missing in subscription items for invoice.payment_succeeded (expanded sub):",
                subscriptionDetails.id
              );
              break;
            }

            let invCalcPeriodEnd: string | null = null;
            // Access current_period_end from the first subscription item
            if (
              subscriptionDetails.items?.data[0] &&
              typeof subscriptionDetails.items.data[0].current_period_end ===
                "number"
            ) {
              invCalcPeriodEnd = new Date(
                subscriptionDetails.items.data[0].current_period_end * 1000
              ).toISOString();
            } else {
              console.warn(
                `WARN: invoice.payment_succeeded - subscriptionDetails.items.data[0].current_period_end is not a number for sub ${subscriptionDetails.id}:`,
                subscriptionDetails.items?.data[0]?.current_period_end
              );
              if (typeof invoice.period_end === "number") {
                invCalcPeriodEnd = new Date(
                  invoice.period_end * 1000
                ).toISOString();
                console.log(
                  `Fell back to invoice.period_end: ${invCalcPeriodEnd}`
                );
              }
            }

            await updateUserAccess(supabaseAdmin, userId, {
              subscription_current_period_end: invCalcPeriodEnd, // Use the safely calculated value
              access_level: "subscribed_monthly",
              active_monthly_plan_price_id:
                subscriptionDetails.items.data[0].price.id,
              stripe_subscription_status: "active",
              cancel_at_period_end:
                subscriptionDetails.cancel_at_period_end || false,
            });
          } else {
            console.error(
              `Could not find user profile for Stripe customer ID: ${customerId} during invoice.payment_succeeded (expanded sub)`
            );
          }
        } else if (invSubscriptionId) {
          console.warn(
            `Invoice ${invoice.id} has an unexpected format for subscription field:`,
            invSubscriptionId
          );
        }
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const sub = event.data.object as Stripe.Subscription;
        console.log(
          "RAW customer.subscription OBJECT (updated/deleted):",
          JSON.stringify(sub, null, 2)
        );
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
            // For sub event, check if current_period_end is top-level or nested
            let subEventPeriodEnd: string | null = null;
            if (
              sub.items?.data[0] &&
              typeof sub.items.data[0].current_period_end === "number"
            ) {
              subEventPeriodEnd = new Date(
                sub.items.data[0].current_period_end * 1000
              ).toISOString();
            } else {
              console.warn(
                `WARN: ${event.type} - sub.items.data[0].current_period_end is not a number for sub ${sub.id}:`,
                sub.items?.data[0]?.current_period_end
              );
            }

            await updateUserAccess(supabaseAdmin, userId, {
              access_level: "subscribed_monthly",
              active_stripe_subscription_id: sub.id,
              subscription_current_period_end: subEventPeriodEnd,
              active_monthly_plan_price_id: sub.items.data[0].price.id,
              stripe_subscription_status: "active",
              cancel_at_period_end: sub.cancel_at_period_end || false,
            });
          } else {
            // Handles 'canceled', 'past_due', 'unpaid', etc.
            // If 'canceled' and cancel_at_period_end is true, access might still be valid until period end.
            // This simplified logic revokes access for any non-active status.
            let accessLevel = "free"; // Default for non-active
            let activeSubId: string | null = sub.id;
            let activePriceId: string | null = null;
            let subFinalPeriodEnd: string | null = null; // For retaining access until period end if applicable

            // Try to get the period end (primarily from items, fallback to top-level)
            if (
              sub.items?.data[0] &&
              typeof sub.items.data[0].current_period_end === "number"
            ) {
              subFinalPeriodEnd = new Date(
                sub.items.data[0].current_period_end * 1000
              ).toISOString();
            } else if (!sub.items?.data[0] && sub.status !== "canceled") {
              // Only warn if not canceled and items are missing, as canceled subs might have no items or period end is irrelevant
              console.warn(
                `WARN: ${event.type} - sub.items.data[0].current_period_end is not available for sub ${sub.id} (status: ${sub.status})`,
                sub.items?.data[0]?.current_period_end
              );
            }

            if (sub.status === "canceled") {
              activeSubId = null;
              // If cancel_at_period_end was true, user might retain access until subFinalPeriodEnd
              // Your logic might need to differentiate between immediate cancel and cancel at period end.
              // For now, if status is canceled, we revoke access, but period_end could be used for UI.
            } else if (
              (sub.status === "past_due" || sub.status === "unpaid") &&
              sub.cancel_at_period_end &&
              subFinalPeriodEnd && // Ensure we have a period end
              new Date(subFinalPeriodEnd).getTime() > Date.now()
            ) {
              accessLevel = "subscribed_monthly";
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
              subscription_current_period_end:
                accessLevel !== "free" && subFinalPeriodEnd
                  ? subFinalPeriodEnd
                  : null,
              stripe_subscription_status: sub.status,
              cancel_at_period_end:
                sub.cancel_at_period_end || sub.status === "canceled",
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
