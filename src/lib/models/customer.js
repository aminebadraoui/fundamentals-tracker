import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  email: String,
  customerId: String,
  subscription: {
    paymentLink: String,
    subscriptionId: String,
    status: String,
  },
});

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

export default Customer;