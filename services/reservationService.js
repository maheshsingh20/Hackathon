// Access to shared data from inventoryService
const inventoryService = require('./inventoryService');

class ReservationService {
  initializeData() {
    console.log('Inventory system initialized with optimized data structure');
    console.log(`${inventoryService.getAllProducts().length} products loaded`);
  }

  cleanupExpiredReservations() {
    const now = new Date();
    let cleanedCount = 0;

    // Get all products for inventory restoration
    const products = inventoryService.getAllProducts();
    const productsMap = new Map(products.map(p => [p.sku, p]));

    // Access reservations array from inventoryService module
    const reservations = require('./inventoryService').reservations || [];

    // Find and process expired reservations
    const expiredReservations = reservations.filter(r =>
      r.status === 'active' && r.expiresAt < now
    );

    for (const reservation of expiredReservations) {
      // Mark as expired
      reservation.status = 'expired';

      // Release inventory back to product
      const product = productsMap.get(reservation.sku);
      if (product) {
        product.availableQuantity += reservation.quantity;
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired reservations`);
    }
  }

  getReservationStatus(reservationId) {
    const reservations = require('./inventoryService').reservations || [];
    const reservation = reservations.find(r => r.reservationId === reservationId);

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Check if expired but not yet cleaned up
    if (reservation.status === 'active' && reservation.expiresAt < new Date()) {
      return { ...reservation, status: 'expired' };
    }

    return reservation;
  }
}

const service = new ReservationService();

module.exports = {
  cleanupExpiredReservations: () => service.cleanupExpiredReservations(),
  getReservationStatus: (id) => service.getReservationStatus(id),
  initializeData: () => service.initializeData()
};