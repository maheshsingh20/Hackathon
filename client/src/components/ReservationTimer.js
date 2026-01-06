import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReservationTimer = ({ reservation, onExpired, onCheckoutComplete }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(reservation.expiresAt).getTime();
      return Math.max(0, expiry - now);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reservation.expiresAt, onExpired]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    try {
      setMessage('');
      const response = await axios.post('/checkout/confirm', {
        reservationId: reservation.reservationId
      });

      if (response.data.success) {
        setMessage('Checkout confirmed successfully!');
        setTimeout(() => onCheckoutComplete(), 2000);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage('Reservation has expired. Please try again.');
        onExpired();
      } else {
        setMessage('Failed to confirm checkout. Please try again.');
      }
    }
  };

  const handleCancel = async () => {
    try {
      setMessage('');
      const response = await axios.post('/checkout/cancel', {
        reservationId: reservation.reservationId
      });

      if (response.data.success) {
        setMessage('Reservation cancelled.');
        setTimeout(() => onExpired(), 1000);
      }
    } catch (error) {
      setMessage('Failed to cancel reservation.');
    }
  };

  if (timeLeft <= 0) {
    return (
      <div className="reservation-timer">
        <h3>Reservation Expired</h3>
        <p>Your reservation has expired. The item has been released back to inventory.</p>
      </div>
    );
  }

  return (
    <div className="reservation-timer">
      <h3>Item Reserved</h3>
      <p>SKU: {reservation.sku} | Quantity: {reservation.quantity}</p>
      <div className={`timer-display ${timeLeft < 60000 ? 'timer-expired' : ''}`}>
        {formatTime(timeLeft)}
      </div>
      <p>Complete your checkout before the timer expires!</p>

      {message && (
        <div className={message.includes('success') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}

      <div className="checkout-actions">
        <button className="checkout-btn" onClick={handleConfirm}>
          Confirm Purchase
        </button>
        <button className="checkout-btn cancel-btn" onClick={handleCancel}>
          Cancel Reservation
        </button>
      </div>
    </div>
  );
};

export default ReservationTimer;