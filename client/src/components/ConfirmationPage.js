import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ConfirmationPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get order details from sessionStorage
    const storedDetails = sessionStorage.getItem('orderDetails');

    if (storedDetails) {
      const details = JSON.parse(storedDetails);

      // Verify this is a confirmation type
      if (details.type === 'confirmation') {
        setOrderDetails({
          sku: details.sku,
          quantity: details.quantity,
          reservationId: details.reservationId,
          timestamp: new Date(details.timestamp)
        });

        // Clear the stored data after use for security
        sessionStorage.removeItem('orderDetails');
      } else {
        // Wrong page type, redirect
        navigate('/products');
      }
    } else {
      // No order details found, redirect after a short delay
      setTimeout(() => navigate('/products'), 2000);
    }
  }, [navigate]);

  if (!orderDetails) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-card error">
          <h2>❌ Invalid Access</h2>
          <p>No order details found. Redirecting to products...</p>
          <Link to="/products" className="back-btn">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-card success">
        <div className="success-icon">✅</div>
        <h2>Order Confirmed Successfully!</h2>

        <div className="order-summary">
          <h3>Order Details</h3>
          <div className="order-info">
            <p><strong>Product SKU:</strong> {orderDetails.sku}</p>
            <p><strong>Quantity:</strong> {orderDetails.quantity}</p>
            <p><strong>Order ID:</strong> {orderDetails.reservationId}</p>
            <p><strong>Confirmed At:</strong> {orderDetails.timestamp.toLocaleString()}</p>
          </div>
        </div>

        <div className="confirmation-message">
          <p>🎉 Thank you for your purchase!</p>
          <p>Your order has been successfully processed and confirmed.</p>
          <p>You will receive a confirmation email shortly.</p>
        </div>

        <div className="confirmation-actions">
          <Link to="/products" className="continue-btn">
            Continue Shopping
          </Link>
          <button
            className="print-btn"
            onClick={() => window.print()}
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;