const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1TO55KCN9XEzgLUvGilhy8hj',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/dashboard?status=success&username=testuser',
      cancel_url: 'http://localhost:3000/dashboard?status=cancelled',
      metadata: {
        supabase_user_id: 'test_id',
      },
    });
    console.log('Success session:', session.id);
  } catch (err) {
    console.error('Failed session:', err.message);
  }
}

test();
