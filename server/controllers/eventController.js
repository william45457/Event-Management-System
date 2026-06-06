const Event = require('../models/Event');
const { logAudit } = require('../middleware/auditLogger');

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, time, location, category, price } = req.body;
        const imageUrl = req.file ? (req.file.path || req.file.filename) : '';

        const event = await Event.create({
            title, description, date, time, location, category, price, imageUrl,
            organizerId: req.user.id
        });

        // Log audit
        await logAudit('EVENT_CREATED', req.user.id, `Created event: "${event.title}" (${event.category}) at ${event.location}`);

        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};
        
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        const events = await Event.find(query).populate('organizerId', 'name email');
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizerId', 'name');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        if (event.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Event.findByIdAndDelete(req.params.id);

        // Log audit
        await logAudit('EVENT_DELETED', req.user.id, `Deleted event: "${event.title}" (Event ID: ${event._id})`);

        res.status(200).json({ message: 'Event removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.organizerId.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, date, time, location, category, price } = req.body;
        
        event.title = title !== undefined ? title : event.title;
        event.description = description !== undefined ? description : event.description;
        event.date = date !== undefined ? date : event.date;
        event.time = time !== undefined ? time : event.time;
        event.location = location !== undefined ? location : event.location;
        event.category = category !== undefined ? category : event.category;
        event.price = price !== undefined ? price : event.price;
        
        if (req.file) {
            event.imageUrl = req.file.path || req.file.filename;
        }

        await event.save();

        // Log audit
        await logAudit('EVENT_UPDATED', req.user.id, `Updated event details for: "${event.title}"`);

        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEventStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.status = status;
        await event.save();

        // Log audit
        await logAudit('EVENT_STATUS_UPDATED', req.user.id, `Updated status of event "${event.title}" to: ${status}`);

        res.status(200).json({ message: `Event status updated to ${status} successfully`, event });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

