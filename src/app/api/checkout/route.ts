import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Checkout request body:", body);
    
    const { userId, email, username } = body;

    if (!userId || !email) {
      console.error("Missing userId or email in request");
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("Checking for existing customer ID for user:", userId);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Supabase profile fetch error:", profileError);
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      console.log("Creating new Stripe customer for:", email);
      const customer = await stripe.customers.create({
        email,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
      
      console.log("Saving customer ID to database:", customerId);
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({ 
          id: userId, 
          stripe_customer_id: customerId,
          username: username || 'user_' + userId.slice(0, 5) // Fallback if username missing
        });

      if (updateError) {
        console.error("Database update error:", updateError);
        // Continue anyway as we have the customerId
      }
    }

    console.log("Creating checkout session for customer:", customerId);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=success&username=${username || 'user'}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?status=cancelled`,
      metadata: {
        supabase_user_id: userId,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
        },
      },
    });

    console.log("Checkout session created:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("CRITICAL Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
