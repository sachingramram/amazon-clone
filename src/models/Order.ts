import { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    userId: { type: String, required: true }, // "guest" if not signed in
    items: [
      {
        productId: { type: String, required: true },
        title: String,
        price: Number, // minor units
        quantity: Number,
        image: String,
      },
    ],
    amount: Number, // total in minor units
    currency: { type: String, default: "INR" },
    status: { type: String, default: "paid" }, // paid | failed | return_requested | returned

    // Shipping / contact (dummy allowed)
    shipping: {
      name: String,
      email: String,
      address1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    // Payment (dummy)
    payment: {
      method: { type: String, default: "card" },
      last4: String,
    },

    // Kept from older stripe version for compatibility
    stripeSessionId: String,
    stripePaymentIntentId: String,
  },
  { timestamps: true }
);

export default models.Order || model("Order", OrderSchema);
