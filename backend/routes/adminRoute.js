import express from 'express';
import PurchasedItem from '../models/paymentModel.js';
import { getTotalUsers, deleteUser } from '../controllers/userManagementController.js';

const adminRouter = express.Router();

// GET all orders (PurchasedItems)
adminRouter.get('/list-all-orders', async (req, res) => {
  try {
    const orders = await PurchasedItem.find().sort({ orderPlacedAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

// User Management Routes
adminRouter.get('/users', getTotalUsers);
adminRouter.delete('/users/:id', deleteUser);

export default adminRouter; 