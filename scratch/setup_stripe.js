const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setup() {
  try {
    const product = await stripe.products.create({
      name: 'Linktree-clone Yearly Subscription',
      description: '$12/year to keep your page live',
    });

    const price = await stripe.prices.create({
      unit_amount: 1200,
      currency: 'usd',
      recurring: { interval: 'year' },
      product: product.id,
    });

    console.log('SUCCESS');
    console.log('PRODUCT_ID:', product.id);
    console.log('PRICE_ID:', price.id);
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

setup();
