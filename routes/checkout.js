const express = require('express');
const router = express.Router();
const inventoryService = require('../services/inventoryService');

// POST /checkout/confirm
router.post('/confirm', (req, res) => {
  try {
    const { reservationId } = req.body;

    if (!reservationId) {
      return res.status(400).json({
        error: 'Missing required field: reservationId'
      });
    }

    inventoryService.confirmReservation(reservationId);

    res.json({
      success: true,
      message: 'Checkout confirmed successfully'
    });
  } catch (error) {
    if (error.message === 'Reservation not found or expired') {
      return res.status(404).json({
        error: 'Reservation not found or has expired'
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /checkout/cancel
router.post('/cancel', (req, res) => {
  try {
    const { reservationId } = req.body;

    if (!reservationId) {
      return res.status(400).json({
        error: 'Missing required field: reservationId'
      });
    }

    inventoryService.releaseReservation(reservationId, 'cancelled');

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    if (error.message === 'Reservation not found or already processed') {
      return res.status(404).json({
        error: 'Reservation not found or already processed'
      });
    }

    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;