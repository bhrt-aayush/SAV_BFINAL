// PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

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
        // Uncomment when API endpoint is ready
        // const response = await axios.get(`/api/orders/by-transaction/${transactionId}`);
        // setOrderDetails(response.data);
        
        // Placeholder: Remove this when API is ready
        setOrderDetails({
          orderId: 'ORD-' + Math.floor(Math.random() * 10000),
          date: new Date().toLocaleDateString(),
          items: [] // Will be populated from API
        });
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Unable to fetch order details. Please check your order history.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [transactionId]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-green-500 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-center text-gray-600 mb-2">Your transaction has been completed successfully.</p>
        <p className="text-center font-medium mb-6">Transaction ID: {transactionId || 'N/A'}</p>
        
        {isLoading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading order details...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {orderDetails && !isLoading && (
          <div className="border-t border-gray-200 pt-4 mb-6">
            <h2 className="text-xl font-semibold mb-3">Order Details</h2>
            <p className="text-gray-700">Order ID: {orderDetails.orderId}</p>
            <p className="text-gray-700">Date: {orderDetails.date}</p>
            {/* Additional order details would go here */}
          </div>
        )}
        
        <div className="flex flex-col space-y-3">
          <Link 
            to="/orders" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center transition-colors duration-200"
          >
            View My Orders
          </Link>
          <Link 
            to="/" 
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded text-center transition-colors duration-200"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
