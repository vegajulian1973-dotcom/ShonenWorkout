import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY);
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Plan de Entrenamiento Rango S',
                description: 'Desbloqueo de rutina personalizada Solo Leveling',
                images: ['https://tu-sitio.com/logo.png'], 
              },
              unit_amount: 1000, // 10.00 USD (en centavos)
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/mi-plan?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/planes`,
      });

      res.status(200).json({ id: session.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}