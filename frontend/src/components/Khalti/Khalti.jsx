import React, { useState } from 'react';
import axios from 'axios';

const KhaltiPayment = ({ cartItems, totalPrice }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to make a payment');
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/initialize-khalti`,
        { cartItems, totalPrice },
        {
          headers: {
            'auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Redirect to Khalti payment page
        window.location.href = response.data.payment.payment_url;
      } else {
        setError(response.data.message || 'Failed to initialize payment');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your payment');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="khalti-payment-container">
      {error && <div className="error-message">{error}</div>}
      
      <button
        className="khalti-payment-button"
        onClick={handlePayment}
        disabled={loading || cartItems.length === 0}
      >
        {loading ? 'Processing...' : 'Pay with Khalti'}
      </button>
      
      <p className="payment-note">
        You will be redirected to Khalti to complete your payment of NPR {totalPrice}.
      </p>
    </div>
  );
};

export default KhaltiPayment;