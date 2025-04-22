// PaymentFailure.jsx
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown_error';
  
  const getErrorMessage = (reason) => {
    switch (reason) {
      case 'insufficient_balance':
        return 'Your Khalti account has insufficient balance.';
      case 'verification_failed':
        return 'Payment verification failed. Please try again.';
      case 'purchased_item_not_found_or_amount_mismatch':
        return 'There was a problem with your order details.';
      case 'server_error':
        return 'Our server encountered an error processing your payment.';
      default:
        return 'An unknown error occurred during payment processing.';
    }
  };

  return (
    <div className="payment-failure-container">
      <div className="failure-card">
        <div className="failure-icon">✗</div>
        <h1>Payment Failed</h1>
        <p>{getErrorMessage(reason)}</p>
        
        <div className="action-buttons">
          <Link to="/cart" className="button primary">Return to Cart</Link>
          <Link to="/contact" className="button secondary">Contact Support</Link>
        </div>
      </div>
    </div>
  );
};

export {PaymentFailure};