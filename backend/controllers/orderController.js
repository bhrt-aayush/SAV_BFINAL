import PurchasedItem from '../models/paymentModel.js';

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, totalPrice, deliveryInfo } = req.body;
        const userId = req.user.id;

        if (!cartItems || !totalPrice || !deliveryInfo) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const order = await PurchasedItem.create({
            userId,
            cartItems,
            totalPrice,
            deliveryInfo,
            orderStatus: 'pending',
            orderPlacedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({
            success: false,
            message: 'Error placing order',
            error: error.message
        });
    }
};

export const verifyOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        const order = await PurchasedItem.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error verifying order:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying order',
            error: error.message
        });
    }
};

export const userOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const orders = await PurchasedItem.find({ userId })
            .sort({ orderPlacedAt: -1 });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user orders',
            error: error.message
        });
    }
};

export const listOrders = async (req, res) => {
    try {
        const orders = await PurchasedItem.find().sort({ orderPlacedAt: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error listing orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing orders',
            error: error.message
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and status are required'
            });
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const updatedOrder = await PurchasedItem.findByIdAndUpdate(
            orderId,
            { 
                orderStatus: status,
                ...(status === 'delivered' && { orderDeliveredAt: new Date() })
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
}; 