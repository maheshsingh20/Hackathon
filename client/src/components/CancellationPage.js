import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CancellationPage = () => {
  const [cancellationDetails, setCancellationDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get cancellation details from sessionStorage
    const storedDetails = sessionStorage.getItem('orderDetails');

    if (storedDetails) {
      const details = JSON.parse(storedDetails);

      // Verify this is a cancellation type
      if (details.type === 'cancellation') {
        setCancellationDetails({
          sku: details.sku,
          quantity: details.quantity,
          reservationId: details.reservationId,
          reason: details.reason,
          timestamp: new Date(details.timestamp)
        });

        // Clear the stored data after use for security
        sessionStorage.removeItem('orderDetails');
      } else {
        // Wrong page type, redirect
        navigate('/products');
      }
    } else {
      // No cancellation details found, redirect after a short delay
      setTimeout(() => navigate('/products'), 2000);
    }
  }, [navigate]);

  if (!cancellationDetails) {
    return (
      <div className="cancellation-page">
        <div className="cancellation-card error">
          <h2>❌ Invalid Access</h2>
          <p>No cancellation details found. Redirecting to products...</p>
          <Link to="/products" className="back-btn">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cancellation-page">
      <div className="cancellation-card cancelled">
        <div className="cancel-icon">🚫</div>
        <h2>Reservation Cancelled</h2>

        <div className="cancellation-summary">
          <h3>Cancellation Details</h3>
          <div className="cancellation-info">
            <p><strong>Product SKU:</strong> {cancellationDetails.sku}</p>
            <p><strong>Quantity:</strong> {cancellationDetails.quantity}</p>
            <p><strong>Reservation ID:</strong> {cancellationDetails.reservationId}</p>
            <p><strong>Reason:</strong> {cancellationDetails.reason}</p>
            <p><strong>Cancelled At:</strong> {cancellationDetails.timestamp.toLocaleString()}</p>
          </div>
        </div>

        <div className="cancellation-message">
          <p>Your reservation has been successfully cancelled.</p>
          <p>The inventory has been released and is now available for other customers.</p>
          <p>No charges have been made to your account.</p>
        </div>

        <div className="cancellation-actions">
          <Link to="/products" className="continue-btn">
            Browse Products
          </Link>
          <Link to={`/product/${cancellationDetails.sku}`} className="retry-btn">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CancellationPage;