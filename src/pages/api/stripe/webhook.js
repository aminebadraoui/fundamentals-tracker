import { buffer } from 'micro';
import Stripe from 'stripe';
import mongoose from 'mongoose';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
mongoose.connect(process.env.MONGODB_URI);

const customerSchema = new mongoose.Schema({
  email: String,
  customerId: String,
  subscription: {
    paymentLink: String,
    subscription: String,
    status: String,
  },
});

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

const onCheckoutSessionCompleted = async (session) => {
  console.log(`Payment was successful!`);
  console.log(session);

  const customerId = session.customer;
  const customerEmail = session.customer_details.email;
  const customerName = session.customer_details.name;
  const paymentLink = session.payment_link;
  const paymentStatus = session.payment_status;
  const subscriptionId = session.subscription;

  const subscription = {
    paymentLink: paymentLink,
    subscription: subscriptionId,
    status: paymentStatus,
  };

  console.log(session.customer_details);
  console.log(session.customer_details.email);

  console.log(customerEmail);

  try {
    let customer = await Customer.findOne({ email: customerEmail });
    if (customer) {
      // Customer exists, update their subscription
      customer.subscription = subscription;
      await customer.save();

      console.log(`Subscription updated for ${customerEmail}`);
      // TODO: send email to user
    } else {
      // Customer does not exist, create new one
      const newCustomer = new Customer({
        email: customerEmail,
        customerId: customerId,
        subscription: subscription,
      });

      await newCustomer.save();
      console.log(`New customer created with subscription for ${customerEmail}`);

      // TODO: send email to user
    }
  } catch (error) {
    console.error(`Error handling checkout.session.completed event: ${error}`);
    // Handle the error appropriately
  }
};

const webhookHandler = async (req, res) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await onCheckoutSessionCompleted(session);
        break;

      case 'setup_intent.succeeded':
        const paymentIntent = event.data.object;
        // Handle setup intent success
        break;

      case 'customer.updated':
        // Handle customer update
        break;

      case 'invoice.finalized':
        // Handle invoice finalized
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
