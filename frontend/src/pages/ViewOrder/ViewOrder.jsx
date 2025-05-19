import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ViewOrder.css';
import { assets } from '../../../public/assets/admin_assets/assets.js';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/user/list-purchased-items/me', {
          headers: { 'auth-token': token }
        });
        // Sort orders by date, newest first
        const sortedOrders = (response.data.purchasedItems || []).sort((a, b) => {
          const dateA = new Date(a.orderPlacedAt || 0);
          const dateB = new Date(b.orderPlacedAt || 0);
          return dateB - dateA;
        });
        setOrders(sortedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="order-container">
      <h2 className="order-title">My Orders</h2>
      {orders.length === 0 ? (
        <div className="no-orders">No orders found</div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div key={order._id} className="order-item">
              <img src={assets.parcel_icon} alt="Order" />
              <div className="order-details">
                <p className="order-item-food">
                  {order.cartItems?.map((item, idx) => (
                    <span key={idx}>
                      {item.name} x {item.quantity}
                      {idx < order.cartItems.length - 1 ? ", " : ""}
                    </span>
                  )) || 'No items'}
                </p>
                <p className="order-item-name">
                  {order.deliveryInfo?.firstName} {order.deliveryInfo?.lastName}
                </p>
                <div className="order-item-address">
                  <p>{order.deliveryInfo?.street},</p>
                  <p>{order.deliveryInfo?.city}, {order.deliveryInfo?.zipcode}</p>
                </div>
                <p className='order-item-phone'>{order.deliveryInfo?.phone}</p>
                {order.deliveryInfo?.suggestion && (
                  <p className='order-item-suggestion'><strong>Suggestion:</strong> {order.deliveryInfo.suggestion}</p>
                )}
                <div className="payment-info">
                  <p><strong>Order Date:</strong> {order.orderPlacedAt ? new Date(order.orderPlacedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="order-summary">
                <p>Items: {order.totalItems || 0}</p>
                <p>रु{order.totalPrice || 0}</p>
                <div className={`status-badge ${order.orderStatus}`}>
                  {order.orderStatus === 'pending' && 'In Queue'}
                  {order.orderStatus === 'confirmed' && 'Confirmed'}
                  {order.orderStatus === 'preparing' && 'Processing'}
                  {order.orderStatus === 'out_for_delivery' && 'Out for Delivery'}
                  {order.orderStatus === 'delivered' && 'Delivered'}
                  {order.orderStatus === 'cancelled' && 'Cancelled'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="view-orders-btn" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );
};

export default Order;
