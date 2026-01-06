const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');

// GET /inventory - Get all products
router.get('/', (req, res) => {
  try {
    const products = inventoryService.getAllProducts();
    res.json({
      success: true,
      products: products.map(p => ({
        sku: p.sku,
        name: p.name,
        availableQuantity: p.availableQuantity,
        totalQuantity: p.totalQuantity,
        price: p.price,
        category: p.category
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /inventory/reserve
router.post('/reserve', (req, res) => {
  try {
    const { sku, quantity = 1, userId } = req.body;

    if (!sku || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: sku, userId'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        error: 'Quantity must be greater than 0'
      });
    }

    const reservation = inventoryService.reserveInventory(sku, quantity, userId);

    res.status(201).json({
      success: true,
      reservation: {
        reservationId: reservation.reservationId,
        sku: reservation.sku,
        quantity: reservation.quantity,
        expiresAt: reservation.expiresAt,
        status: reservation.status
      }
    });
  } catch (error) {
    if (error.message === 'Insufficient inventory') {
      return res.status(409).json({
        error: 'Insufficient inventory available'
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /inventory/{sku}
router.get('/:sku', (req, res) => {
  try {
    const { sku } = req.params;
    const product = inventoryService.getInventory(sku);

    res.json({
      sku: product.sku,
      name: product.name,
      availableQuantity: product.availableQuantity,
      totalQuantity: product.totalQuantity,
      price: product.price,
      category: product.category
    });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;