import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    cartItems: { type: Array, required: true },        // changed from "items"
    totalPrice: { type: Number, required: true },       // changed from "amount"
    deliveryInfo: { type: Object, required: true },     // changed from "address"
    orderStatus: { type: String, default: "pending" },  // changed from "status"
    orderPlacedAt: { type: Date, default: Date.now },   // changed from "date"
    payment: { type: Boolean, default: false },
  });
  

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)

export default orderModel;