import mongoose from 'mongoose';

const withSubscription = async (context, session, callback) => {
  
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
  // Get email from session
  const userEmail = session.user.email;

  console.log("userEmail", userEmail)

  // get user from customer collection
  const customer = await Customer.findOne({ email: userEmail });
  console.log("customer", customer)

  const subscriptionStatus = customer.subscription.status;
  console.log("subscriptionStatus", subscriptionStatus)
  // check if user has active subscription
  if (subscriptionStatus != "paid") {
    return {
      redirect: {
        destination: '/app/user-profile',
        permanent: false,
      },
    };
  }

  return callback(context)
};

export default withSubscription;
