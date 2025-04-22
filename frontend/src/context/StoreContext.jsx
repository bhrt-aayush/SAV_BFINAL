import { createContext, useState, useEffect } from "react";
import { fetchFoods} from "../../public/assets/frontend_assets/assets.js";
import axios from 'axios';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [userInfo, setUserInfo] = useState({});
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [foodList, setFoodList] = useState([]); // Add state for food list

    // Fetch food list using useEffect
    useEffect(() => {
        const fetchFoodData = async () => {
            try {
                const response = await fetchFoods();
                setFoodList(response || []);
            } catch (error) {
                console.error('Error fetching food list:', error);
                setFoodList([]);
            }
        };
        fetchFoodData();
    }, []);


    const addToCart = (itemId) => {
        if (!token) {
            setShowLoginPrompt(true);
            return;
        }
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] ? prev[itemId] + 1 : 1,
        }));
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] > 1 ? prev[itemId] - 1 : 0,
        }));
    };

    const getTotalCartAmount = () => {
        return Object.entries(cartItems).reduce((total, [id, qty]) => {
            const item = foodList.find((product) => product._id === id);
            return item ? total + item.price * qty : total;
        }, 0);
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:4000/api/user/login', { email, password });
            const { token, user, success } = response.data;

            if (success && token) {
                setToken(token);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                return { success: true };
            } else {
                return { success: false, message: response.data.message || 'Login failed' };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
    };
    

    const register = async (name, email, password) => {
        try {
            const response = await axios.post('http://localhost:4000/api/user/register', { name, email, password });
            const { token } = response.data;
            setToken(token);
            localStorage.setItem('token', token);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        window.location.href = "/";
        
    };

    const verifyOTP = async (email, otp) => {
        try {
            const response = await axios.post('http://localhost:4000/api/user/verify-otp', { email, otp });
            const { token, user, success } = response.data;

            if (success && token) {
                setToken(token);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                return { success: true };
            } else {
                return { success: false, message: 'Invalid OTP' };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'OTP verification failed' };
        }
    };

    const contextValue = {
        food_list: foodList,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        userInfo,
        setUserInfo,
        token,
        login,
        register,
        logout,
        user,
        showLoginPrompt,
        setShowLoginPrompt,
        verifyOTP,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
