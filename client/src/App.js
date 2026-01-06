import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ReservationTimer from './components/ReservationTimer';
import CheckoutPage from './components/CheckoutPage';
import ConfirmationPage from './components/ConfirmationPage';
import CancellationPage from './components/CancellationPage';
import './App.css';

function App() {
  const [currentReservation, setCurrentReservation] = useState(null);
  const [userId] = useState(`user-${Math.random().toString(36).substr(2, 9)}`);

  const handleReservation = (reservation) => {
    setCurrentReservation(reservation);
  };

  const handleReservationExpired = () => {
    setCurrentReservation(null);
  };

  const handleCheckoutComplete = () => {
    setCurrentReservation(null);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Smart Inventory System</h1>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            {currentReservation && <Link to="/checkout">Checkout</Link>}
          </nav>
          <p>User ID: {userId}</p>
        </header>

        {currentReservation && (
          <ReservationTimer
            reservation={currentReservation}
            onExpired={handleReservationExpired}
            onCheckoutComplete={handleCheckoutComplete}
          />
        )}

        <Routes>
          <Route path="/" element={
            <ProductList
              userId={userId}
              onReservation={handleReservation}
              hasActiveReservation={!!currentReservation}
            />
          } />
          <Route path="/products" element={
            <ProductList
              userId={userId}
              onReservation={handleReservation}
              hasActiveReservation={!!currentReservation}
            />
          } />
          <Route path="/product/:sku" element={
            <ProductDetail
              userId={userId}
              onReservation={handleReservation}
              hasActiveReservation={!!currentReservation}
            />
          } />
          <Route path="/checkout" element={
            <CheckoutPage
              reservation={currentReservation}
              onCheckoutComplete={handleCheckoutComplete}
              onCancel={handleReservationExpired}
            />
          } />
          <Route path="/confirm" element={<ConfirmationPage />} />
          <Route path="/cancel" element={<CancellationPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;