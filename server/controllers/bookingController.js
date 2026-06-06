const Booking = require('../models/Booking');
const Event = require('../models/Event');
const qrcode = require('qrcode');
const { logAudit } = require('../middleware/auditLogger');

exports.createBooking = async (req, res) => {
    try {
        const { eventId } = req.body;
        
        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Simulate Dummy Payment processing
        const paymentStatus = 'Completed'; 

        const booking = await Booking.create({
            eventId,
            userId: req.user.id,
            paymentStatus
        });

        // Generate QR Code containing booking info
        const qrData = JSON.stringify({ bookingId: booking._id, eventId, userId: req.user.id });
        const qrCodeUrl = await qrcode.toDataURL(qrData);

        booking.qrCodeUrl = qrCodeUrl;
        await booking.save();

        // Log audit
        await logAudit('BOOKING_CONFIRMED', req.user.id, `Booked ticket for event: "${event.title}" (Booking ID: ${booking._id})`);

        res.status(201).json({ message: 'Booking successful', booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id }).populate('eventId');
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        let bookings;
        if (req.user.role === 'Admin') {
            bookings = await Booking.find().populate('eventId userId');
        } else if (req.user.role === 'Organizer') {
            const organizerEvents = await Event.find({ organizerId: req.user.id });
            const eventIds = organizerEvents.map(e => e._id);
            bookings = await Booking.find({ eventId: { $in: eventIds } }).populate('eventId userId');
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.toggleCheckIn = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Ensure organizer owns the event or user is Admin
        if (req.user.role !== 'Admin' && booking.eventId.organizerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.isCheckedIn = !booking.isCheckedIn;
        await booking.save();

        // Log audit
        await logAudit(
            booking.isCheckedIn ? 'ATTENDEE_CHECKED_IN' : 'ATTENDEE_CHECKIN_CANCELLED',
            req.user.id,
            `${booking.isCheckedIn ? 'Checked-in' : 'Cancelled check-in for'} booking ID ${booking._id} on event "${booking.eventId?.title}"`
        );

        res.status(200).json({ message: `Check-in status updated successfully`, booking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Ensure booking belongs to the logged in user or admin
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Booking.findByIdAndDelete(req.params.id);

        // Log audit
        await logAudit('BOOKING_CANCELLED', req.user.id, `Cancelled booking registration for event "${booking.eventId?.title || 'Event'}" (Booking ID: ${booking._id})`);

        res.status(200).json({ message: 'Booking registration cancelled successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
