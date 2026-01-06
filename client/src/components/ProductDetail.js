import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = ({ userId, onReservation, hasActiveReservation }) => {
  const { sku } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [sku]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/inventory/${sku}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Product not found');
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    try {
      setError('');
      const response = await axios.post('/inventory/reserve', {
        sku,
        quantity,
        userId
      });

      if (response.data.success) {
        onReservation(response.data.reservation);
        navigate('/checkout');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setError('Sorry, this item is out of stock!');
      } else {
        setError('Failed to reserve item. Please try again.');
      }
      await fetchProduct();
    }
  };

  const getStockDisplay = (product) => {
    if (product.availableQuantity === 0) {
      return <span className="stock-out">Out of Stock</span>;
    } else if (product.availableQuantity <= 3) {
      return <span className="stock-low">Only {product.availableQuantity} items left!</span>;
    } else {
      return <span className="stock-info">{product.availableQuantity} available</span>;
    }
  };

  if (loading) return <div className="loading">Loading product...</div>;
  if (error && !product) return <div className="error-message">{error}</div>;

  return (
    <div className="product-detail">
      <Link to="/products" className="back-link">← Back to Products</Link>

      <div className="product-detail-card">
        <h1>{product.name}</h1>
        <div className="product-detail-info">
          <p className="price">${product.price.toLocaleString()}</p>
          <p><strong>SKU:</strong> {product.sku}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Stock:</strong> {getStockDisplay(product)}</p>
          <p><strong>Total Inventory:</strong> {product.totalQuantity}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="reservation-section">
          <div className="quantity-selector">
            <label>Quantity:</label>
            <select
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              disabled={product.availableQuantity === 0 || hasActiveReservation}
            >
              {[...Array(Math.min(product.availableQuantity, 5))].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <button
            className="reserve-btn large"
            onClick={handleReserve}
            disabled={product.availableQuantity === 0 || hasActiveReservation}
          >
            {hasActiveReservation ? 'Reservation Active' :
              product.availableQuantity === 0 ? 'Out of Stock' :
                `Reserve ${quantity} Item${quantity > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;