import Jwt from 'jsonwebtoken';
import axios from 'axios';

// Middleware to verify JWT token
const fetchUser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: No token provided' });
  }

  try {
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assign decoded payload directly to req.user
    console.log('Decoded JWT:', decoded);
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid Token' });
  }
};

// Function to call Khalti API
const callKhaltiApi = async (url, method, data) => {  
  const options = {
    method: method,
    url: 'https://dev.khalti.com/api/v2/epayment/initiate/',
    headers: {
      'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      // Change these URLs to match the route handler in the backend
      "return_url": `${url}/complete-khalti-payment`,
      "cancel_url": `${url}/complete-khalti-payment?status=failed`,
      "website_url": process.env.FRONTEND_URL || "http://localhost:5172",
      "amount": data.totalPrice,
      "purchase_order_id": data.orderId,
      "purchase_order_name": data.orderName,
      "customer_info": {
        "name": data.customerName,
        "email": data.customerEmail,
        "phone": data.customerPhone,
      }
    })
  };

  try {
    const response = await axios.request(options);
    console.log('Khalti API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error calling Khalti API:', error.response?.data || error.message);
    throw new Error(`Khalti API error: ${error.response?.status || 'Unknown'} - ${error.response?.data?.detail || error.message}`);
  }
};

export { fetchUser, callKhaltiApi };