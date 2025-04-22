import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import './PlaceOrder.css';
import { StoreContext } from '../../context/StoreContext';

const PlaceOrder = () => {
  const { getTotalCartAmount, setUserInfo } = useContext(StoreContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    zipcode: '',
    phone: '',
    suggestion: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserInfo(userData); // Save data in context
    navigate('/order'); // Redirect to Checkout page
  };

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' type="text" placeholder='First Name' onChange={handleChange} />
          <input required name='lastName' type="text" placeholder='Last Name' onChange={handleChange} />
        </div>
        <input required name='email' type="email" placeholder='Email address' onChange={handleChange} />
        <input required name='street' type="text" placeholder='Street' onChange={handleChange} />
        <div className="multi-fields">
          <input required name='city' type="text" placeholder='City' onChange={handleChange} />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' type="text" placeholder='Zip code' onChange={handleChange} />
        </div>
        <input required name='phone' type="text" placeholder='Phone' onChange={handleChange} />
        <input name='suggestion' type="text" placeholder='Suggestion' onChange={handleChange} />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>रु{getTotalCartAmount()}</p>
          </div>
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>रु{getTotalCartAmount() === 0 ? 0 : 50}</p>
          </div>
          <div className="cart-total-details">
            <b>Total:</b>
            <b>रु{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 50}</b>
          </div>
          <button type="submit">CONTINUE</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
