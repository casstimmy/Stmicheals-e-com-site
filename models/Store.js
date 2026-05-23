import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    code: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const StoreSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "" },
    companyName: { type: String, default: "" },
    locations: [LocationSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model("Store", StoreSchema);