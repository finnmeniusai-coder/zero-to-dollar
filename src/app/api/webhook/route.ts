import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27-acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const subscriptionId = session.subscription as string;

        if (userId) {
          // Fetch existing data first
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_data")
            .eq("id", userId)
            .single();
          
          const fullData = (profile?.full_data as any) || {};
          fullData.stripeSubscriptionId = subscriptionId;

          await supabase
            .from("profiles")
            .update({
              is_published: true,
              full_data: fullData,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;

        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_data")
            .eq("id", userId)
            .single();
          
          const fullData = (profile?.full_data as any) || {};
          delete fullData.stripeSubscriptionId;

          await supabase
            .from("profiles")
            .update({
              is_published: false,
              full_data: fullData,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        
        // Find by partial match in JSON column
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .contains("full_data", { stripeSubscriptionId: subscriptionId })
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              is_published: false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
