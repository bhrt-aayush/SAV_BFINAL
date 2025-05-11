import React, { useState, useContext } from 'react'
import Navbar from './components/Navbar/Navbar';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import StoreContextProvider, { StoreContext } from './context/StoreContext';
import Checkout from './pages/Confirm/Confirm';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import { PaymentSuccess } from './components/Khalti/Success';
import { PaymentFailure } from './components/Khalti/failure';
import Order from './pages/Order/Order';

const AppContent = () => {
  const [showLogin, setShowLogin] = useState(false);
  const { showLoginPrompt, setShowLoginPrompt } = useContext(StoreContext);

  React.useEffect(() => {
    if (showLoginPrompt) {
      setShowLogin(true);
      setShowLoginPrompt(false);
    }
  }, [showLoginPrompt, setShowLoginPrompt]);

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/placeorder' element={<PlaceOrder />} />
          <Route path='/confirm' element={<Checkout />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/payment-success" element={<PaymentSuccess/>}/>  
          <Route path="/payment-failure" element={<PaymentFailure />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <StoreContextProvider>
      <AppContent />
    </StoreContextProvider>
  );
};

export default App;
