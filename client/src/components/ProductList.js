import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductList = ({ userId, onReservation, hasActiveReservation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/inventory');
      if (response.data.success) {
        setProducts(response.data.products);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const refreshProduct = async (sku) => {
    try {
      const response = await axios.get(`/inventory/${sku}`);
      setProducts(prev => prev.map(p =>
        p.sku === sku ? { ...p, ...response.data } : p
      ));
    } catch (error) {
      console.error('Error refreshing product:', error);
    }
  };

  const handleReserve = async (sku, quantity = 1) => {
    try {
      setError('');
      const response = await axios.post('/inventory/reserve', {
        sku,
        quantity,
        userId
      });

      if (response.data.success) {
        onReservation(response.data.reservation);
        await refreshProduct(sku);
        navigate('/checkout');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        setError('Sorry, this item is out of stock!');
      } else {
        setError('Failed to reserve item. Please try again.');
      }
      await refreshProduct(sku);
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

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div>
      <h2>Available Products</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="product-grid">
        {products.map(product => (
          <div key={product.sku} className="product-card">
            <Link to={`/product/${product.sku}`} className="product-link">
              <h3>{product.name}</h3>
            </Link>
            <div className="product-info">
              <p className="price">${product.price.toLocaleString()}</p>
              <p>SKU: {product.sku}</p>
              <p>{getStockDisplay(product)}</p>
            </div>
            <div className="product-actions">
              <Link to={`/product/${product.sku}`} className="view-btn">
                View Details
              </Link>
              <button
                className="reserve-btn"
                onClick={() => handleReserve(product.sku)}
                disabled={product.availableQuantity === 0 || hasActiveReservation}
              >
                {hasActiveReservation ? 'Reservation Active' :
                  product.availableQuantity === 0 ? 'Out of Stock' : 'Reserve Item'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;