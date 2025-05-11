import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Confirm.css';
import axios from 'axios';

const Checkout = () => {
    const { userInfo, getTotalCartAmount, cartItems, food_list } = useContext(StoreContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    
    // API URL - could be set in .env
    const API_URL = 'http://localhost:4000/api/user';

    // Calculate total with delivery fee
    const totalAmount = getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 50;

    // Prepare cart items for Khalti API
    const prepareCartItems = () => {
        const items = [];
        
        food_list.forEach(item => {
            if (cartItems[item._id] > 0) {
                items.push({
                    productId: item._id,
                    quantity: cartItems[item._id],
                    
                });
            }
        });
        
        return items;
    };

    // Handle Khalti payment initiation
    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Get token from local storage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('You must be logged in to make a payment');
            }
            
            const preparedCartItems = prepareCartItems();
            
            if (preparedCartItems.length === 0) {
                throw new Error('Your cart is empty');
            }
            
            console.log("Starting payment process with token:", token);
            setPaymentStatus('Initializing payment...');
            
            // Call backend to initialize payment
            const response = await axios.post(
                `${API_URL}/initialize-khalti`,
                { 
                    cartItems: preparedCartItems, 
                    totalPrice: totalAmount 
                },
                {
                    headers: {
                        'auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log("Payment response:", response.data);
            
            if (response.data.success && response.data.payment) {
                setPaymentStatus('Redirecting to payment gateway...');
                
                // Store order details in localStorage for post-payment reference
                localStorage.setItem('pendingOrderDetails', JSON.stringify({
                    orderDetails: response.data.orderDetails,
                    orderId: response.data.purchasedItem._id,
                    amount: totalAmount
                }));
                
                // Redirect to Khalti payment page
                window.location.href = response.data.payment.payment_url;
            } else {
                setError(response.data.message || 'Failed to initialize payment');
                setPaymentStatus('Payment initialization failed');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.message || err.message || 'An error occurred while processing your payment');
            setPaymentStatus('Payment error');
        } finally {
            setLoading(false);
        }
    };

    // Check if we're returning from payment
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const transactionId = urlParams.get('transaction_id');
        
        if (transactionId) {
            setPaymentStatus('Payment completed successfully');
            // Could fetch order details here if needed
        }
        
        const failureReason = urlParams.get('reason');
        if (failureReason) {
            setError(`Payment failed: ${failureReason.replace(/_/g, ' ')}`);
            setPaymentStatus('Payment failed');
        }
    }, []);

    return (
        <div className="checkout-container">
            <h2>Order Summary</h2>
            
            {paymentStatus && (
                <div className={`payment-status ${paymentStatus.includes('failed') ? 'error' : ''}`}>
                    {paymentStatus}
                </div>
            )}

            <div className="checkout-delivery-info">
                <h3>Delivery Information</h3>
                <p><b>Name:</b> {userInfo.firstName} {userInfo.lastName}</p>
                <p><b>Email:</b> {userInfo.email}</p>
                <p><b>Address:</b> {userInfo.street}, {userInfo.city}, {userInfo.zipcode}</p>
                <p><b>Phone:</b> {userInfo.phone}</p>
                <p><b>Suggestion:</b> {userInfo.suggestion}</p>
            </div>

            <div className="checkout-payment-summary">
                <h3>Payment Summary</h3>
                <p><b>Subtotal:</b> रु{getTotalCartAmount()}</p>
                <p><b>Delivery Fee:</b> रु{getTotalCartAmount() === 0 ? 0 : 50}</p>
                <p><b>Total:</b> रु{totalAmount}</p>
            </div>

            <div className="checkout-cart-items">
                <div className="cart-items-header">
                    <p>Items</p>
                    <p>Title</p>
                    <p>Price</p>
                    <p>Description</p>
                    <p>Quantity</p>
                    <p>Total</p>
                </div>
                <br />
                <hr />

                {food_list.map((item, index) => {
                    if (cartItems[item._id] > 0) {
                        return (
                            <div key={index}>
                                <div className="cart-items-header cart-items-row">
                                    <img src={item.image} alt={item.name} />
                                    <p>{item.name}</p>
                                    <p>रु{item.price}</p>
                                    <p>{item.description}</p>
                                    <p>{cartItems[item._id]}</p>
                                    <p>रु{item.price * cartItems[item._id]}</p>
                                </div>
                                <hr />
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            {error && <div className="error-message">{error}</div>}
            
            <button 
                className="checkout-confirm-btn" 
                onClick={handlePayment}
                disabled={loading || getTotalCartAmount() === 0 || paymentStatus === 'Payment completed successfully'}
            >
                {loading ? 'Processing...' : 'Pay with Khalti'}
            </button>
        </div>
    );
};

export default Checkout;