// PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './PaymentSuccess.css'; // Importing CSS

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!transactionId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Uncomment when API is available
        // const response = await axios.get(`/api/orders/by-transaction/${transactionId}`);
        // setOrderDetails(response.data);
        
        // Placeholder
        setOrderDetails({
          orderId: 'ORD-' + Math.floor(Math.random() * 10000),
          date: new Date().toLocaleDateString(),
          items: []
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Unable to fetch order details. Please check your order history.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [transactionId]);

  return (
    <div className="payment-success-container">
      <div className="payment-card">
        <div className="icon-container">
          <div className="icon-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">Your transaction has been completed successfully.</p>
        <p className="transaction-id">Transaction ID: {transactionId || 'N/A'}</p>

        {isLoading && <p className="loading-text">Loading order details...</p>}

        {error && <div className="error-message">{error}</div>}

        {orderDetails && !isLoading && (
          <div className="order-details">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
            <p><strong>Date:</strong> {orderDetails.date}</p>
            {/* Add more details as needed */}
          </div>
        )}

        <div className="button-group">
          <Link to="/orders" className="btn-primary">View My Orders</Link>
          <Link to="/" className="btn-secondary">Return to Home</Link>
        </div>
      </div>
    </div>
  );
};
