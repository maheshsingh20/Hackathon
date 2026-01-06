// In-memory data store with Maps for better performance
const productsMap = new Map([
  ['LAPTOP-001', { sku: 'LAPTOP-001', name: 'Gaming Laptop Pro', totalQuantity: 5, availableQuantity: 3, price: 1299.99, category: 'Electronics' }],
  ['PHONE-001', { sku: 'PHONE-001', name: 'iPhone 15 Pro', totalQuantity: 15, availableQuantity: 2, price: 999.99, category: 'Electronics' }],
  ['TABLET-001', { sku: 'TABLET-001', name: 'iPad Air', totalQuantity: 8, availableQuantity: 1, price: 599.99, category: 'Electronics' }],
  ['HEADPHONES-001', { sku: 'HEADPHONES-001', name: 'AirPods Pro', totalQuantity: 20, availableQuantity: 0, price: 249.99, category: 'Audio' }],
  ['WATCH-001', { sku: 'WATCH-001', name: 'Apple Watch Series 9', totalQuantity: 12, availableQuantity: 4, price: 399.99, category: 'Wearables' }],
  ['CAMERA-001', { sku: 'CAMERA-001', name: 'Canon EOS R5', totalQuantity: 3, availableQuantity: 1, price: 3899.99, category: 'Photography' }],
  ['KEYBOARD-001', { sku: 'KEYBOARD-001', name: 'Mechanical Gaming Keyboard', totalQuantity: 25, availableQuantity: 8, price: 149.99, category: 'Accessories' }],
  ['MOUSE-001', { sku: 'MOUSE-001', name: 'Wireless Gaming Mouse', totalQuantity: 30, availableQuantity: 12, price: 79.99, category: 'Accessories' }],
  ['MONITOR-001', { sku: 'MONITOR-001', name: '4K Gaming Monitor 27"', totalQuantity: 6, availableQuantity: 2, price: 549.99, category: 'Displays' }],
  ['SPEAKER-001', { sku: 'SPEAKER-001', name: 'Bluetooth Speaker', totalQuantity: 18, availableQuantity: 6, price: 129.99, category: 'Audio' }],
  ['CONSOLE-001', { sku: 'CONSOLE-001', name: 'PlayStation 5', totalQuantity: 4, availableQuantity: 1, price: 499.99, category: 'Gaming' }],
  ['CONTROLLER-001', { sku: 'CONTROLLER-001', name: 'Wireless Game Controller', totalQuantity: 15, availableQuantity: 5, price: 69.99, category: 'Gaming' }]
]);

const reservationsMap = new Map();
let reservations = [];

class InventoryService {
  getAllProducts() {
    return Array.from(productsMap.values());
  }

  getInventory(sku) {
    const product = productsMap.get(sku);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  reserveInventory(sku, quantity, userId) {
    // Check for existing active reservation (idempotent)
    const existingKey = `${sku}-${userId}`;
    const existingReservation = reservationsMap.get(existingKey);

    if (existingReservation && existingReservation.status === 'active' && existingReservation.expiresAt > new Date()) {
      return existingReservation;
    }

    // Get product and check availability
    const product = productsMap.get(sku);
    if (!product || product.availableQuantity < quantity) {
      throw new Error('Insufficient inventory');
    }

    // Atomic inventory update
    product.availableQuantity -= quantity;

    // Create optimized reservation
    const reservationId = `${sku}-${userId}-${Date.now()}`;
    const reservation = {
      reservationId,
      sku,
      userId,
      quantity,
      status: 'active',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      createdAt: new Date()
    };

    reservationsMap.set(existingKey, reservation);
    reservations.push(reservation);
    return reservation;
  }

  releaseReservation(reservationId, reason = 'cancelled') {
    const reservation = reservations.find(r => r.reservationId === reservationId && r.status === 'active');

    if (!reservation) {
      throw new Error('Reservation not found or already processed');
    }

    // Update status and release inventory
    reservation.status = reason;
    const product = productsMap.get(reservation.sku);
    if (product) {
      product.availableQuantity += reservation.quantity;
    }

    // Remove from active reservations map
    const key = `${reservation.sku}-${reservation.userId}`;
    reservationsMap.delete(key);
  }

  confirmReservation(reservationId) {
    const reservation = reservations.find(r =>
      r.reservationId === reservationId &&
      r.status === 'active' &&
      r.expiresAt > new Date()
    );

    if (!reservation) {
      throw new Error('Reservation not found or expired');
    }

    reservation.status = 'confirmed';
    const key = `${reservation.sku}-${reservation.userId}`;
    reservationsMap.delete(key);
  }
}

module.exports = new InventoryService();