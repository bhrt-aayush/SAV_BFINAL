import React, { useContext, useState } from 'react'
import './LoginPopup.css';
import { assets } from '../../../public/assets/frontend_assets/assets';
import { StoreContext } from '../../context/StoreContext';
import OTPVerification from '../OTPVerification/OTPVerification';
import ForgotPassword from '../ForgotPassword/ForgotPassword';

const LoginPopup = ({ setShowLogin }) => {
    const [currentState, setCurrentState] = useState('Login');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const { login, register } = useContext(StoreContext);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear messages when user starts typing
        setError('');
        setSuccess('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            if (currentState === 'Login') {
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    setSuccess('Login successful!');
                    setTimeout(() => {
                        setShowLogin(false);
                    }, 1500);
                } else {
                    setError(result.message || 'Invalid email or password');
                }
            } else {
                const result = await register(formData.name, formData.email, formData.password);
                if (result.success) {
                    setSuccess('Account created! Please verify your email.');
                    setShowOTP(true);
                } else {
                    setError(result.message || 'Registration failed. Please try again.');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An error occurred. Please try again.');
        }
    }
    
    return (
        <>
            {showOTP ? (
                <OTPVerification 
                    email={formData.email} 
                    onClose={() => {
                        setShowOTP(false);
                        setShowLogin(false);
                    }} 
                />
            ) : showForgotPassword ? (
                <ForgotPassword 
                    onClose={() => {
                        setShowForgotPassword(false);
                        setShowLogin(false);
                    }}
                />
            ) : (
                <div className='login-popup'>
                    <form onSubmit={handleSubmit} className="login-popup-container">
                        <div className="login-popup-title">
                            <h2>{currentState}</h2>
                            <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                        </div>
                        
                        <div className="login-popup-inputs">
                            {currentState === 'Sign Up' && (
                                <input 
                                    name='name' 
                                    onChange={onChangeHandler} 
                                    value={formData.name} 
                                    type="text" 
                                    placeholder='Your name' 
                                    required 
                                />
                            )}
                            <input 
                                name='email' 
                                onChange={onChangeHandler} 
                                value={formData.email} 
                                type="email" 
                                placeholder='Your email' 
                                required 
                            />
                            <input 
                                name='password' 
                                onChange={onChangeHandler} 
                                value={formData.password} 
                                type="password" 
                                placeholder='Password' 
                                required 
                            />
                        </div>

                        {error && <p className="error-message">{error}</p>}
                        {success && <p className="success-message">{success}</p>}

                        <button type='submit' className="submit-btn">
                            {currentState === 'Sign Up' ? 'Create account' : 'Login'}
                        </button>
                        
                        {currentState === 'Login' && (
                            <p className="forgot-password">
                                Forgot password? <span onClick={() => setShowForgotPassword(true)}>Click here</span>
                            </p>
                        )}
                        
                        {currentState === 'Login' ? (
                            <p>Create a new account? <span onClick={() => setCurrentState('Sign Up')}>Click here</span></p>
                        ) : (
                            <p>Already have an account? <span onClick={() => setCurrentState('Login')}>Login here</span></p>
                        )}
                    </form>
                </div>
            )}
        </>
    );
};

export default LoginPopup;