import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = ({ reservation, onCheckoutComplete, onCancel }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!reservation) {
    return (
      <div className="checkout-page">
        <h2>No Active Reservation</h2>
        <p>You don't have any active reservations.</p>
        <Link to="/products" className="back-link">Browse Products</Link>
      </div>
    );
  }

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await axios.post('/checkout/confirm', {
        reservationId: reservation.reservationId
      });

      if (response.data.success) {
        setMessage('Purchase confirmed successfully!');
        // Store order details in sessionStorage for the confirmation page
        sessionStorage.setItem('orderDetails', JSON.stringify({
          sku: reservation.sku,
          quantity: reservation.quantity,
          reservationId: reservation.reservationId,
          timestamp: Date.now(),
          type: 'confirmation'
        }));

        setTimeout(() => {
          onCheckoutComplete();
          navigate('/confirm');
        }, 1000);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setMessage('Reservation has expired. Please try again.');
        setTimeout(() => {
          onCancel();
          navigate('/products');
        }, 2000);
      } else {
        setMessage('Failed to confirm checkout. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await axios.post('/checkout/cancel', {
        reservationId: reservation.reservationId
      });

      if (response.data.success) {
        setMessage('Reservation cancelled.');
        // Store cancellation details in sessionStorage for the cancellation page
        sessionStorage.setItem('orderDetails', JSON.stringify({
          sku: reservation.sku,
          quantity: reservation.quantity,
          reservationId: reservation.reservationId,
          reason: 'User cancelled',
          timestamp: Date.now(),
          type: 'cancellation'
        }));

        setTimeout(() => {
          onCancel();
          navigate('/cancel');
        }, 1000);
      }
    } catch (error) {
      setMessage('Failed to cancel reservation.');
    }
    setLoading(false);
  };

  const timeLeft = new Date(reservation.expiresAt) - new Date();
  const isExpired = timeLeft <= 0;

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="checkout-card">
        <h3>Reservation Details</h3>
        <div className="reservation-info">
          <p><strong>Product:</strong> {reservation.sku}</p>
          <p><strong>Quantity:</strong> {reservation.quantity}</p>
          <p><strong>Reservation ID:</strong> {reservation.reservationId}</p>
          <p><strong>Status:</strong> {isExpired ? 'Expired' : 'Active'}</p>
        </div>

        {message && (
          <div className={message.includes('success') ? 'success-message' : 'error-message'}>
            {message}
          </div>
        )}

        {!isExpired && (
          <div className="checkout-actions">
            <button
              className="checkout-btn confirm"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Confirm Purchase'}
            </button>
            <button
              className="checkout-btn cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? 'Cancelling...' : 'Cancel Reservation'}
            </button>
          </div>
        )}

        {isExpired && (
          <div className="expired-message">
            <p>This reservation has expired.</p>
            <Link to="/products" className="back-link">Browse Products</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;