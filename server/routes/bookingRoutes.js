const express = require('express');
const { createBooking, getUserBookings, getAllBookings, toggleCheckIn, cancelBooking } = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .post(protect, createBooking)
    .get(protect, restrictTo('Admin', 'Organizer'), getAllBookings);

router.route('/mybookings')
    .get(protect, getUserBookings);

router.route('/:id/checkin')
    .put(protect, restrictTo('Organizer', 'Admin'), toggleCheckIn);

router.route('/:id')
    .delete(protect, cancelBooking);

module.exports = router;
