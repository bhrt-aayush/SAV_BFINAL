import mongoose from "mongoose";

const purchasedItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  totalPrice: { type: Number, required: true }, // Price in paisa (as required by Khalti)
  quantity: { type: Number, required: true, default: 1 },
  productImage: { type: String },
  paymentMethod: { type: String, enum: ['khalti'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

const PurchasedItem = mongoose.model("PurchasedItem", purchasedItemSchema);
export default PurchasedItem;