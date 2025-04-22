// PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = async () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Optional: Fetch order details if needed
        // const response = await axios.get(`/api/orders/by-transaction/${transactionId}`);
        // setOrderDetails(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };
    
    if (transactionId) {
      fetchOrderDetails();
    }
  }, [transactionId]);

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Your transaction has been completed successfully.</p>
        <p>Transaction ID: {transactionId}</p>
        
        {orderDetails && (
          <div className="order-details">
            <h2>Order Details</h2>
            {/* Display order details here */}
          </div>
        )}
        
        <div className="action-buttons">
          <Link to="/orders" className="button primary">View My Orders</Link>
        </div>
      </div>
    </div>
  );
};

export {PaymentSuccess};