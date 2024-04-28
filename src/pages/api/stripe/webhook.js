import { buffer } from 'micro';
import { on } from 'nodemailer/lib/xoauth2';
import Stripe from 'stripe';

export const config = {
    api: {
        bodyParser: false,
    },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const onCheckoutSessionCompleted = async (session) => {
    console.log(`Payment was successful!`);
    console.log(session);
    
    // Add user to database

    // Send email to user

};


const webhookHandler = async (req, res) => {
    if (req.method === 'POST') {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        let event;

    
       
        try {
            event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET );
           
        } catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
          case 'checkout.session.completed':
            const session = event.data.object;
            console.log(`checkout session completed !`);
            console.log(event)

            onCheckoutSessionCompleted(session);
            break;

            case 'setup_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(`PaymentIntent was successful!`);
                console.log(event)
                break;

            case 'customer.updated':
              console.log(`customer updated`);
              console.log(event)
              break;

            case 'invoice.finalized':
              console.log(`invoice finalized`);
              console.log(event)
              break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
};

export default webhookHandler;
