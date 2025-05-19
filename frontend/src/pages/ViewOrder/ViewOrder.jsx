import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ViewOrder.css';

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
        <p className="no-orders">No orders found.</p>
      ) : (
        <div className="table-container">
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.orderPlacedAt ? new Date(order.orderPlacedAt).toLocaleString() : 'N/A'}</td>
                  <td>रु{order.totalPrice}</td>
                  <td>
                    <div className="order-items">
                      {(order.cartItems || []).map((item, idx) => (
                        <div key={idx} className="order-item">
                          <img src={item.image} alt={item.name} className="order-item-img" />
                          <span>{item.name} x {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="view-orders-btn" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );
};

export default Order;
