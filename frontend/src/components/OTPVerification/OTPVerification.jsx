import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './OTPVerification.css';

const OTPVerification = ({ email, onClose }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { verifyOTP } = useContext(StoreContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const result = await verifyOTP(email, otp);
            if (result.success) {
                setSuccess('OTP verified successfully!');
                setTimeout(() => {
                    onClose();
                    navigate('/');
                }, 1500);
            } else {
                setError(result.message || 'Invalid OTP');
            }
        } catch (err) {
            console.error('OTP verification error:', err);
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="otp-verification">
            <div className="otp-container">
                <h2>OTP Verification</h2>
                <p>Please enter the 4-digit code sent to your email</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="otp-input">
                        <input
                            type="text"
                            maxLength="4"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <button type="submit" className="verify-btn">
                        Verify OTP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OTPVerification; 