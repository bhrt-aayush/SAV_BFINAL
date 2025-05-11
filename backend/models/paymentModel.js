import mongoose from "mongoose";

const purchasedItemSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Cart Items Array - Main container for order items
  cartItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  }],

  // Order Summary
  totalPrice: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['khalti'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  // Delivery Information
  deliveryInfo: {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    street: { type: String },
    city: { type: String },
    zipcode: { type: String },
    suggestion: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    formattedAddress: { type: String },
    usingCurrentLocation: { type: Boolean, default: false }
  },
  
  // Order Status and Timestamps
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderPlacedAt: {
    type: Date,
    default: Date.now
  },
  orderConfirmedAt: {
    type: Date
  },
  orderDeliveredAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a 2dsphere index for location-based queries
purchasedItemSchema.index({ 'deliveryInfo.location': '2dsphere' });

// Pre-save middleware to validate deliveryInfo when order is confirmed
purchasedItemSchema.pre('save', function(next) {
  if (this.orderStatus === 'confirmed' && this.deliveryInfo) {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'street', 
      'city', 'zipcode', 'formattedAddress'
    ];
    
    const missingFields = requiredFields.filter(field => !this.deliveryInfo[field]);
    
    if (missingFields.length > 0) {
      return next(new Error(`Missing required delivery info fields: ${missingFields.join(', ')}`));
    }
    
    // Validate location coordinates
    if (!this.deliveryInfo.location.coordinates || 
        this.deliveryInfo.location.coordinates.length !== 2 ||
        !this.deliveryInfo.location.coordinates[0] ||
        !this.deliveryInfo.location.coordinates[1]) {
      return next(new Error('Valid location coordinates are required'));
    }
  }
  next();
});

const PurchasedItem = mongoose.model("PurchasedItem", purchasedItemSchema);
export default PurchasedItem;