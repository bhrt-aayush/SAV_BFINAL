import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import axios from 'axios'
import dotenv from 'dotenv'
import { callKhaltiApi } from "./helper.js";
import PurchasedItem from "../models/paymentModel.js";
import { sendOTPEmail } from '../utils/emailService.js';
import crypto from 'crypto';
dotenv.config();

// Generate OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

//login user
export const loginUser = async (req,res) =>{
    const {email, password} = req.body;
    try {
        console.log('Login attempt for email:', email);

        // Find user
        const user = await userModel.findOne({email});
        if(!user){
            console.log('User not found for email:', email);
            return res.json({success:false, message:'User does not exist'}) 
        }

        console.log('User found:', {
            id: user._id,
            email: user.email,
            isVerified: user.isVerified
        });

        // Check if user is verified
        if (!user.isVerified) {
            console.log('User not verified:', email);
            return res.json({ success: false, message: 'Please verify your email first' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);

        if(!isMatch){
            console.log('Invalid password for user:', email);
            return res.json({success:false, message:'Invalid credentials'})
        }

        // Generate JWT token
        const token = createToken(user._id);
        
        // Return success with token and user info
        res.json({
            success: true,
            token,
            user: {
                name: user.name,
                email: user.email,
                id: user._id
            }
        });
    } catch (error) {
        console.log(error)
        res.json({success:false, message:'Error'})
    }
}

//verify OTP
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        console.log('Verifying OTP for email:', email);
        console.log('Received OTP:', otp);

        // First check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.json({ success: false, message: 'User not found' });
        }

        // Check if OTP is expired
        if (user.verificationTokenExpires < Date.now()) {
            console.log('OTP expired for user:', email);
            return res.json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        // Compare OTPs
        console.log('Stored OTP:', user.verificationToken);
        console.log('Received OTP:', otp);
        
        if (user.verificationToken !== otp) {
            console.log('OTP mismatch for user:', email);
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        // OTP is valid
        console.log('OTP verified successfully for user:', email);
        
        // Update user verification status
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        // Create token
        const token = createToken(user._id);
        
        res.json({
            success: true,
            token,
            user: {
                name: user.name,
                email: user.email,
                id: user._id
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.json({ success: false, message: 'Error verifying OTP' });
    }
};

const createToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

//register user
export const registerUser = async (req, res) =>{
    const {name,password,email} = req.body;
    try {
        console.log('Starting registration for email:', email);

        // checking is user already exists
        const exists = await userModel.findOne({email});
        if(exists){
            console.log('User already exists:', email);
            return res.json({success:false, message:'User already exists'})
        }

        //validating email format and strong password
        if(!validator.isEmail(email)){
            console.log('Invalid email format:', email);
            return res.json({success:false, message:'Please enter a valid email'})
        }

        if(password.length<8){
            console.log('Password too short for email:', email);
            return res.json({success:false, message:'Please enter a strong password'})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt);

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        console.log('Generated OTP for registration:', otp);

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword,
            PurchasedItems:[],
            isVerified: false,
            verificationToken: otp,
            verificationTokenExpires: otpExpires
        });

        const user = await newUser.save();
        console.log('User saved with OTP:', user.verificationToken);

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            console.log('Failed to send OTP email to:', email);
            return res.json({ success: false, message: 'Failed to send OTP' });
        }

        console.log('Registration successful, OTP sent to:', email);
        res.json({ success: true, message: 'OTP sent to your email', email });
    } catch (error) {
        console.error('Registration error:', error);
        res.json({success:false, message:'Error during registration'})
    }
}

// Resend verification OTP
export const resendVerification = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (user.isVerified) {
            return res.json({ success: false, message: 'Email already verified' });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = Date.now() + 10 * 60 * 1000;
        
        user.verificationToken = otp;
        user.verificationTokenExpires = otpExpires;
        await user.save();

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            return res.json({ success: false, message: 'Failed to send OTP' });
        }

        res.json({ success: true, message: 'New OTP sent to your email' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Error resending OTP' });
    }
};

export async function initializeKhaltiPayment(url,details) {
  const headersList = {
    "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
  };

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
    method: "POST",
    headers: headersList,
    data: details,
  };

  try {
        const response = await callKhaltiApi(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      'POST',
      {
        totalPrice: details.totalPrice * 100,
        orderId: details.orderId,
        orderName: details.orderName,
        customerName: details.customerName,
        customerEmail: details.customerEmail,
        customerPhone: details.customerPhone || ""
      }
    );
    
    console.log('Payment initialized successfully:', response);
    return response;    
  } catch (error) {
    console.error("Error initializing Khalti payment:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      requestData: details,
    });
    
    let errorMessage = `Khalti API error: ${error.response?.status || 'Unknown'} - ${error.response?.data?.message || error.message}`;
    if (error.response?.status === 401) {
      errorMessage = 'Khalti API error: 401 - Invalid or unauthorized Khalti API key';
    }
    throw new Error(errorMessage);
  }
}
export async function verifyKhaltiPayment(pidx) {
  const headersList = {
    "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const bodyContent = { pidx };

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };

  try {
    console.log('Verifying Khalti payment with pidx:', pidx);
    const response = await axios.request(reqOptions);
    console.log('Khalti Verification Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error verifying Khalti payment:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      requestData: bodyContent,
    });
    let errorMessage = `Khalti API error: ${error.response?.status || 'Unknown'} - ${error.response?.data?.message || error.message}`;
    if (error.response?.status === 401) {
      errorMessage = 'Khalti API error: 401 - Invalid or unauthorized Khalti API key';
    }
    throw new Error(errorMessage);
  }
}


// export default {loginUser, registerUser, initializeKhaltiPayment, verifyKhaltiPayment}