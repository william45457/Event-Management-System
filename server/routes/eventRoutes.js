const express = require('express');
const { createEvent, getEvents, getEventById, deleteEvent, updateEvent, updateEventStatus } = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
    .get(getEvents)
    .post(protect, restrictTo('Organizer', 'Admin'), upload.single('image'), createEvent);

router.route('/:id')
    .get(getEventById)
    .put(protect, restrictTo('Organizer', 'Admin'), upload.single('image'), updateEvent)
    .delete(protect, restrictTo('Organizer', 'Admin'), deleteEvent);

router.route('/:id/status')
    .put(protect, restrictTo('Admin'), updateEventStatus);

module.exports = router;
