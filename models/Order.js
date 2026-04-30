import mongoose from "mongoose";

const CustomerSnapshotSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    type: String,
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    customerSnapshot: CustomerSnapshotSchema,
    items: [
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true},
    price: { type: Number, required: true },
    name: String,
    category: String,
    description: String,
    images: [String],
  },
],

    subtotal: Number,
    shippingCost: Number,
    total: Number,
    status: { type: String, default: "Pending Payment" },
    paid: { type: Boolean, default: false },
    paymentReference: { type: String },
    paymentStatus: { type: String, default: "Pending" },
    paymentChannel: { type: String, default: "paystack" },
    reservationStatus: {
      type: String,
      enum: ["active", "releasing", "released", "finalizing", "finalized"],
      default: "active",
    },
    reservationExpiresAt: Date,
    reservationReleasedAt: Date,
    finalizedAt: Date,
    cancellationReason: String,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
