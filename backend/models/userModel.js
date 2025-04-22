import mongoose from "mongoose";
import PurchasedItem from "./paymentModel.js";

const userSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    cartData:{type:Object, default:{}},
    PurchasedItems:[PurchasedItem.schema],
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date }
},{minimize:false})

const userModel = mongoose.model.user || mongoose.model("user", userSchema);

export default userModel;