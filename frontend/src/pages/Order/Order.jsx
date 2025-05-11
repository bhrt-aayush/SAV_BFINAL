import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Order.css'; // Import the CSS file

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
        setOrders(response.data.purchasedItems || []);
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
        <p className="no-orders">No orders found.</p>
      ) : (
        <ul className="order-list">
          {orders.map(order => (
            <li key={order._id} className="order-card">
              <div><strong>Order ID:</strong> {order._id}</div>
              <div><strong>Status:</strong> {order.status || order.orderStatus}</div>
              <div><strong>Total:</strong> रु{order.totalPrice}</div>
              <div className="order-items">
                <strong>Items:</strong>
                <ul>
                  {(order.cartItems || []).map((item, idx) => (
                    <li key={idx} className="order-item">
                      <img src={item.image} alt={item.name} className="order-item-img" />
                      <span>{item.name} x {item.quantity} (रु{item.price} each)</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div><strong>Placed At:</strong> {order.orderPlacedAt ? new Date(order.orderPlacedAt).toLocaleString() : 'N/A'}</div>
            </li>
          ))}
        </ul>
      )}
      <button className="view-orders-btn" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );
};

export default Order;
