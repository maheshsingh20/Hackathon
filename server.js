const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const inventoryRoutes = require('./routes/inventory');
const checkoutRoutes = require('./routes/checkout');
const { cleanupExpiredReservations, initializeData } = require('./services/reservationService');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/inventory', inventoryRoutes);
app.use('/checkout', checkoutRoutes);

// Initialize sample data
initializeData();

// Cleanup expired reservations every minute
cron.schedule('* * * * *', () => {
  cleanupExpiredReservations();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Using in-memory database for demo');
});