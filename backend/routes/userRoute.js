import express from 'express';
import { loginUser, registerUser, verifyOTP, resendVerification, initializeKhaltiPayment, verifyKhaltiPayment } from '../controllers/userController.js';
import paymentModel from '../models/paymentModel.js';
import foodModel from '../models/foodModel.js';
import { fetchUser } from '../controllers/helper.js';
import userModel from '../models/userModel.js';
import PurchasedItem from '../models/paymentModel.js';


const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/verify-otp', verifyOTP);
userRouter.post('/resend-verification', resendVerification);
userRouter.get('/list', async (req, res) => {
  try {
    // Fetch all users
    const users = await userModel.find({});
    res.json({ success: true, data: users });

  } catch (error) {
    console.error('Error fetching user list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
userRouter.get('/complete-khalti-payment', async (req, res) => {
  const { pidx, transaction_id, amount, purchase_order_id, status } = req.query;

  try {
    if (status === 'failed') {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failure?reason=insufficient_balance`);
    }

    const paymentInfo = await verifyKhaltiPayment(pidx);

    if (
      paymentInfo.status !== 'Completed' ||
      paymentInfo.transaction_id !== transaction_id ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failure?reason=verification_failed`);
    }

    const purchasedItem = await PurchasedItem.findById(purchase_order_id);
    if (!purchasedItem || purchasedItem.totalPrice !== Number(amount)) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failure?reason=purchased_item_not_found_or_amount_mismatch`
      );
    }

    await PurchasedItem.findByIdAndUpdate(purchase_order_id, { status: 'completed' });

    // Create Payment with productImage from PurchasedItem
    const payment = await paymentModel.create({
      transactionId: transaction_id,
      pidx,
      purchasedItemId: purchasedItem._id,
      amount: Number(amount),
      productImage: purchasedItem.productImage,
      dataFromVerificationReq: paymentInfo,
      apiQueryFromUser: req.query,
      paymentGateway: 'khalti',
      status: 'success',
    });

    // Fetch the product associated with the purchased item using MongoDB _id
    const product = await foodModel.findById(purchasedItem.product);

    // Remove the purchased item from user's favoriteData
    const user = await userModel.findOne({ 'favoriteData': { $exists: true } });
    if (user && user.favoriteData && product) {
      const itemId = product.id || product._id.toString();

      if (user.favoriteData[itemId] && user.favoriteData[itemId] > 0) {
        user.favoriteData[itemId] = 0;
        delete user.favoriteData[itemId];
        await userModel.findOneAndUpdate(
          { _id: user._id },
          { favoriteData: user.favoriteData },
          { new: true }
        );
        console.log(`Removed item ${itemId} from favorites for user ${user._id}`);
      }
    }

    const orderDetails = {
      productName: product ? product.name : 'Unknown Product',
      quantity: purchasedItem.quantity,
      size: purchasedItem.size,
      totalPrice: purchasedItem.totalPrice, // Keep as is - no conversion needed
      productImage: purchasedItem.productImage,
    };

    res.redirect(`${process.env.FRONTEND_URL}/payment-success?transaction_id=${transaction_id}`);
  } catch (error) {
    console.error('Error verifying Khalti payment:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failure?reason=server_error`);
  }
});
// Initialize Khalti payment
userRouter.post('/initialize-khalti', fetchUser, async (req, res) => {
  try {
    console.log('Received request to /initialize-khalti:', req.body);
    const { cartItems, totalPrice } = req.body;

    if (!cartItems || !totalPrice) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Access user ID from the JWT data structure
    const userId = req.user.id || req.user._id || req.user;
    const user = await userModel.findById(userId).select('name email phone');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const purchasedItems = [];
    let calculatedTotalPrice = 0;

    // Create purchased items and calculate total price
    for (const item of cartItems) {
      // Use findById to query by MongoDB _id instead of numeric id
      const product = await foodModel.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      const productPrice = product.new_price || product.price;
      const itemTotalPrice = productPrice * item.quantity;
      calculatedTotalPrice += itemTotalPrice;

      const purchasedItem = await PurchasedItem.create({
        product: product._id, // Use MongoDB _id here
        totalPrice: itemTotalPrice, // Keep as is - no conversion needed
        quantity: item.quantity,
        size: item.size || 'N/A',
        productImage: product.image,
        paymentMethod: 'khalti',
        status: 'pending'
      });
      purchasedItems.push(purchasedItem);

      const update_user = await userModel.findByIdAndUpdate(
        userId,
        { $set: { [`cartData.${item.productId}`]: 0 } },
        { new: true }
      );
      console.log('Updated user cart:', update_user);
    }

    // Check if the calculated total price matches the provided total price
    // Don't strictly compare - allow for rounding differences
    const DeliveryFee = 50; // Example delivery fee
    if (Math.abs(calculatedTotalPrice - totalPrice + DeliveryFee) > 1) {
      return res.status(400).json({
        success: false,
        message: 'Total price mismatch',
        expected: calculatedTotalPrice,
        received: totalPrice,
      });
    }


    // Prepare data for Khalti API
    const khaltiData = {
      totalPrice: totalPrice, // Keep as is - no conversion
      orderId: purchasedItems[0]._id.toString(), // Use first item's ID
      orderName: 'Food Order',
      customerName: user.name || 'Customer',
      customerEmail: user.email || 'customer@example.com',
      customerPhone: user.phone || '9800000000',
    };

    // Call Khalti API
    const paymentResponse = await initializeKhaltiPayment(
      'http://localhost:5174/api/user',
      khaltiData
    );

    // Fetch product names for order details
    const orderDetails = await Promise.all(
      purchasedItems.map(async (item) => {
        const product = await foodModel.findById(item.product);
        return {
          productName: product.name,
          quantity: item.quantity,
          size: item.size,
          totalPrice: item.totalPrice, // Keep as is - no conversion needed
          productImage: item.productImage,
        };
      })
    );

    res.json({
      success: true,
      purchasedItems,
      payment: paymentResponse,
      orderDetails,
    });
  } catch (error) {
    console.error('Error in /initialize-khalti:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.message,
    });
  }
});
// Khalti API credentials
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_VERIFY_URL = 'https://khalti.com/api/v2/payment/verify/';

// Payment initialization (Optional if needed in your schema)
userRouter.post('/initiate-payment', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const payment = new Payment({
      user: userId,
      amount,
      status: 'PENDING',
    });
    await payment.save();

    res.json({ message: 'Payment initiated', paymentId: payment._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// List purchased items
userRouter.get('/list-purchased-items/:userID', async (req, res) => {
  try {
    const userId = req.params.userID;
    console.log('Attempting to find items for user:', userId);

    const purchasedItems = await PurchasedItem.find({ userId });
    console.log('Query result:', purchasedItems);

    if (!purchasedItems || purchasedItems.length === 0) {
      return res.status(404).json({ message: 'No purchased items found' });
    }

    res.json({ purchasedItems });
  } catch (error) {
    console.error('Error fetching purchased items:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Verify Khalti payment
userRouter.post('/verify-payment', async (req, res) => {
  try {
    const { token, amount, userId, purchasedItemId } = req.body;

    const purchasedItem = await PurchasedItem.findById(purchasedItemId);
    if (!purchasedItem) return res.status(404).json({ message: 'Purchased item not found' });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify the Khalti payment
    const response = await axios.post(KHALTI_VERIFY_URL, {
      token,
      amount,
    }, {
      headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` }
    });

    if (response.data.state.name === 'Completed') {
      // Update the purchased item with completed status
      purchasedItem.status = 'completed';
      await purchasedItem.save();

      // Clear the user's cart after successful payment if needed
      user.cartData = {};
      await user.save();

      return res.json({
        message: 'Payment verified successfully',
        purchasedItem,
        transactionId: response.data.idx
      });
    }

    // If payment verification failed
    purchasedItem.status = 'failed';
    await purchasedItem.save();

    res.status(400).json({ message: 'Payment verification failed' });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      message: 'Payment verification error',
      error: error.message
    });
  }
});

export default userRouter;
