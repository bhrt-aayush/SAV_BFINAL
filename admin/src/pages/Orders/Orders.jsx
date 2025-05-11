import React, { useState, useEffect } from 'react';
import './Orders.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../../../public/assets/admin_assets/assets.js';

const Orders = () => {
  const url = "http://localhost:4000";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Use your admin token
      const response = await axios.get(
        url + '/api/admin/list-all-orders',
        {
          headers: {
            'auth-token': token,
          },
        }
      );
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error fetching orders: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    console.log('Current orders state:', orders);
  }, [orders]);

  const statusHandler = async (event, orderId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value
      }, {
        headers: {
          'auth-token': token,
        },
      });
      if (response.data.success) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? { ...order, orderStatus: event.target.value }
              : order
          )
        );
        toast.success("Order status updated successfully");
      } else {
        toast.error("Failed to update order status: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating order status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='order add'>
      <h3>Order Management</h3>
      {loading && <div className="loading">Loading...</div>}
      {orders.length === 0 ? (
        <div className="no-orders">No orders found</div>
      ) : (
        <div className="order-list">
          {orders.map((order, index) => (
            <div key={order._id || index} className="order-item">
              <img src={assets.parcel_icon} alt="" />
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
                <div className="payment-info">
                   <p><strong>Order Date:</strong> {order.orderPlacedAt ? new Date(order.orderPlacedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="order-summary">
                <p>Items: {order.totalItems || 0}</p>
                <p>रु{order.totalPrice || 0}</p>
                <select
                  onChange={(event) => statusHandler(event, order._id)}
                  value={order.orderStatus || 'pending'}
                  disabled={loading}
                >
                  <option value="pending">In Queue</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Processing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;