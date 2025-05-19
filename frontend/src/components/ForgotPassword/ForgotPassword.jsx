import React, { useState } from 'react';
import './ForgotPassword.css';
import { assets } from '../../../public/assets/frontend_assets/assets';

const ForgotPassword = ({ onClose }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:4000/api/user/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();
            
            if (data.success) {
                setSuccess('OTP sent to your email');
                setStep(2);
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Error sending OTP. Please try again.');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:4000/api/user/verify-password-reset-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp
                })
            });
            const data = await response.json();
            
            if (data.success) {
                setSuccess('OTP verified successfully');
                setStep(3);
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Error verifying OTP. Please try again.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await fetch('http://localhost:4000/api/user/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp,
                    newPassword: formData.newPassword
                })
            });
            const data = await response.json();
            
            if (data.success) {
                setSuccess('Password reset successful');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Error resetting password. Please try again.');
        }
    };

    return (
        <div className="forgot-password-popup">
            <div className="forgot-password-container">
                <div className="forgot-password-title">
                    <h2>Reset Password</h2>
                    <img onClick={onClose} src={assets.cross_icon} alt="Close" />
                </div>

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                {step === 1 && (
                    <form onSubmit={handleRequestOTP}>
                        <div className="forgot-password-inputs">
                            <input
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={onChangeHandler}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn">Send OTP</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="forgot-password-inputs">
                            <input
                                name="otp"
                                type="text"
                                placeholder="Enter OTP"
                                value={formData.otp}
                                onChange={onChangeHandler}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn">Verify OTP</button>
                        <p className="resend-otp">
                            Didn't receive OTP? <span onClick={handleRequestOTP}>Resend</span>
                        </p>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <div className="forgot-password-inputs">
                            <input
                                name="newPassword"
                                type="password"
                                placeholder="New Password"
                                value={formData.newPassword}
                                onChange={onChangeHandler}
                                required
                            />
                            <input
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={onChangeHandler}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn">Reset Password</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword; 